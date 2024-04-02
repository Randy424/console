/* Copyright Contributors to the Open Cluster Management project */

import { Metadata } from './metadata'
import { IResource, IResourceDefinition } from './resource'

export const ManagedClusterApiVersion = 'cluster.open-cluster-management.io/v1'
export type ManagedClusterApiVersionType = 'cluster.open-cluster-management.io/v1'

export const ManagedClusterKind = 'ManagedCluster'
export type ManagedClusterKindType = 'ManagedCluster'

export const ManagedClusterDefinition: IResourceDefinition = {
  apiVersion: ManagedClusterApiVersion,
  kind: ManagedClusterKind,
}

export interface ManagedCluster extends IResource {
  apiVersion: ManagedClusterApiVersionType
  kind: ManagedClusterKindType
  metadata: Metadata
  spec?: {
    hubAcceptsClient: boolean
    leaseDurationSeconds?: number
    managedClusterClientConfigs?: any[]
  }
  status?: {
    allocatable: {
      cpu: string
      memory: string
    }
    capacity: {
      cpu: string
      memory: string
    }
    version: {
      kubernetes: string
    }
    clusterClaims: { name: string; value: string }[]
  }
}
