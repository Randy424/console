#!/usr/bin/env bash
# Copyright Contributors to the Open Cluster Management project

set -euo pipefail
umask 077

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
mode=${1:-all}
case "$mode" in
    all|prepare|test|restore|status) ;;
    -h|--help)
        echo "Usage: $0 [all|prepare|test|restore|status]"
        echo "  all (default): build/deploy this checkout, then run managed ACM/MCE TLS checks"
        echo "  prepare: leave both managed Consoles on this checkout's image"
        echo "  test: check the already prepared images and TLS profile behavior"
        echo "  restore: recover the APIServer profile after an interrupted test"
        echo "  status: wait for master and managed Console recovery without changing the profile"
        exit 0
        ;;
    *) echo "Unknown mode: $mode" >&2; exit 2 ;;
esac

claim_kubeconfig="$HOME/Repositories/cluster-keeper/dependencies/lifeguard/clusterclaims/rbrunopi-groups/kubeconfig"
# A stale global KUBECONFIG is common after the pool rotates credentials.
# Prefer the claim's maintained kubeconfig when it is available locally.
if [[ -n "${TLS_GROUP_KUBECONFIG:-}" ]]; then
    export KUBECONFIG=$TLS_GROUP_KUBECONFIG
elif [[ -f "$claim_kubeconfig" ]]; then
    export KUBECONFIG=$claim_kubeconfig
fi
[[ -f "${KUBECONFIG:-}" ]] || { echo "Set TLS_GROUP_KUBECONFIG to the rbrunopi-groups claim kubeconfig" >&2; exit 2; }

acm_namespace=open-cluster-management
mce_namespace=multicluster-engine
profile_backup=acm47232-tls-profile-backup
registry=${INTERNAL_REGISTRY:-image-registry.openshift-image-registry.svc:5000}
mirror=${DOWNSTREAM_IMAGE_MIRROR:-quay.io:443/acm-d}
wait_seconds=${TLS_GROUP_WAIT_SECONDS:-900}
mcp_wait_seconds=${TLS_GROUP_MCP_WAIT_SECONDS:-1800}
tmp_dir=$(mktemp -d)
profile_guard_active=0
acm_forward_pid=
mce_forward_pid=
acm_port=
mce_port=

log() { printf '[ACM-47232] %s\n' "$*"; }
fail() { printf '[ACM-47232] ERROR: %s\n' "$*" >&2; exit 1; }

stop_forward() {
    local component=$1 pid_var="${1}_forward_pid" port_var="${1}_port" pid
    pid=${!pid_var-}
    if [[ -n "$pid" ]]; then
        kill "$pid" 2>/dev/null || true
        wait "$pid" 2>/dev/null || true
    fi
    printf -v "$pid_var" '%s' ''
    printf -v "$port_var" '%s' ''
}

profile_json() {
    oc get apiserver cluster -o json | jq -cS '.spec.tlsSecurityProfile // null'
}

restore_profile() {
    local backup current original operation deadline
    deadline=$(($(date +%s) + wait_seconds))
    until backup=$(oc get configmap "$profile_backup" -n "$acm_namespace" --ignore-not-found -o json 2>/dev/null); do
        (( $(date +%s) < deadline )) || return 1
        sleep 5
    done
    [[ -n "$backup" ]] || return 0
    printf '%s' "$backup" | jq -er '.data["profile.json"]' > "$tmp_dir/original-profile.json" || return 1
    original=$(jq -cS . "$tmp_dir/original-profile.json") || return 1
    log "Restoring the saved APIServer TLS profile"
    while (( $(date +%s) < deadline )); do
        if current=$(profile_json 2>/dev/null); then
            if [[ "$current" == "$original" ]]; then
                oc delete configmap "$profile_backup" -n "$acm_namespace" --ignore-not-found >/dev/null || return 1
                profile_guard_active=0
                log "Original APIServer TLS profile restored"
                return 0
            fi
            if [[ "$original" == null ]]; then
                jq -n '[{op:"remove",path:"/spec/tlsSecurityProfile"}]' > "$tmp_dir/restore-patch.json"
            else
                operation=replace
                [[ "$current" == null ]] && operation=add
                jq -n --arg op "$operation" --slurpfile value "$tmp_dir/original-profile.json" \
                    '[{op:$op,path:"/spec/tlsSecurityProfile",value:$value[0]}]' > "$tmp_dir/restore-patch.json"
            fi
            oc patch apiserver cluster --type=json --patch-file="$tmp_dir/restore-patch.json" >/dev/null 2>&1 || true
        fi
        sleep 5
    done
    printf '[ACM-47232] ERROR: profile restore timed out; rerun %s restore\n' "$0" >&2
    return 1
}

