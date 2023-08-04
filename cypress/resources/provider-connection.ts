/* Copyright Contributors to the Open Cluster Management project */
import { Metadata } from './metadata'
import { IResourceDefinition } from './resource'

export const ProviderConnectionApiVersion = 'v1'
export type ProviderConnectionApiVersionType = 'v1'

export const ProviderConnectionKind = 'Secret'
export type ProviderConnectionKindType = 'Secret'

export const ProviderConnectionDefinition: IResourceDefinition = {
  apiVersion: ProviderConnectionApiVersion,
  kind: ProviderConnectionKind,
}

export interface ProviderConnectionStringData {
  // AWS
  aws_access_key_id?: string
  aws_secret_access_key?: string

  // AWS S3
  bucket?: string
  credentials?: string
  region?: string

  // Azure
  baseDomainResourceGroupName?: string
  ['osServicePrincipal.json']?: string
  cloudName?: string

  // GCP
  projectID?: string
  ['osServiceAccount.json']?: string

  // vSphere
  username?: string
  password?: string
  vCenter?: string
  cacertificate?: string
  cluster?: string
  datacenter?: string
  defaultDatastore?: string
  vsphereDiskType?: string
  vsphereFolder?: string
  vsphereResourcePool?: string

  // Hive BareMetal
  libvirtURI?: string
  sshKnownHosts?: string
  imageMirror?: string
  bootstrapOSImage?: string
  clusterOSImage?: string
  disconnectedAdditionalTrustBundle?: string

  // OpenShift Cluster Manager
  ocmAPIToken?: string

  // OpenStack
  ['clouds.yaml']?: string
  cloud?: string
  os_ca_bundle?: string

  // Red Hat Virtualization
  ovirt_url?: string
  ovirt_fqdn?: string
  ovirt_username?: string
  ovirt_password?: string
  ovirt_ca_bundle?: string

  baseDomain?: string
  pullSecret?: string
  ['ssh-privatekey']?: string
  ['ssh-publickey']?: string

  httpProxy?: any
  httpsProxy?: any
  noProxy?: any
  imageContentSources?: any
  additionalTrustBundle?: string

  host?: string
  token?: string
}

export interface ProviderConnection {
  apiVersion: ProviderConnectionApiVersionType
  kind: ProviderConnectionKindType
  metadata: Metadata
  data?: ProviderConnectionStringData
  stringData?: ProviderConnectionStringData
  type: 'Opaque'
}
