/* Copyright Contributors to the Open Cluster Management project */
import { useMemo } from 'react'
import { IPlacement } from '../common/resources/IPlacement'
import { IResource } from '../common/resources/IResource'

export interface MatchedClustersResult {
  matched: IResource[]
  notMatched: IResource[]
  totalClusters: number
  matchedCount: number
}

/**
 * Hook to calculate which clusters match the given placement rules
 */
export function useMatchedClusters(
  placement: IPlacement | undefined,
  allClusters: IResource[]
): MatchedClustersResult {
  return useMemo(() => {
    if (!placement || !allClusters || allClusters.length === 0) {
      return {
        matched: [],
        notMatched: allClusters || [],
        totalClusters: allClusters?.length || 0,
        matchedCount: 0,
      }
    }

    const matched: IResource[] = []
    const notMatched: IResource[] = []

    // If no predicates or selectors are specified, all clusters match
    const hasNoSelectors =
      !placement.spec?.clusterSets?.length &&
      !placement.spec?.predicates?.length &&
      !placement.spec?.predicates?.[0]?.requiredClusterSelector

    if (hasNoSelectors) {
      return {
        matched: allClusters,
        notMatched: [],
        totalClusters: allClusters.length,
        matchedCount: allClusters.length,
      }
    }

    allClusters.forEach((cluster) => {
      let isMatched = true

      // Check cluster sets if specified
      if (placement.spec?.clusterSets && placement.spec.clusterSets.length > 0) {
        const clusterSetLabel = cluster.metadata?.labels?.['cluster.open-cluster-management.io/clusterset']
        if (!clusterSetLabel || !placement.spec.clusterSets.includes(clusterSetLabel)) {
          isMatched = false
        }
      }

      // Check label selectors
      if (isMatched && placement.spec?.predicates?.[0]?.requiredClusterSelector?.labelSelector) {
        const labelSelector = placement.spec.predicates[0].requiredClusterSelector.labelSelector

        // Check matchLabels
        if (labelSelector.matchLabels) {
          for (const [key, value] of Object.entries(labelSelector.matchLabels)) {
            if (cluster.metadata?.labels?.[key] !== value) {
              isMatched = false
              break
            }
          }
        }

        // Check matchExpressions
        if (isMatched && labelSelector.matchExpressions) {
          for (const expression of labelSelector.matchExpressions) {
            const clusterLabelValue = cluster.metadata?.labels?.[expression.key]
            const expressionValues = expression.values || []

            switch (expression.operator) {
              case 'In':
                if (!clusterLabelValue || !expressionValues.includes(clusterLabelValue)) {
                  isMatched = false
                }
                break
              case 'NotIn':
                if (clusterLabelValue && expressionValues.includes(clusterLabelValue)) {
                  isMatched = false
                }
                break
              case 'Exists':
                if (!clusterLabelValue) {
                  isMatched = false
                }
                break
              case 'DoesNotExist':
                if (clusterLabelValue) {
                  isMatched = false
                }
                break
            }

            if (!isMatched) break
          }
        }
      }

      if (isMatched) {
        matched.push(cluster)
      } else {
        notMatched.push(cluster)
      }
    })

    // Apply numberOfClusters limit if specified
    const limit = placement.spec?.numberOfClusters
    if (limit !== undefined && limit > 0 && matched.length > limit) {
      // Move excess clusters to notMatched
      const excess = matched.splice(limit)
      notMatched.push(...excess)
    }

    return {
      matched,
      notMatched,
      totalClusters: allClusters.length,
      matchedCount: matched.length,
    }
  }, [placement, allClusters])
}