cleanup() {
    local result=$?
    trap - EXIT
    stop_forward acm
    stop_forward mce
    if [[ "$profile_guard_active" == 1 ]] && ! restore_profile; then result=1; fi
    rm -rf "$tmp_dir"
    exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for required in oc jq go git base64; do
    command -v "$required" >/dev/null || fail "Missing required command: $required"
done
oc whoami >/dev/null || fail "KUBECONFIG cannot authenticate"
log "Cluster: $(oc whoami --show-server) (claim: rbrunopi-groups)"
[[ -n "$(oc get multiclusterhub multiclusterhub -n "$acm_namespace" -o name)" ]] || fail 'ACM is not installed'
[[ -n "$(oc get multiclusterengine multiclusterengine -n "$mce_namespace" -o name)" ]] || fail 'MCE is not installed'
oc explain apiserver.spec.tlsSecurityProfile.custom.groups >/dev/null || fail 'APIServer custom.groups is unavailable'
oc get featuregate cluster -o json | jq -e '[.status.featureGates[]?.enabled[]?.name] | index("TLSGroupPreferences") != null' >/dev/null \
    || fail 'TLSGroupPreferences feature gate is not active'

# The marker survives SIGKILL or a lost terminal. The next invocation restores
# the recorded profile before doing anything else. Run only one copy at a time.
if [[ -n "$(oc get configmap "$profile_backup" -n "$acm_namespace" --ignore-not-found -o name)" ]]; then
    log 'Recovering an interrupted prior run'
    restore_profile || fail 'Could not recover the prior APIServer profile'
fi
[[ "$mode" != restore ]] || { log 'No profile recovery is needed'; exit 0; }

binary="$tmp_dir/console"
probe_binary="$tmp_dir/tls-group-probe"
log 'Building the current checkout for linux/amd64'
(cd "$repo_root/backend" && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -mod=readonly -o "$binary" ./cmd/console)
go build -o "$probe_binary" "$repo_root/scripts/tls-group-probe/main.go"
if command -v sha256sum >/dev/null; then
    binary_sha=$(sha256sum "$binary" | awk '{print $1}')
else
    binary_sha=$(shasum -a 256 "$binary" | awk '{print $1}')
fi
log "Checkout: $(git -C "$repo_root" rev-parse --short HEAD); binary SHA-256: $binary_sha"

component_values() {
    case "$1" in
        acm)
            namespace=$acm_namespace; deployment=console-chart-console-v2
            image_name=acm47232-branch; image_key=console
            operator_deployment=multiclusterhub-operator; operator_image_var=OPERAND_IMAGE_CONSOLE
            operator_kind=multiclusterhub; operator_name=multiclusterhub
            override_annotation=installer.open-cluster-management.io/image-overrides-configmap
            ;;
        mce)
            namespace=$mce_namespace; deployment=console-mce-console
            image_name=mce47232-branch; image_key=console_mce
            operator_deployment=multicluster-engine-operator; operator_image_var=OPERAND_IMAGE_CONSOLE_MCE
            operator_kind=multiclusterengine; operator_name=multiclusterengine
            override_annotation=installer.multicluster.openshift.io/image-overrides-configmap
            ;;
    esac
}

