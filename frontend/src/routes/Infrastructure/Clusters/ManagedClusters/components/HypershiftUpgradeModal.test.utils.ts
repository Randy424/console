/* Copyright Contributors to the Open Cluster Management project */

/**
 * Test mode flag - set to true to disable API calls and log curator specs to console
 */
export const TEST_MODE = true

/**
 * Intercepts ClusterCurator creation/patch and logs to console instead of calling API
 */
export function interceptCuratorCreation(curatorResource: any, operation: 'create' | 'patch', patchSpec?: any) {
  if (!TEST_MODE) return null

  const spec = operation === 'patch' ? patchSpec : curatorResource
  console.log(`\n🔍 CURATOR ${operation.toUpperCase()}`)
  console.log('Cluster:', curatorResource.metadata?.name)
  console.log('Spec:', JSON.stringify(spec, null, 2))

  return {
    promise: Promise.resolve({ ...curatorResource, ...patchSpec }),
    abort: () => {},
  }
}

/**
 * Logs upgrade summary - called from HypershiftUpgradeModal
 */
export function logUpgradeSummary(spec: any) {
  const { desiredUpdate, upgradeType, nodePoolNames } = spec.upgrade || {}
  console.log('Version:', desiredUpdate)
  console.log('Type:', upgradeType || 'Both')
  console.log('NodePools:', nodePoolNames || 'All')
}
