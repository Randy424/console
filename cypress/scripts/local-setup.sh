#!/usr/bin/env bash

export BROWSER="chrome"
export CYPRESS_OC_IDP=`oc whoami`
export CYPRESS_OPTIONS_HUB_USER=`oc whoami`
export CYPRESS_token=`oc whoami -t`
export CYPRESS_CLUSTER_API_URL=`oc whoami --show-server`
export CYPRESS_BASE_URL=`oc whoami --show-console`
# export CYPRESS_SPOKE_CLUSTER=""
# export CYPRESS_CLC_OC_IDP=${CYPRESS_CLC_OC_IDP:-"clc-e2e-htpasswd"}
# export CYPRESS_CLC_RBAC_PASS=${CYPRESS_CLC_RBAC_PASS:-"test-RBAC-4-e2e"}
# export CYPRESS_CLC_OCP_IMAGE_VERSION=${CYPRESS_CLC_OCP_IMAGE_VERSION:-"4.9.4"}
# export CYPRESS_CLC_OCP_IMAGE_REGISTRY=${CYPRESS_CLC_OCP_IMAGE_REGISTRY:-"quay.io/openshift-release-dev/ocp-release"}
# export CYPRESS_ACM_NAMESPACE=${CYPRESS_ACM_NAMESPACE:-""}
# export CYPRESS_MCE_NAMESPACE=${CYPRESS_MCE_NAMESPACE:-""}