image_name_for() {
    # Distinct names keep this script's images separate from product images.
    printf '%s-%s' "$image_name" "${TLS_GROUP_IMAGE_SUFFIX:-review}"
}

base_image_for() {
    local component=$1 configured digest basename
    component_values "$component"
    if [[ "$component" == acm && -n "${ACM_BASE_IMAGE:-}" ]]; then printf '%s\n' "$ACM_BASE_IMAGE"; return; fi
    if [[ "$component" == mce && -n "${MCE_BASE_IMAGE:-}" ]]; then printf '%s\n' "$MCE_BASE_IMAGE"; return; fi
    configured=$(oc get deployment "$operator_deployment" -n "$namespace" -o json | \
        jq -er --arg name "$operator_image_var" '.spec.template.spec.containers[].env[] | select(.name==$name) | .value')
    [[ "$configured" == *@sha256:* ]] || fail "Operator image for $component is not digest pinned"
    if [[ "$configured" == registry.redhat.io/* ]]; then
        # This shared pool uses the installed downstream Quay mirror. Its
        # successful previous builds used the same product image digests.
        digest=${configured##*@}; basename=${configured%@*}; basename=${basename##*/}
        printf '%s/%s@%s\n' "$mirror" "$basename" "$digest"
    else
        printf '%s\n' "$configured"
    fi
}

ensure_pull_secret() {
    local namespace=$1 deployment=$2 sa_name sa_secret old="$tmp_dir/$1-old.json" sa="$tmp_dir/$1-sa.json" merged="$tmp_dir/$1-merged.json" encoded
    sa_name=$(oc get deployment "$deployment" -n "$namespace" -o json | jq -r '.spec.template.spec.serviceAccountName // "default"')
    sa_secret=$(oc get serviceaccount "$sa_name" -n "$namespace" -o json | \
        jq -er --arg prefix "$sa_name-dockercfg-" '.secrets | map(.name | select(startswith($prefix))) | first')
    oc get secret multiclusterhub-operator-pull-secret -n "$namespace" -o json | \
        jq -er '.data[".dockerconfigjson"]' | base64 --decode > "$old"
    oc get secret "$sa_secret" -n "$namespace" -o json | \
        jq -er '.data[".dockercfg"]' | base64 --decode > "$sa"
    jq -sS '.[0] as $old | .[1] as $sa | $old | .auths = (($old.auths // {}) + $sa)' "$old" "$sa" > "$merged"
    jq -e --arg registry "$registry" '.auths[$registry] != null' "$merged" >/dev/null \
        || fail "Service account in $namespace lacks internal registry auth"
    if [[ "$(jq -cS . "$old")" != "$(jq -cS . "$merged")" ]]; then
        encoded=$(base64 < "$merged" | tr -d '\n')
        jq -n --arg encoded "$encoded" '{data:{".dockerconfigjson":$encoded}}' > "$tmp_dir/$namespace-secret-patch.json"
        oc patch secret multiclusterhub-operator-pull-secret -n "$namespace" --type=merge \
            --patch-file="$tmp_dir/$namespace-secret-patch.json" >/dev/null
        log "Merged internal registry auth into $namespace operator pull secret"
    fi
}

ensure_build_resources() {
    local namespace=$1 name=$2
    jq -n --arg ns "$namespace" --arg name "$name" \
        '{apiVersion:"image.openshift.io/v1",kind:"ImageStream",metadata:{namespace:$ns,name:$name}}' \
        > "$tmp_dir/$name-is.json"
    jq -n --arg ns "$namespace" --arg name "$name" \
        '{apiVersion:"build.openshift.io/v1",kind:"BuildConfig",metadata:{namespace:$ns,name:$name},
          spec:{source:{type:"Binary",binary:{}},strategy:{type:"Docker",dockerStrategy:{}},
                output:{to:{kind:"ImageStreamTag",name:($name+":latest")}}}}' \
        > "$tmp_dir/$name-bc.json"
    oc apply -f "$tmp_dir/$name-is.json" >/dev/null
    oc apply -f "$tmp_dir/$name-bc.json" >/dev/null
}

