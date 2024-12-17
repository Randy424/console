/* Copyright Contributors to the Open Cluster Management project */
import React, { useContext, createContext } from 'react'
import { PluginContext } from '../../../lib/PluginContext'
import { KubevirtPluginData } from '../../../plugin-extensions/extensions/KubevirtContext'
import { useAllClusters } from '../../Infrastructure/Clusters/ManagedClusters/components/useAllClusters'
import { ResourceSearchLink } from './DetailsOverviewPage'
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk'

// Define a default context
const DefaultKubevirtPluginContext = createContext<KubevirtPluginData>({} as KubevirtPluginData)

const getResourceLinkOverride = (clusterName: string) => {
  const ResourceLink = (props: { name?: string; groupVersionKind?: K8sGroupVersionKind }) => {
    const { name = '', groupVersionKind } = props
    if (!groupVersionKind) {
      return null
    }
    const { version, kind } = groupVersionKind
    return <ResourceSearchLink cluster={clusterName} apiversion={version} kind={kind} name={name} />
  }

  return ResourceLink
}

const KubevirtPluginWrapper = (props: { children: React.ReactNode; clusterName: string }) => {
  const { children, clusterName } = props
  const managedClusters = useAllClusters(true)
  const isLocalCluster = managedClusters.find((cls) => cls.name === clusterName)?.labels?.['local-cluster'] === 'true'
  if (isLocalCluster) {
    return children
  }

  const { acmExtensions } = useContext(PluginContext)
  const KubevirtPluginContext = acmExtensions?.kubevirtContext?.[0].properties.context ?? DefaultKubevirtPluginContext
  const { dynamicPluginSDK, ...other } = useContext(KubevirtPluginContext)
  const ResourceLink = getResourceLinkOverride(clusterName)
  const contextOverride = { dynamicPluginSDK: { ...dynamicPluginSDK, ResourceLink }, ...other }

  return <KubevirtPluginContext.Provider value={contextOverride}>{children}</KubevirtPluginContext.Provider>
}

export default KubevirtPluginWrapper
