/* Copyright Contributors to the Open Cluster Management project */
import { Alert, Button, ButtonVariant, Icon, PageSection, Stack, Title } from '@patternfly/react-core'
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons'
import { ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { generatePath, Link } from 'react-router-dom-v5-compat'
import { useTranslation } from '../../../../lib/acm-i18next'
import AcmTimestamp from '../../../../lib/AcmTimestamp'
import { rbacCreate, rbacUpdate, useIsAnyNamespaceAuthorized } from '../../../../lib/rbac-util'
import { NavigationPath } from '../../../../NavigationPath'
import {
  Placement,
  PlacementDecision,
  PlacementDecisionStatus,
  PlacementRule,
  PlacementRuleStatus,
  Policy,
  PolicyAutomation,
  PolicyAutomationDefinition,
  PolicySet,
} from '../../../../resources'
import { Metadata } from '../../../../resources/metadata'
import { useRecoilValue, useSharedAtoms } from '../../../../shared-recoil'
import { AcmButton, AcmDescriptionList, AcmDrawerContext, AcmTable } from '../../../../ui-components'
import { usePropagatedPolicies } from '../../common/useCustom'
import {
  getPlacementDecisionsForPlacements,
  getPlacementsForResource,
  getPolicyDescription,
  getPolicyRemediation,
} from '../../common/util'
import { AutomationDetailsSidebar } from '../../components/AutomationDetailsSidebar'
import { ClusterPolicyViolationIcons } from '../../components/ClusterPolicyViolations'
import { useGovernanceData } from '../../useGovernanceData'
import { usePolicyDetailsContext } from './PolicyDetailsPage'
import { useLocalHubName } from '../../../../hooks/use-local-hub'

interface TableData {
  apiVersion: string
  kind: string
  metadata: Metadata
  status: PlacementRuleStatus | PlacementDecisionStatus
  policy: Policy
}

export default function PolicyDetailsOverview() {
  const { policy } = usePolicyDetailsContext()
  const { t } = useTranslation()
  const { setDrawerContext } = useContext(AcmDrawerContext)
  const {
    placementBindingsState,
    placementDecisionsState,
    placementRulesState,
    placementsState,
    policyAutomationState,
    policySetsState,
    settingsState,
  } = useSharedAtoms()
  const placements = useRecoilValue(placementsState)
  const policySets = useRecoilValue(policySetsState)
  const placementBindings = useRecoilValue(placementBindingsState)
  const placementRules = useRecoilValue(placementRulesState)
  const placementDecisions = useRecoilValue(placementDecisionsState)
  const policyAutomations = useRecoilValue(policyAutomationState)
  const settings = useRecoilValue(settingsState)
  const policies = usePropagatedPolicies(policy)
  const { clusterRiskScore } = useGovernanceData([policy])
  const policyAutomationMatch = policyAutomations.find(
    (pa: PolicyAutomation) => pa.spec.policyRef === policy.metadata.name
  )
  const [modal, setModal] = useState<ReactNode | undefined>()
  const [expandedViolationStatuses, setExpandedViolationStatuses] = useState<Set<string>>(new Set())
  const canCreatePolicyAutomation = useIsAnyNamespaceAuthorized(rbacCreate(PolicyAutomationDefinition))
  const canUpdatePolicyAutomation = useIsAnyNamespaceAuthorized(rbacUpdate(PolicyAutomationDefinition))
  const hubClusterName = useLocalHubName()

  const toggleViolationExpanded = useCallback((key: string) => {
    setExpandedViolationStatuses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  // Need to get bindings for all policysets a policy is included in
  const associatedPolicySets = policySets.filter(
    (ps: PolicySet) =>
      ps.metadata.namespace === policy.metadata.namespace && ps.spec.policies.includes(policy.metadata.name!)
  )

  const getPlacementMatches = useCallback(
    function getPlacementMatches<T extends Placement | PlacementRule>(
      policy: Policy,
      placementResources: T[],
      placementDecisions: PlacementDecision[]
    ) {
      let matches: T[] = []
      const resources: any[] = [policy]
      if (associatedPolicySets.length > 0) {
        resources.push(...associatedPolicySets)
      }
      resources.forEach(
        (resource: Policy | PolicySet) =>
          (matches = [...matches, ...getPlacementsForResource(resource, placementBindings, placementResources)])
      )
      return matches.map((placement: T) => {
        if (placement.kind === 'Placement') {
          const decisions = getPlacementDecisionsForPlacements(placementDecisions, [placement])[0]?.status
          return {
            apiVersion: placement.apiVersion,
            kind: placement.kind,
            metadata: placement.metadata,
            status: decisions ?? {},
            policy,
          }
        }
        return {
          apiVersion: placement.apiVersion,
          kind: placement.kind,
          metadata: placement.metadata,
          status: placement.status ?? {},
          policy,
        }
      })
    },
    [associatedPolicySets, placementBindings]
  )

  const placementRuleMatches: TableData[] = useMemo(() => {
    return getPlacementMatches(policy, placementRules, [])
  }, [getPlacementMatches, placementRules, policy])

  const placementMatches: TableData[] = useMemo(() => {
    return getPlacementMatches(policy, placements, placementDecisions)
  }, [getPlacementMatches, policy, placements, placementDecisions])

  // Helper function to render violations at policy level
  const renderPolicyViolations = useCallback(
    (expandedStatuses: Set<string>, toggleExpanded: (key: string) => void) => {
      // Get policy status directly - this already contains the UNION of all clusters across all placements
      const rawStatusList: {
        clustername: string
        compliant?: string
      }[] = policy.status?.status ?? []

      // Build lists of clusters, organized by status keys
      const clusterList: Record<string, Set<string>> = {}
      rawStatusList.forEach((statusObject) => {
        let compliant = statusObject?.compliant ?? 'nostatus'
        compliant = compliant.toLowerCase()
        const clusterName = statusObject.clustername

        // Add cluster to its associated status list in the clusterList object
        if (Object.prototype.hasOwnProperty.call(clusterList, compliant)) {
          // Each cluster name should be unique, so if one is already present, log an error
          if (clusterList[compliant].has(clusterName)) {
            console.error(`Unexpected duplicate cluster in '${compliant}' cluster list: ${clusterName}`)
          } else {
            clusterList[compliant].add(clusterName)
          }
        } else {
          clusterList[compliant] = new Set([clusterName])
        }
      })

      // Push lists of clusters along with status icon, heading, and overflow badge
      const statusList = []
      const maxClustersToShow = 3
      for (const status of Object.keys(clusterList)) {
        const clusterArray = Array.from(clusterList[status])
        const totalClusters = clusterArray.length
        const statusKey = `policy-${status}`
        const isExpanded = expandedStatuses.has(statusKey)
        const clustersToShow = isExpanded ? clusterArray : clusterArray.slice(0, maxClustersToShow)
        const remainingCount = totalClusters - maxClustersToShow

        let statusMsg = t('No status on {{count}} clusters', { count: totalClusters })
        let icon = <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--100)" />
        switch (status) {
          case 'noncompliant':
            statusMsg = t('Violations on {{count}} clusters', { count: totalClusters })
            icon = (
              <Icon status="danger">
                <ExclamationCircleIcon />
              </Icon>
            )
            break
          case 'compliant':
            statusMsg = t('No violations on {{count}} clusters', { count: totalClusters })
            icon = (
              <Icon status="success">
                <CheckCircleIcon />
              </Icon>
            )
            break
          case 'pending':
            statusMsg = t('Pending on {{count}} clusters', { count: totalClusters })
            icon = (
              <Icon status="warning">
                <ExclamationTriangleIcon />
              </Icon>
            )
            break
        }
        statusList.push(
          <div key={statusKey}>
            <span style={{ marginRight: '0.5rem' }}>{icon}</span>
            <span>{statusMsg}: </span>
            {clustersToShow.map((cluster: string, index) => {
              if (status !== 'nostatus') {
                return (
                  <span key={`${cluster}-link`}>
                    <Link
                      to={{
                        pathname: generatePath(NavigationPath.policyDetailsResults, {
                          namespace: policy.metadata.namespace!,
                          name: policy.metadata.name!,
                        }),
                        search: `?search=${cluster}`,
                      }}
                    >
                      {cluster}
                    </Link>
                    {index < clustersToShow.length - 1 && ', '}
                  </span>
                )
              }
              return (
                <span key={`${cluster}-link`}>
                  {cluster}
                  {index < clustersToShow.length - 1 && ', '}
                </span>
              )
            })}
            {!isExpanded && remainingCount > 0 && (
              <Button
                variant="link"
                isInline
                onClick={() => toggleExpanded(statusKey)}
                style={{ marginLeft: '0.25rem', padding: 0 }}
              >
                +{remainingCount} more
              </Button>
            )}
          </div>
        )
      }
      // If there are no clusters, return a hyphen
      if (statusList.length === 0) {
        return (
          <div>
            <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--100)" /> {t('No status')}
          </div>
        )
      }
      return statusList
    },
    [policy.metadata.name, policy.metadata.namespace, policy.status?.status, t]
  )

  const { leftItems, rightItems } = useMemo(() => {
    const unauthorizedMessage = !canCreatePolicyAutomation || !canUpdatePolicyAutomation ? t('rbac.unauthorized') : ''
    const leftItems = [
      {
        key: t('Name'),
        value: policy.metadata.name ?? '-',
      },
      {
        key: t('Description'),
        value: getPolicyDescription(policy),
      },
      {
        key: t('Namespace'),
        value: policy.metadata.namespace,
      },
      {
        key: t('Status'),
        value: policy.spec.disabled ? t('Disabled') : t('Enabled') ?? '-',
      },
      {
        key: t('Remediation'),
        value: getPolicyRemediation(policy, policies),
      },
    ]

    // Add cluster violations to left column when feature flag is disabled (old UI)
    if (settings.placementDetailsEnhancements !== 'enabled') {
      leftItems.push({
        key: t('Cluster violations'),
        value: <ClusterPolicyViolationIcons risks={clusterRiskScore} />,
      })
    }

    const rightItems = [
      {
        key: t('Categories'),
        value: policy.metadata.annotations?.['policy.open-cluster-management.io/categories'] ?? '-',
      },
      {
        key: t('Controls'),
        value: policy.metadata.annotations?.['policy.open-cluster-management.io/controls'] ?? '-',
      },
      {
        key: t('Standards'),
        value: policy.metadata.annotations?.['policy.open-cluster-management.io/standards'] ?? '-',
      },
      {
        key: t('Created'),
        value: <AcmTimestamp timestamp={policy.metadata?.creationTimestamp ?? ''} />,
      },
      {
        key: t('Automation'),
        value: policyAutomationMatch ? (
          <AcmButton
            isDisabled={!canUpdatePolicyAutomation}
            tooltip={unauthorizedMessage}
            isInline
            variant={ButtonVariant.link}
            onClick={() =>
              setDrawerContext({
                isExpanded: true,
                onCloseClick: () => {
                  setDrawerContext(undefined)
                },
                title: policyAutomationMatch.metadata.name,
                panelContent: (
                  <AutomationDetailsSidebar
                    setModal={setModal}
                    policyAutomationMatch={policyAutomationMatch}
                    policy={policy}
                    onClose={() => setDrawerContext(undefined)}
                  />
                ),
                panelContentProps: { defaultSize: '40%' },
                isInline: true,
                isResizable: true,
              })
            }
          >
            {policyAutomationMatch.metadata.name}
          </AcmButton>
        ) : (
          <AcmButton
            isDisabled={!canCreatePolicyAutomation}
            tooltip={unauthorizedMessage}
            isInline
            variant={ButtonVariant.link}
            component={Link}
            to={generatePath(NavigationPath.createPolicyAutomation, {
              namespace: policy.metadata.namespace!,
              name: policy.metadata.name!,
            })}
            linkState={{
              from: generatePath(NavigationPath.policyDetails, {
                namespace: policy.metadata.namespace!,
                name: policy.metadata.name!,
              }),
            }}
          >
            {t('Configure')}
          </AcmButton>
        ),
      },
    ]

    // Add new placement and violations fields when feature flag is enabled
    if (settings.placementDetailsEnhancements === 'enabled') {
      // Prepare placement information for display
      const allPlacements = [...placementMatches, ...placementRuleMatches]
      const placementValue =
        allPlacements.length > 0 ? (
          <>
            {allPlacements.map((placement, index) => {
              // Build search params for details page
              const params = new URLSearchParams({
                cluster: hubClusterName,
                kind: placement.kind,
                apiversion: placement.apiVersion,
                name: placement.metadata.name,
                _hubClusterResource: 'true',
              })
              if (placement.metadata.namespace) {
                params.set('namespace', placement.metadata.namespace)
              }

              return (
                <span key={placement.metadata.uid}>
                  <Link
                    to={{
                      pathname: NavigationPath.resources,
                      search: `?${params.toString()}`,
                    }}
                  >
                    {placement.metadata.name}
                  </Link>
                  {index < allPlacements.length - 1 && ', '}
                </span>
              )
            })}
          </>
        ) : (
          '-'
        )

      const violationsValue = renderPolicyViolations(expandedViolationStatuses, toggleViolationExpanded)

      rightItems.push(
        {
          key: t('Placement'),
          value: placementValue,
        },
        {
          key: t('Cluster violations'),
          value: violationsValue,
        }
      )
    }
    return { leftItems, rightItems }
  }, [
    policy,
    policyAutomationMatch,
    setDrawerContext,
    canCreatePolicyAutomation,
    canUpdatePolicyAutomation,
    policies,
    placementMatches,
    placementRuleMatches,
    renderPolicyViolations,
    expandedViolationStatuses,
    toggleViolationExpanded,
    hubClusterName,
    clusterRiskScore,
    settings.placementDetailsEnhancements,
    t,
  ])

  return (
    <PageSection hasBodyWrapper={false}>
      {modal !== undefined && modal}
      <div id="violation.details">
        <AcmDescriptionList title={t('Policy details')} leftItems={leftItems} rightItems={rightItems} />
      </div>
      {settings.placementDetailsEnhancements !== 'enabled' && (
        <>
          <Title headingLevel="h4">{t('Placement')}</Title>
          <AcmTable<TableData>
            items={[...placementMatches, ...placementRuleMatches]}
            emptyState={
              <Alert title={t('No placements')} variant={'info'} isInline>
                <Stack>
                  <div>{t('There are no placements for this policy.')}</div>
                </Stack>
              </Alert>
            }
            columns={[
              {
                header: t('Name'),
                cell: (placement: TableData) => placement.metadata.name ?? '-',
                sort: (a: TableData, b: TableData) => {
                  const aName = a.metadata.name ?? ''
                  const bName = b.metadata.name ?? ''
                  return aName.localeCompare(bName)
                },
              },
              {
                header: t('Kind'),
                cell: (placement: TableData) => placement.kind ?? '-',
                sort: (a: TableData, b: TableData) => {
                  const aKind = a.kind ?? ''
                  const bKind = b.kind ?? ''
                  return aKind.localeCompare(bKind)
                },
              },
              {
                header: t('Clusters'),
                cell: (placement: TableData) => {
                  if (placement.kind === 'Placement') {
                    const decisions = (placement.status as PlacementDecisionStatus)?.decisions
                    return decisions?.length ?? 0
                  } else {
                    const decisions = (placement.status as PlacementRuleStatus)?.decisions
                    return decisions?.length ?? 0
                  }
                },
              },
              {
                header: t('Violations'),
                cell: (placement: TableData) => {
                  if (placement.kind === 'Placement') {
                    const decisions = (placement.status as PlacementDecisionStatus)?.decisions ?? []
                    const clusterNames = decisions.map((decision) => decision.clusterName)
                    return <ClusterPolicyViolationIcons risks={clusterRiskScore} clusterNames={clusterNames} />
                  } else {
                    const decisions = (placement.status as PlacementRuleStatus)?.decisions ?? []
                    const clusterNames = decisions.map((decision) => decision.clusterName)
                    return <ClusterPolicyViolationIcons risks={clusterRiskScore} clusterNames={clusterNames} />
                  }
                },
              },
            ]}
            keyFn={(placement: TableData) => placement.metadata.uid!}
          />
        </>
      )}
    </PageSection>
  )
}
