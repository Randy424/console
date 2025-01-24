/* Copyright Contributors to the Open Cluster Management project */
import { useContext, useMemo, PropsWithChildren } from 'react'
import { ResourceSearchLink } from './DetailsOverviewPage'
import {
  K8sModel,
  K8sResourceCommon,
  ResourceIcon,
  ResourceLinkProps,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk'
import * as DefaultDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk'
import { useIsLocalHub, useLocalHubName } from '../../../hooks/use-local-hub'
import { NavigationPath } from '../../../NavigationPath'
import { generatePath } from 'react-router-dom-v5-compat'
import { GetUrlSearchParam } from '../searchDefinitions'
import { searchClient } from '../search-sdk/search-client'
import { convertStringToQuery } from '../search-helper'
import { useSearchResultItemsQuery } from '../search-sdk/search-sdk'
import { ClusterScope, ClusterScopeContext } from '../../../plugin-extensions/ClusterScopeContext'
import { useKubevirtPluginContext } from '../../../plugin-extensions/hooks/useKubevirtPluginContext'
import { useK8sGetResource } from './useK8sGetResource'

const ResourceLink = (props: ResourceLinkProps) => {
  const { cluster } = useContext(ClusterScopeContext)

  if (useIsLocalHub(cluster)) {
    const { ResourceLink: ResourceLinkDefault } = DefaultDynamicPluginSDK
    return <ResourceLinkDefault {...props} />
  }

  const { groupVersionKind, name, namespace } = props
  if (!groupVersionKind) {
    return null
  }
  const { group, version, kind } = groupVersionKind
  return (
    <span className="co-resource-item">
      <ResourceIcon groupVersionKind={groupVersionKind} />
      <ResourceSearchLink
        className="co-resource-item__resource-name"
        cluster={cluster}
        apiversion={group ? `${group}/${version}` : version}
        kind={kind}
        name={name}
        namespace={namespace}
      />{' '}
    </span>
  )
}

const ALL_NAMESPACES_SESSION_KEY = '#ALL_NS#'

type ResourceUrlProps = {
  activeNamespace?: string
  model: K8sModel
  resource?: K8sResourceCommon
}

/**
 * function for getting a resource URL
 * @param {ResourceUrlProps} urlProps - object with model, resource to get the URL from (optional) and active namespace/project name (optional)
 * @returns {string} the URL for the resource
 */
export const getResourceUrl = (urlProps: ResourceUrlProps): string | null => {
  const { activeNamespace, model, resource } = urlProps

  if (!model) return null
  const { crd, namespaced, plural, kind, apiGroup, apiVersion } = model

  const namespace = resource?.metadata?.namespace || (activeNamespace !== ALL_NAMESPACES_SESSION_KEY && activeNamespace)
  const name = resource?.metadata?.name || ''
  // TODO - parameterize cluster
  const cluster = 'local-cluster'
  if (apiGroup === 'kubevirt.io' && apiVersion === 'v1' && kind == 'VirtualMachine') {
    if (name && namespace) {
      const searchParams = GetUrlSearchParam({
        cluster,
        kind,
        apigroup: apiGroup,
        apiversion: apiVersion,
        name,
        namespace,
      })
      return `${NavigationPath.resources}${searchParams}`
    } else if (namespace) {
      return generatePath(NavigationPath.virtualMachinesForNamespace, { cluster, namespace })
    } else {
      return NavigationPath.virtualMachines
    }
  }

  const namespaceUrl = namespace ? `ns/${namespace}` : 'all-namespaces'
  const ref = crd ? `${model.apiGroup || 'core'}~${model.apiVersion}~${model.kind}` : plural || ''

  return `/k8s/${namespaced ? namespaceUrl : 'cluster'}/${ref}/${name}`
}

const useMulticlusterSearchWatch = (watchOptions: WatchK8sResource) => {
  console.log(`USE-MULTICLUSTER-SEARCH-WATCH ${JSON.stringify(watchOptions)}`)
  const { groupVersionKind, limit, namespace, namespaced } = watchOptions
  const { group, version, kind } = groupVersionKind ?? {}
  const {
    data: result,
    loading,
    error,
  } = useSearchResultItemsQuery({
    client: process.env.NODE_ENV === 'test' ? undefined : searchClient,
    variables: {
      input: [
        convertStringToQuery(
          `apigroup:${group} apiversion:${version} kind:${kind}${namespaced && namespace ? ` ${namespace}` : ''}`,
          limit ?? -1
        ),
      ],
    },
  })
  const data = useMemo(
    () =>
      result?.searchResult?.[0]?.items?.map((item) => {
        const resource: any = {
          cluster: item.cluster,
          apiVersion: `${item.apigroup ? `${item.apigroup}/` : ''}${item.apiversion}`,
          kind: item.kind,
          metadata: {
            creationTimestamp: item.created,
            name: item.name,
            namespace: item.namespace,
          },
        }
        // Reverse the flattening of specific resources by the search-collector
        // See https://github.com/stolostron/search-collector/blob/main/pkg/transforms/genericResourceConfig.go
        switch (kind) {
          case 'VirtualMachine':
            resource.spec = {
              running: item._specRunning,
              runStrategy: item._specRunStrategy,
              template: { spec: { domain: { cpu: { cores: item.cpu }, memory: { guest: item.memory } } } },
            }
            resource.status = { conditions: [{ type: 'Ready', status: item.ready }], printableStatus: item.status }
            break
          case 'VirtualMachineInstance':
            resource.status = {
              conditions: [
                { type: 'LiveMigratable', status: item.liveMigratable },
                { type: 'Ready', status: item.ready },
              ],
              interfaces: [{ ipAddress: item.ipaddress, name: 'default' }],
              nodeName: item.node,
              phase: item.phase,
            }
        }
        return resource
      }),
    [kind, result]
  )
  return [data, !loading, error]
}

const KubevirtPluginWrapper = ({
  children,
  currentCluster,
  currentNamespace,
}: PropsWithChildren<{
  currentCluster?: string
  currentNamespace?: string
}>) => {
  const localHubName = useLocalHubName()
  const defaultClusterName = currentCluster ?? localHubName ?? 'local-cluster'

  const KubevirtPluginContext = useKubevirtPluginContext()
  const useK8sWatchResource = useK8sGetResource

  const contextValue = useMemo(
    () => ({
      clusterScope: { ClusterScope },
      currentCluster,
      currentNamespace,
      dynamicPluginSDK: { ...DefaultDynamicPluginSDK, ResourceLink, useK8sWatchResource},
      getResourceUrl,
      supportsMulticluster: true,
      useMulticlusterSearchWatch,
    }),
    [currentCluster, currentNamespace]
  )

  return (
    <KubevirtPluginContext.Provider value={contextValue}>
      <ClusterScope cluster={defaultClusterName}>{children}</ClusterScope>
    </KubevirtPluginContext.Provider>
  )
}

export default KubevirtPluginWrapper
