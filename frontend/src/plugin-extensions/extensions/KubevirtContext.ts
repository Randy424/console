/* Copyright Contributors to the Open Cluster Management project */
import { CodeRef, Extension, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types'
import * as OpenshiftDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk'
import { Context } from 'react'

/** Properties type */
export type KubevirtPluginContext = {
  dynamicPluginSDK: typeof OpenshiftDynamicPluginSDK
}

export type KubevirtPluginDataProps = {
  context?: CodeRef<Context<KubevirtPluginContext>>
}

/** This extension allows plugins to contribute a tab to Overview page */
export type KubevirtPluginContextExtension = ExtensionDeclaration<'acm.kubevirt-context', KubevirtPluginDataProps>

// Type guards
export const isKubevirtPluginContext = (e: Extension): e is KubevirtPluginContextExtension => {
  return e.type === 'acm.kubevirt-context'
}