ready_pods() {
    local namespace=$1 deployment=$2 selector
    selector=$(oc get deployment "$deployment" -n "$namespace" -o json | \
        jq -r '.spec.selector.matchLabels | to_entries | map("\(.key)=\(.value)") | join(",")')
    oc get pods -n "$namespace" -l "$selector" -o json | \
        jq -r '.items[] | select(.status.phase=="Running" and ([.status.containerStatuses[]?.ready] | length>0 and all)) | .metadata.name'
}

pods_match_binary() {
    local namespace=$1 deployment=$2 expected_image=$3 pod image hash count=0 desired
    desired=$(oc get deployment "$deployment" -n "$namespace" -o json | jq -r '.spec.replicas') || return 1
    while IFS= read -r pod; do
        [[ -n "$pod" ]] || continue
        image=$(oc get pod "$pod" -n "$namespace" -o json | jq -r '.spec.containers[] | select(.name=="console") | .image') || return 1
        [[ "$image" == "$expected_image" ]] || continue
        hash=$(oc exec "$pod" -n "$namespace" -c console -- sha256sum /app/console 2>/dev/null | awk '{print $1}') || return 1
        [[ "$hash" == "$binary_sha" ]] || return 1
        count=$((count + 1))
    done < <(ready_pods "$namespace" "$deployment")
    [[ "$count" == "$desired" ]]
}

verify_component() {
    local component=$1 cm image manifest digest current
    component_values "$component"
    cm=$(image_name_for)
    manifest=$(oc get configmap "$cm" -n "$namespace" -o json | jq -er '.data["manifest.json"]') || return 1
    digest=$(printf '%s' "$manifest" | jq -er '.[0]["image-digest"]') || return 1
    image="$registry/$namespace/$cm@$digest"
    current=$(oc get deployment "$deployment" -n "$namespace" -o json | jq -r '.spec.template.spec.containers[] | select(.name=="console") | .image') || return 1
    [[ "$current" == "$image" ]] && pods_match_binary "$namespace" "$deployment" "$image"
}

