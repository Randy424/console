/* Copyright Contributors to the Open Cluster Management project */
import React, { useContext, createContext } from 'react'
import { PluginContext } from '../../../lib/PluginContext'
import { KubevirtPluginData } from '../../../plugin-extensions/extensions/KubevirtContext'
import { ResourceSearchLink } from './DetailsOverviewPage'
import { K8sGroupVersionKind, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk'
import { useRecoilValue, useSharedAtoms } from '../../../shared-recoil'
import classNames from 'classnames'

// Define a default context
const DefaultKubevirtPluginContext = createContext<KubevirtPluginData>({} as KubevirtPluginData)

const getResourceLinkOverride = (clusterName: string, inline?: boolean, truncate?: boolean, className?: string) => {
  const ResourceLink = (props: { name?: string; groupVersionKind?: K8sGroupVersionKind }) => {
    const { name = '', groupVersionKind } = props
    const classes = classNames('co-resource-item', className, {
      'co-resource-item--inline': inline,
      'co-resource-item--truncate': truncate,
    })
    if (!groupVersionKind) {
      return null
    }
    const { version, kind } = groupVersionKind
    return (
      <span className={classes}>
        <ResourceIcon kind={groupVersionKind.kind} />
        <ResourceSearchLink className='co-resource-item__resource-name' cluster={clusterName} apiversion={version} kind={kind} name={name} />{' '}
      </span>
    )
  }

  return ResourceLink
}

const KubevirtPluginWrapper = (props: { children: React.ReactNode; clusterName: string }) => {
  const { children, clusterName } = props
  const { managedClustersState } = useSharedAtoms()
  const managedClusters = useRecoilValue(managedClustersState)
  const isLocalCluster =
    managedClusters.find((cls) => cls.metadata.name === clusterName)?.metadata.labels?.['local-cluster'] === 'true'
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