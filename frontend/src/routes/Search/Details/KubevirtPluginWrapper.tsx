/* Copyright Contributors to the Open Cluster Management project */
import React, { useContext, createContext, Context } from 'react'
import { KubevirtPluginData } from '../../../plugin-extensions/extensions/SearchDetails'
import { PluginContext } from '../../../lib/PluginContext'

// Define a default context
const DefaultKubevirtPluginContext = createContext<KubevirtPluginData>({} as KubevirtPluginData)

const KubevirtPluginWrapper = (props: { children: React.ReactNode, sharedDetailsNamespaceLink?: React.ReactNode }) => {
  const { children, sharedDetailsNamespaceLink } = props
  const { acmExtensions } = useContext(PluginContext)
  let KubevirtPluginContext = DefaultKubevirtPluginContext

  if (acmExtensions?.kubevirtContext && acmExtensions.kubevirtContext.length) {
    KubevirtPluginContext = acmExtensions.kubevirtContext[0].properties.context as Context<KubevirtPluginData>
  }

  const kubevirtContext = useContext(KubevirtPluginContext)
  const contextOverride = {
    ...kubevirtContext,
    dynamicPluginSDK: {
      ...kubevirtContext.dynamicPluginSDK,
      dynamicPluginSharedComponents: { SearchDetailsNamespaceLink: sharedDetailsNamespaceLink },
    },
  }

  return <KubevirtPluginContext.Provider value={contextOverride}>{children}</KubevirtPluginContext.Provider>
}

export default KubevirtPluginWrapper