wait_for_component() {
    local component=$1 expected_image=$2 deadline deployment_json last_retry=0 retries=0 failed_pods pod selector now
    component_values "$component"
    selector=$(oc get deployment "$deployment" -n "$namespace" -o json | \
        jq -r '.spec.selector.matchLabels | to_entries | map("\(.key)=\(.value)") | join(",")')
    deadline=$(($(date +%s) + wait_seconds))
    while (( $(date +%s) < deadline )); do
        if deployment_json=$(oc get deployment "$deployment" -n "$namespace" -o json 2>/dev/null) && \
            printf '%s' "$deployment_json" | jq -e --arg image "$expected_image" \
                '(.spec.template.spec.containers | any(.name=="console" and .image==$image)) and
                 .status.readyReplicas==.spec.replicas and .status.updatedReplicas==.spec.replicas and
                 .status.observedGeneration>=.metadata.generation' >/dev/null && \
            pods_match_binary "$namespace" "$deployment" "$expected_image"; then
            log "$component managed Console is ready with binary $binary_sha"
            return 0
        fi
        now=$(date +%s)
        if (( now - last_retry >= 30 && retries < 5 )); then
            # Operator reconciliation may replace its pull secret after the
            # image override. Refresh it and recreate only failed new pods.
            ensure_pull_secret "$namespace" "$deployment"
            failed_pods=$(oc get pods -n "$namespace" -l "$selector" -o json | jq -r --arg image "$expected_image" \
                '.items[] | select(any(.spec.containers[]; .image==$image)) |
                 select(any(.status.containerStatuses[]?; .state.waiting.reason=="ImagePullBackOff" or .state.waiting.reason=="ErrImagePull")) |
                 .metadata.name')
            while IFS= read -r pod; do
                [[ -n "$pod" ]] || continue
                log "Retrying $component image pull in pod $pod"
                oc delete pod "$pod" -n "$namespace" --wait=false >/dev/null
                retries=$((retries + 1))
            done <<< "$failed_pods"
            last_retry=$now
        fi
        sleep 5
    done
    fail "$component managed Console did not reach the expected image and binary"
}

prepare_component() {
    local component=$1 cm annotation base context digest image manifest stored_sha
    component_values "$component"
    cm=$(image_name_for)
    stored_sha=$(oc get configmap "$cm" -n "$namespace" --ignore-not-found -o json | \
        jq -r '.metadata.annotations["acm-47232-test/binary-sha256"] // empty' 2>/dev/null || true)
    if [[ "$stored_sha" == "$binary_sha" ]] && verify_component "$component"; then
        ensure_pull_secret "$namespace" "$deployment"
        log "$component already runs this checkout; skipping the image build"
        return 0
    fi
    base=$(base_image_for "$component")
    log "Building $component Console image from $base"
    ensure_build_resources "$namespace" "$cm"
    context="$tmp_dir/$component-build"
    mkdir -p "$context"
    cp "$binary" "$context/console"
    # The managed container runs as non-root; umask 077 must not make the
    # overlaid executable private to the build user.
    chmod 755 "$context/console"
    printf 'FROM %s\nCOPY console /app/console\n' "$base" > "$context/Dockerfile"
    if ! oc start-build "$cm" -n "$namespace" --from-dir="$context" --follow --wait \
        > "$tmp_dir/$component-build.log" 2>&1; then
        tail -60 "$tmp_dir/$component-build.log" >&2
        fail "$component image build failed"
    fi
    digest=$(oc get imagestreamtag "$cm:latest" -n "$namespace" -o json | jq -er '.image.metadata.name')
    [[ "$digest" == sha256:* ]] || fail "$component build produced no image digest"
    image="$registry/$namespace/$cm@$digest"
    manifest=$(jq -n --arg key "$image_key" --arg remote "$registry/$namespace" --arg name "$cm" \
        --arg digest "$digest" '[{"image-key":$key,"image-remote":$remote,"image-name":$name,"image-digest":$digest}]')
    jq -n --arg ns "$namespace" --arg name "$cm" --arg manifest "$manifest" --arg sha "$binary_sha" \
        '{apiVersion:"v1",kind:"ConfigMap",metadata:{namespace:$ns,name:$name,
          annotations:{"acm-47232-test/binary-sha256":$sha}},data:{"manifest.json":$manifest}}' \
        > "$tmp_dir/$component-override.json"
    oc apply -f "$tmp_dir/$component-override.json" >/dev/null
    oc annotate "$operator_kind" "$operator_name" -n "$namespace" \
        "$override_annotation=$cm" "acm-47232-test/binary-sha256=$binary_sha" \
        "acm-47232-test/image-digest=$digest" --overwrite >/dev/null
    ensure_pull_secret "$namespace" "$deployment"
    wait_for_component "$component" "$image"
}

start_forward() {
    local component=$1 pid_var="${1}_forward_pid" port_var="${1}_port" pid port file attempt
    pid=${!pid_var-}
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then return 0; fi
    stop_forward "$component"
    component_values "$component"
    file="$tmp_dir/$component-forward.log"
    : > "$file"
    oc port-forward -n "$namespace" --address 127.0.0.1 "deployment/$deployment" :3000 > "$file" 2>&1 &
    pid=$!
    printf -v "$pid_var" '%s' "$pid"
    for attempt in {1..30}; do
        port=$(sed -n 's/^Forwarding from 127\.0\.0\.1:\([0-9][0-9]*\) -> 3000$/\1/p' "$file" | head -1)
        if [[ -n "$port" ]]; then printf -v "$port_var" '%s' "$port"; return 0; fi
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
    done
    stop_forward "$component"
    return 1
}

