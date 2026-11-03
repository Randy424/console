# ACM-47232: TLS group test for ACM and MCE Consoles

This `test/ACM-47232-tls-groups-review` branch holds review-only test files for [PR #7071](https://github.com/stolostron/console/pull/7071). It has the same backend source as the PR branch; the test files are not part of the PR.

## Story objective and delivered change

ACM 5.0's Node Console followed the cluster's selected TLS groups. ACM 5.1's Go Console needs to keep doing so when the cluster profile changes. [ACM-42599 / #6931](https://github.com/stolostron/console/pull/6931) already added profile hot-reload and basic group filtering. PR #7071 builds on it: library-go maps group names, and the Go listener matches the prior Node behavior for defaults, FIPS filtering, and groups that cannot be used. An RSA-only TLS 1.2 connection remains possible when the profile allows its cipher, using HTTP/1.1.

## What this cluster test aims to confirm

A TLS group is a method used to agree on keys when an HTTPS connection starts. We want to see the ACM and MCE Consoles accept methods the cluster allows, reject methods it excludes, and apply a changed setting to new connections without restarting. Leaving the setting unset should keep the previous behavior; restoring it after the test should bring that behavior back.

This script checks supported groups and live profile changes in the deployed ACM and MCE Consoles. Go tests cover unknown or unusable groups and the RSA fallback. The cipher policy inherited from #6931 is unchanged.

The shared `cs-aws-51` cluster pool has a test environment under claim **`rbrunopi-groups`** in the `console-squad` namespace. It has ACM and MCE 5.1 and the `TLSGroupPreferences` gate. Check out this test branch and use the claim's kubeconfig:

```sh
git fetch https://github.com/Randy424/console.git test/ACM-47232-tls-groups-review
git switch --detach FETCH_HEAD
export TLS_GROUP_KUBECONFIG="$HOME/Repositories/cluster-keeper/dependencies/lifeguard/clusterclaims/rbrunopi-groups/kubeconfig"
./scripts/test-tls-groups.sh all | tee tls-groups-result.log
```

If the claim file is at that default path, the script selects it automatically, even when a global `KUBECONFIG` is stale. Set `TLS_GROUP_KUBECONFIG` when your copy is elsewhere. The script requires `oc`, `jq`, Go 1.26+, `git`, and cluster-admin access. Run one copy at a time.

## What happens during `all`

1. The script checks that the claim has ACM, MCE, and the `TLSGroupPreferences` feature gate. It builds the Go Console binary from this checkout, deploys test images containing it to the ACM and MCE Console backend Deployments, and verifies the running pods contain that binary. If the images already match, it skips the builds.
2. It saves the original, unset API server TLS profile and records the ACM and MCE Console pods. It makes fresh HTTPS connections to the ACM and MCE Consoles, offering one group at a time. P-256, P-384, and X25519 must work over TLS 1.2 and 1.3; X25519MLKEM768 must also work over TLS 1.3.
3. It changes the cluster profile to P-256 only. Over TLS 1.2 and 1.3, P-256 connections must work; P-384 and X25519 connections must be rejected.
4. It adds P-384. Over TLS 1.2 and 1.3, P-256 and P-384 connections must work; X25519 must still be rejected.
5. It sets the profile to X25519MLKEM768 and P-256, then checks TLS 1.3. Those connections must work; P-384 and X25519 must be rejected.
6. It restores the original profile and repeats the default checks. The ACM and MCE Console pods must not have restarted during these profile changes.
7. It waits for the master nodes to finish any rollout caused by the profile changes, then confirms the ACM and MCE Consoles are ready with the branch binary. The script leaves the branch images installed and the original profile restored.

For each allowed group, a fresh handshake must return HTTP 200 from the backend plugin manifest; a disallowed group must fail the handshake. The checks reach each backend through a temporary local port-forward. The master-node rollout can take much longer than the handshakes; the script allows up to 30 minutes for it to settle.

| Mode | Purpose |
| --- | --- |
| `all` (default) | Prepare the current checkout, then check which TLS groups the ACM and MCE Consoles accept. |
| `prepare` | Build the current backend binary for Linux, place it in the ACM and MCE Console test images, apply the operators' image overrides, and verify every ready pod's binary hash. |
| `test` | Require the ACM and MCE Consoles to run the current binary, then check accepted and rejected HTTPS connections through temporary local port-forwards. |
| `restore` | Restore the saved API server TLS profile after an interrupted test. The next invocation of any mode also does this automatically. |
| `status` | Wait for master-node recovery and verify the ACM and MCE Console images without changing the TLS profile. |

Certificate validation is disabled only in the probe so it measures group policy with the same endpoint and certificate for positive and negative controls.

The script saves the original `APIServer/cluster.spec.tlsSecurityProfile` in a dedicated ConfigMap before patching it. It restores the profile on normal exit or error, and a later run recovers it after a forced termination. Image overrides, image builds, and merged pull credentials remain installed for follow-up testing. Repeating `prepare` or `all` skips image builds when the ready pods already contain the current checkout's binary.

OpenShift may roll control-plane nodes after profile changes. The no-restart assertion covers the live handshake sequence; a later node reboot may reschedule a Console pod, which the script reports separately. The script waits up to 30 minutes for the master pool and repairs any failed Console image pulls during recovery. It leaves the cluster on the current branch images with the original TLS profile restored.

This is developer validation of the branch on the shared claim. ART image, actual process FIPS mode, scanner, and formal QE verification remain separate.
