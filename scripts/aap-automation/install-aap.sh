#!/usr/bin/env bash
# Copyright Contributors to the Open Cluster Management project
# Idempotent script for installing Ansible Automation Platform (AAP) on OpenShift
# Safe to run repeatedly - checks for existing installation before proceeding

set -e

# Configuration variables
AAP_NAMESPACE=${AAP_NAMESPACE:-"ansible-automation-platform"}
PLATFORM_NAME=${PLATFORM_NAME:-"aap-platform"}
OPERATOR_CHANNEL=${OPERATOR_CHANNEL:-"stable-2.5-cluster-scoped"}
OPERATOR_SOURCE=${OPERATOR_SOURCE:-"redhat-operators"}
RH_OFFLINE_TOKEN=${RH_OFFLINE_TOKEN:-""}
ENABLE_HUB=${ENABLE_HUB:-"false"}
ENABLE_EDA=${ENABLE_EDA:-"false"}

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
if ! command -v oc &> /dev/null; then
    log_error "oc CLI not found. Please install the OpenShift CLI."
    exit 1
fi

if ! oc whoami &> /dev/null; then
    log_error "Not logged into an OpenShift cluster. Please run 'oc login' first."
    exit 1
fi

# --- Idempotency check ---
check_aap_status() {
    if ! oc get namespace "$AAP_NAMESPACE" &> /dev/null; then
        echo "not_installed"; return
    fi
    if ! oc get ansibleautomationplatform "$PLATFORM_NAME" -n "$AAP_NAMESPACE" &> /dev/null; then
        echo "namespace_only"; return
    fi
    PLATFORM_STATUS=$(oc get ansibleautomationplatform "$PLATFORM_NAME" -n "$AAP_NAMESPACE" \
        -o jsonpath='{.status.conditions[?(@.type=="Running")].status}' 2>/dev/null || echo "Unknown")
    GATEWAY_RUNNING=$(oc get pods -n "$AAP_NAMESPACE" -l app.kubernetes.io/component=aap-gateway \
        --no-headers 2>/dev/null | grep -c "Running" || echo "0")
    if [ "$PLATFORM_STATUS" = "True" ] || [ "$GATEWAY_RUNNING" -gt "0" ]; then
        echo "healthy"
    else
        echo "unhealthy"
    fi
}

AAP_STATUS=$(check_aap_status)
log_info "Current AAP status: $AAP_STATUS"

case "$AAP_STATUS" in
    "healthy")
        ROUTE_URL=$(oc get route ${PLATFORM_NAME} -n $AAP_NAMESPACE -o jsonpath='{.spec.host}' 2>/dev/null || echo "N/A")
        log_info "AAP is already installed and healthy at https://${ROUTE_URL}"
        exit 0
        ;;
    "not_installed")
        log_info "AAP is not installed. Starting installation..."
        ;;
    "namespace_only")
        log_info "Namespace exists but AnsibleAutomationPlatform not found. Continuing installation..."
        ;;
    "unhealthy")
        log_warn "AAP is installed but not healthy. Attempting repair..."
        ;;
    *)
        log_error "Unknown AAP status: $AAP_STATUS"
        exit 1
        ;;
esac

# --- Installation ---
log_info "Starting AAP installation on OpenShift cluster: $(oc whoami --show-server)"

# Create namespace
log_info "Creating namespace: $AAP_NAMESPACE"
oc create namespace $AAP_NAMESPACE --dry-run=client -o yaml | oc apply -f -

# Install AAP Operator
log_info "Installing AAP Operator via OperatorHub"
cat <<EOF | oc apply -f -
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: ansible-automation-platform-operator-group
  namespace: $AAP_NAMESPACE
spec:
  targetNamespaces:
  - $AAP_NAMESPACE
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: ansible-automation-platform-operator
  namespace: $AAP_NAMESPACE
spec:
  channel: $OPERATOR_CHANNEL
  installPlanApproval: Automatic
  name: ansible-automation-platform-operator
  source: $OPERATOR_SOURCE
  sourceNamespace: openshift-marketplace
EOF