probe_case() {
    local component=$1 version=$2 group=$3 expect=$4 port_var="${1}_port" port
    start_forward "$component" || return 1
    port=${!port_var-}
    "$probe_binary" --address "127.0.0.1:$port" --version "$version" --group "$group" --expect "$expect"
}

check_case() {
    local component=$1 version=$2 group=$3 expect=$4 deadline
    deadline=$(($(date +%s) + wait_seconds))
    while (( $(date +%s) < deadline )); do
        if probe_case "$component" "$version" "$group" "$expect" > "$tmp_dir/last-probe.log" 2>&1; then
            log "$component: $(cat "$tmp_dir/last-probe.log")"
            return 0
        fi
        stop_forward "$component"
        sleep 5
    done
    cat "$tmp_dir/last-probe.log" >&2
    fail "$component TLS$version $group did not meet expected result: $expect"
}

standard_matrix() {
    local p384=$1 x25519=$2 component version
    for component in acm mce; do
        for version in 12 13; do
            check_case "$component" "$version" p256 allow
            check_case "$component" "$version" p384 "$p384"
            check_case "$component" "$version" x25519 "$x25519"
        done
    done
}

hybrid_matrix() {
    local component
    for component in acm mce; do
        check_case "$component" 13 x25519mlkem768 allow
        check_case "$component" 13 p256 allow
        check_case "$component" 13 p384 reject
        check_case "$component" 13 x25519 reject
    done
}

pod_snapshot() {
    local component=$1
    component_values "$component"
    local selector
    selector=$(oc get deployment "$deployment" -n "$namespace" -o json | \
        jq -r '.spec.selector.matchLabels | to_entries | map("\(.key)=\(.value)") | join(",")')
    oc get pods -n "$namespace" -l "$selector" -o json | jq -cS \
        '[.items[] | select(.status.phase=="Running" and ([.status.containerStatuses[]?.ready] | length>0 and all)) |
          {uid:.metadata.uid,restarts:([.status.containerStatuses[]?.restartCount] | add // 0)}] | sort_by(.uid)'
}

apply_profile() {
    local groups_json
    groups_json=$(jq -cn '$ARGS.positional' --args "$@")
    jq -n --argjson groups "$groups_json" \
        '{spec:{tlsSecurityProfile:{type:"Custom",custom:{minTLSVersion:"VersionTLS12",
          ciphers:["TLS_AES_128_GCM_SHA256","TLS_AES_256_GCM_SHA384",
                   "ECDHE-RSA-AES128-GCM-SHA256","ECDHE-ECDSA-AES128-GCM-SHA256"],groups:$groups}}}}' \
        > "$tmp_dir/test-profile-patch.json"
    oc patch apiserver cluster --type=merge --patch-file="$tmp_dir/test-profile-patch.json" >/dev/null
    oc get apiserver cluster -o json | jq -e --argjson groups "$groups_json" \
        '.spec.tlsSecurityProfile.custom.groups==$groups' >/dev/null \
        || fail 'The API server did not retain the requested groups'
}

