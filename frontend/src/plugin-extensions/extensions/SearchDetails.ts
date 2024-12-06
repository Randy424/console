/* Copyright Contributors to the Open Cluster Management project */
import { CodeRef, Extension, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types'
import * as OpenshiftDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk'
import { Context } from 'react'

/** Properties type */
export type KubevirtPluginData = {
  dynamicPluginSDK: typeof OpenshiftDynamicPluginSDK
}

export type SearchDetailsProps = {
  component: CodeRef<React.ComponentType>
  context?: CodeRef<Context<KubevirtPluginData>>
}

/** This extension allows plugins to contribute a tab to Overview page */
export type SearchDetails = ExtensionDeclaration<'acm.search/details', SearchDetailsProps>

// Type guards

export const isSearchDetails = (e: Extension): e is SearchDetails => {
  return e.type === 'acm.search/details'
}
