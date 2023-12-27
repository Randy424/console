/* Copyright Contributors to the Open Cluster Management project */
// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19

import { Metadata } from './metadata'

export interface IResourceDefinition {
  apiVersion: string
  kind: string
}

export interface IResource extends IResourceDefinition {
  status?: any
  apiVersion: string
  kind: string
  metadata?: Metadata
}

export interface ResourceList<Resource extends IResource> {
  kind: string
  items?: Resource[]
}