# Wait for operator to be ready
log_info "Waiting for AAP Operator to be ready..."
TIMEOUT=300
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $TIMEOUT ]; do
    CSV_CHECK=$(oc get csv -n $AAP_NAMESPACE -o jsonpath='{.items[*].status.phase}' 2>/dev/null | grep -c "Succeeded" || echo "0")
    if [ "$CSV_CHECK" -gt "0" ]; then
        log_info "AAP Operator is ready"
        break
    fi
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    log_info "Waiting... ($ELAPSED/$TIMEOUT seconds)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    log_warn "Timeout waiting for AAP Operator CSV, checking if operator is already installed..."
    OPERATOR_PODS=$(oc get pods -n $AAP_NAMESPACE -l app.kubernetes.io/component=operator --no-headers 2>/dev/null | wc -l)
    if [ "$OPERATOR_PODS" -gt "0" ]; then
        log_info "Operator pods found, continuing with installation..."
    else
        log_error "AAP Operator is not ready"
        exit 1
    fi
fi

CSV_VERSION=$(oc get csv -n $AAP_NAMESPACE -o jsonpath='{.items[*].metadata.name}' 2>/dev/null | grep -o 'aap-operator[^ ]*' | head -1 || echo "unknown")
log_info "AAP Operator CSV: $CSV_VERSION"

# Create AnsibleAutomationPlatform CR
log_info "Creating AnsibleAutomationPlatform: $PLATFORM_NAME"

PLATFORM_SPEC="apiVersion: aap.ansible.com/v1alpha1
kind: AnsibleAutomationPlatform
metadata:
  name: $PLATFORM_NAME
  namespace: $AAP_NAMESPACE
spec:
  controller:
    replicas: 1"

if [ "$ENABLE_HUB" = "true" ]; then
    PLATFORM_SPEC="$PLATFORM_SPEC
  hub:
    replicas: 1"
fi

if [ "$ENABLE_EDA" = "true" ]; then
    PLATFORM_SPEC="$PLATFORM_SPEC
  eda:
    replicas: 1"
fi

echo "$PLATFORM_SPEC" | oc apply -f -

# Wait for platform to be ready
log_info "Waiting for AnsibleAutomationPlatform to be ready..."
log_info "This may take several minutes as multiple components are deployed..."
TIMEOUT=900
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    PLATFORM_STATUS=$(oc get ansibleautomationplatform $PLATFORM_NAME -n $AAP_NAMESPACE \
        -o jsonpath='{.status.conditions[?(@.type=="Running")].status}' 2>/dev/null || echo "Unknown")
    if [ "$PLATFORM_STATUS" = "True" ]; then
        log_info "AnsibleAutomationPlatform is ready"
        break
    fi
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    log_info "Waiting for platform... ($ELAPSED/$TIMEOUT seconds) - Status: $PLATFORM_STATUS"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    log_warn "Timeout waiting for full platform deployment"
    GATEWAY_PODS=$(oc get pods -n $AAP_NAMESPACE -l app.kubernetes.io/name=aap-platform,app.kubernetes.io/component=gateway --no-headers 2>/dev/null | grep -c "Running" || echo "0")
    if [ "$GATEWAY_PODS" -gt "0" ]; then
        log_info "Gateway is running, platform may be partially ready"
    else
        log_error "Platform deployment failed"
        log_info "Check status with: oc get ansibleautomationplatform $PLATFORM_NAME -n $AAP_NAMESPACE -o yaml"
        exit 1
    fi
fi

# Get admin password
log_info "Retrieving admin password from secret..."
ADMIN_PASSWORD=$(oc get secret ${PLATFORM_NAME}-admin-password -n $AAP_NAMESPACE -o jsonpath='{.data.password}' 2>/dev/null | base64 -d)

if [ -z "$ADMIN_PASSWORD" ]; then
    log_error "Failed to retrieve admin password"
    exit 1
fi

# Get route URL
log_info "Retrieving AAP Platform route..."
ROUTE_URL=$(oc get route ${PLATFORM_NAME} -n $AAP_NAMESPACE -o jsonpath='{.spec.host}' 2>/dev/null || echo "")

if [ -z "$ROUTE_URL" ]; then
    log_warn "Route not found yet. Waiting for route to be created..."
    sleep 30
    ROUTE_URL=$(oc get route ${PLATFORM_NAME} -n $AAP_NAMESPACE -o jsonpath='{.spec.host}' 2>/dev/null || echo "")
fi

