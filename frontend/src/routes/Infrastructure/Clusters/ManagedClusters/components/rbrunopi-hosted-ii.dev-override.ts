/* Copyright Contributors to the Open Cluster Management project */

/**
 * Development override for testing hypershift upgrades
 * Edit CONFIG below, save, and webpack will hot-reload
 */

// ============================================================================
// CONFIGURATION - All test controls in one place
// ============================================================================

const CONFIG = {
  // Enable/disable data override
  ENABLED: true,

  // Target cluster name to override
  CLUSTER_NAME: 'rbrunopi-hosted-ii',

  // Control plane current version
  CONTROL_PLANE_VERSION: '4.21.0',

  // Available upgrade versions (shown in dropdowns)
  AVAILABLE_VERSIONS: ['4.20.12', '4.20.13', '4.20.14', '4.20.15', '4.21.1', '4.21.2', '4.22.0'],

  // NodePool current versions (overrides by nodepool name)
  NODEPOOL_VERSIONS: {
    'worker-ii': '4.20.8',
    'worker-iii': '4.20.8',
    // 'nodepool-1': '4.20.8',
    // 'nodepool-2': '4.20.9',
    // 'nodepool-3': '4.20.10',
    // 'nodepool-4': '4.20.11',
  },

  // Upgrade channel
  CHANNEL: 'stable-4.21',
}

// ============================================================================
// Override functions - don't edit below this line
// ============================================================================

export function overrideManagedClusterInfo(clusterInfo: any) {
  if (!CONFIG.ENABLED || clusterInfo?.metadata?.name !== CONFIG.CLUSTER_NAME) {
    return clusterInfo
  }

  return {
    ...clusterInfo,
    status: {
      ...clusterInfo.status,
      version: CONFIG.CONTROL_PLANE_VERSION,
      distributionInfo: {
        ...clusterInfo.status?.distributionInfo,
        type: 'ocp',
        ocp: {
          version: CONFIG.CONTROL_PLANE_VERSION,
          availableUpdates: CONFIG.AVAILABLE_VERSIONS,
          desiredVersion: CONFIG.CONTROL_PLANE_VERSION,
          channel: CONFIG.CHANNEL,
          upgradeFailed: false,
          versionAvailableUpdates: CONFIG.AVAILABLE_VERSIONS.map((v) => ({
            version: v,
            image: `quay.io/openshift-release-dev/ocp-release:${v}-multi`,
          })),
          desired: {
            channels: [CONFIG.CHANNEL],
            version: CONFIG.CONTROL_PLANE_VERSION,
            image: `quay.io/openshift-release-dev/ocp-release:${CONFIG.CONTROL_PLANE_VERSION}-multi`,
          },
        },
      },
    },
  }
}

export function overrideNodePools(nodePools: any[]) {
  if (!CONFIG.ENABLED || !nodePools) return nodePools

  return nodePools.map((np) => {
    const npName: string = np.metadata?.name
    const overrideVersion = CONFIG.NODEPOOL_VERSIONS[npName as keyof typeof CONFIG.NODEPOOL_VERSIONS]

    if (!overrideVersion || np.spec?.clusterName !== CONFIG.CLUSTER_NAME) {
      return np
    }

    return {
      ...np,
      spec: {
        ...np.spec,
        release: {
          image: `quay.io/openshift-release-dev/ocp-release:${overrideVersion}-multi`,
        },
      },
      status: {
        ...np.status,
        version: overrideVersion,
      },
    }
  })
}

export function overrideHostedCluster(hostedCluster: any) {
  if (!CONFIG.ENABLED || hostedCluster?.metadata?.name !== CONFIG.CLUSTER_NAME) {
    return hostedCluster
  }

  return {
    ...hostedCluster,
    spec: {
      ...hostedCluster.spec,
      release: {
        image: `quay.io/openshift-release-dev/ocp-release:${CONFIG.CONTROL_PLANE_VERSION}-multi`,
      },
    },
    status: {
      ...hostedCluster.status,
      version: {
        ...hostedCluster.status?.version,
        desired: {
          image: `quay.io/openshift-release-dev/ocp-release:${CONFIG.CONTROL_PLANE_VERSION}-multi`,
        },
        history: [
          {
            completionTime: new Date().toISOString(),
            image: `quay.io/openshift-release-dev/ocp-release:${CONFIG.CONTROL_PLANE_VERSION}-multi`,
            startedTime: new Date(Date.now() - 3600000).toISOString(),
            state: 'Completed',
            verified: true,
            version: CONFIG.CONTROL_PLANE_VERSION,
          },
        ],
      },
    },
  }
}

// Log config on module load
if (CONFIG.ENABLED) {
  console.log('🔧 DEV OVERRIDE:', CONFIG.CLUSTER_NAME)
  console.log('  CP:', CONFIG.CONTROL_PLANE_VERSION, '| Available:', CONFIG.AVAILABLE_VERSIONS.join(', '))
  console.log(
    '  NPs:',
    Object.entries(CONFIG.NODEPOOL_VERSIONS)
      .map(([n, v]) => `${n}:${v}`)
      .join(', ')
  )
}
