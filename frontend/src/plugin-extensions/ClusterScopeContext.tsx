/* Copyright Contributors to the Open Cluster Management project */

import { createContext, PropsWithChildren, useMemo } from 'react'

export type ClusterScope = {
  cluster: string
}

export const ClusterScopeContext = createContext<ClusterScope>({ cluster: 'local-cluster' })

export const ClusterScope = ({ children, cluster }: PropsWithChildren<ClusterScope>) => {
  const value = useMemo(() => ({ cluster }), [cluster])
  return <ClusterScopeContext.Provider value={value}>{children}</ClusterScopeContext.Provider>
}