# --- Subscription management ---
if [ -n "$RH_OFFLINE_TOKEN" ]; then
    log_info "Configuring subscription using offline token..."

    RHSM_API="https://api.access.redhat.com/management/v1"
    ALLOCATION_NAME="AAP-Automation-$(date +%Y%m%d)"
    MANIFEST_FILE="/tmp/manifest-${ALLOCATION_NAME}.zip"
    AAP_URL="https://${ROUTE_URL}"

    # Exchange offline token for access token
    log_info "Obtaining access token from Red Hat SSO..."
    ACCESS_TOKEN=$(curl -sk -X POST \
        "https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token" \
        -d "grant_type=refresh_token" \
        -d "client_id=rhsm-api" \
        -d "refresh_token=${RH_OFFLINE_TOKEN}" | jq -r '.access_token')

    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        log_warn "Failed to obtain access token - skipping subscription setup"
    else
        # Check for existing allocation or create new one
        ALLOCATION_UUID=$(curl -sk -H "Authorization: Bearer ${ACCESS_TOKEN}" \
            "${RHSM_API}/allocations" | jq -r '.body[0].uuid // empty')

        if [ -z "$ALLOCATION_UUID" ]; then
            log_info "Creating new subscription allocation: $ALLOCATION_NAME"
            ALLOCATION_UUID=$(curl -sk -X POST \
                -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                -H "Content-Type: application/json" \
                -d "{\"name\":\"${ALLOCATION_NAME}\",\"type\":\"Satellite\",\"version\":\"6.11\"}" \
                "${RHSM_API}/allocations" | jq -r '.body.uuid // empty')

            if [ -n "$ALLOCATION_UUID" ]; then
                POOL_ID=$(curl -sk -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                    "${RHSM_API}/allocations/${ALLOCATION_UUID}/subscriptions/available" | \
                    jq -r '[.body[] | select(.product_name | contains("Ansible"))][0].pool_id // empty')

                if [ -n "$POOL_ID" ]; then
                    curl -sk -X POST \
                        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                        -H "Content-Type: application/json" \
                        -d "{\"pool_id\":\"${POOL_ID}\",\"quantity\":1}" \
                        "${RHSM_API}/allocations/${ALLOCATION_UUID}/subscriptions" > /dev/null
                    log_info "Subscription attached"
                else
                    log_warn "No AAP subscription pool found"
                fi
            else
                log_warn "Failed to create allocation - skipping subscription setup"
            fi
        fi

        if [ -n "$ALLOCATION_UUID" ]; then
            log_info "Downloading subscription manifest..."
            curl -sk -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                "${RHSM_API}/allocations/${ALLOCATION_UUID}/export" \
                -o "${MANIFEST_FILE}"

            if [ -f "$MANIFEST_FILE" ] && [ -s "$MANIFEST_FILE" ]; then
                log_info "Uploading manifest to AAP..."
                UPLOAD_RESPONSE=$(curl -sk -X POST \
                    -u "admin:${ADMIN_PASSWORD}" \
                    -F "manifest=@${MANIFEST_FILE}" \
                    "${AAP_URL}/api/controller/v2/config/subscriptions/" \
                    -w "\nHTTP_CODE:%{http_code}")

                HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
                if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
                    log_info "Subscription manifest uploaded successfully"
                else
                    log_warn "Manifest upload returned HTTP $HTTP_CODE"
                fi
                rm -f "$MANIFEST_FILE"
            else
                log_warn "Failed to download manifest"
            fi
        fi
    fi
else
    log_info "No RH_OFFLINE_TOKEN set - skipping automated subscription setup"
fi

# --- Summary ---
echo ""
log_info "=================================================="
log_info "AAP Installation Complete!"
log_info "=================================================="
echo ""
log_info "Namespace:        $AAP_NAMESPACE"
log_info "Platform Name:    $PLATFORM_NAME"
log_info "URL:              https://${ROUTE_URL}"
log_info "Username:         admin"
log_info "Password:         $ADMIN_PASSWORD"
echo ""
log_info "Deployed Components:"
log_info "  - Gateway (UI)"
log_info "  - Controller (Automation Engine)"
if [ "$ENABLE_HUB" = "true" ]; then
    log_info "  - Automation Hub (Content Management)"
fi
if [ "$ENABLE_EDA" = "true" ]; then
    log_info "  - Event-Driven Ansible"
fi
echo ""
log_info "To retrieve the password later, run:"
log_info "  oc get secret ${PLATFORM_NAME}-admin-password -n $AAP_NAMESPACE -o jsonpath='{.data.password}' | base64 -d"