wait_master_pool() {
    local deadline stable=0 checks=0 pool
    deadline=$(($(date +%s) + mcp_wait_seconds))
    while (( $(date +%s) < deadline )); do
        pool=$(oc get machineconfigpool master -o json 2>/dev/null) || pool=
        if [[ -n "$pool" ]] && printf '%s' "$pool" | jq -e \
            '.status.machineCount>0 and .status.readyMachineCount==.status.machineCount and
             .status.updatedMachineCount==.status.machineCount and
             ([.status.conditions[] | select(.type=="Updated") | .status][0]=="True") and
             ([.status.conditions[] | select(.type=="Degraded") | .status][0]=="False")' >/dev/null; then
            stable=$((stable + 1))
            if (( stable >= 3 )); then log 'Master MachineConfigPool is updated and nondegraded'; return 0; fi
        else
            stable=0
        fi
        checks=$((checks + 1))
        if (( checks % 4 == 0 )); then
            if [[ -n "$pool" ]]; then
                log "Waiting for master MachineConfigPool: $(printf '%s' "$pool" | jq -r '"\(.status.updatedMachineCount)/\(.status.machineCount) updated, \(.status.readyMachineCount) ready"')"
            else
                log 'Waiting for the cluster API during master rollout'
            fi
        fi
        sleep 15
    done
    fail 'Master MachineConfigPool did not settle after profile restoration'
}

wait_for_prepared_images() {
    local component cm digest
    for component in acm mce; do
        component_values "$component"
        cm=$(image_name_for)
        digest=$(oc get configmap "$cm" -n "$namespace" -o json | \
            jq -er '.data["manifest.json"] | fromjson | .[0]["image-digest"]')
        wait_for_component "$component" "$registry/$namespace/$cm@$digest"
    done
}

if [[ "$mode" == status ]]; then
    [[ "$(profile_json)" == null ]] || fail 'APIServer profile is not restored; run restore first'
    wait_master_pool
    wait_for_prepared_images
    log 'PASS: master pool and both managed branch Consoles are ready with the original profile'
    exit 0
fi

if [[ "$mode" == all || "$mode" == prepare ]]; then
    prepare_component acm
    prepare_component mce
fi
if [[ "$mode" == prepare ]]; then
    log 'Both managed Consoles are prepared; the image overrides remain installed'
    exit 0
fi

verify_component acm || fail 'ACM image does not contain this checkout; run prepare first'
verify_component mce || fail 'MCE image does not contain this checkout; run prepare first'
original=$(profile_json)
[[ "$original" == null ]] || fail 'The starting profile must be unset on this disposable claim'
printf '%s\n' "$original" > "$tmp_dir/original-profile.json"
oc create configmap "$profile_backup" -n "$acm_namespace" \
    --from-file=profile.json="$tmp_dir/original-profile.json" >/dev/null
profile_guard_active=1
initial_acm=$(pod_snapshot acm)
initial_mce=$(pod_snapshot mce)

log 'Checking the original unset-group profile'
standard_matrix allow allow
check_case acm 13 x25519mlkem768 allow
check_case mce 13 x25519mlkem768 allow

log 'Restricting the hub profile to P-256'
apply_profile secp256r1
standard_matrix reject reject

log 'Expanding the hub profile to P-256 and P-384'
apply_profile secp256r1 secp384r1
standard_matrix allow reject

log 'Checking explicit TLS 1.3 hybrid group preferences'
apply_profile X25519MLKEM768 secp256r1
hybrid_matrix

restore_profile || fail 'Could not restore the original APIServer TLS profile'
log 'Checking the restored unset-group profile'
standard_matrix allow allow
check_case acm 13 x25519mlkem768 allow
check_case mce 13 x25519mlkem768 allow
[[ "$(pod_snapshot acm)" == "$initial_acm" ]] || fail 'ACM Console pods changed or restarted during profile updates'
[[ "$(pod_snapshot mce)" == "$initial_mce" ]] || fail 'MCE Console pods changed or restarted during profile updates'
wait_master_pool
wait_for_prepared_images
if [[ "$(pod_snapshot acm)" != "$initial_acm" || "$(pod_snapshot mce)" != "$initial_mce" ]]; then
    log 'NOTE: a Console pod changed during the platform MachineConfig rollout; both branch images are ready'
fi
log 'PASS: both managed Consoles honor groups; unset behavior and live profile reload are preserved'
