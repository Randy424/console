/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import { credentialsCreateMethods } from '../../../support/action-utils/credentials-actions'
import * as misc from '../../../support/api-utils/misc'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))
const fips = Cypress.env('FIPS') || false
const arch = Cypress.env('ARCH') || 'amd64'
const networkType = Cypress.env('NETWORK_TYPE') || 'OpenShiftSDN'
const ocpImageRegistry = Cypress.env('CLC_OCP_IMAGE_REGISTRY') || 'quay.io/openshift-release-dev/ocp-release'
const ocpReleaseImage = Cypress.env('CLC_OCP_IMAGE_VERSION') || '4.12.0'

describe(
  'create SNO clusters',
  {
    tags: ['@CLC', '@create', '@sno', '@dev-preview'],
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.login()
    })
    it(
      `RHACM4K-4072: CLC: Clusters - Verify Single Node Openshift(SNO) 'AWS' cluster creation`,
      { tags: ['sno', 'aws', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })
        let releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        misc.enableSNO().then(() => {
          managedClustersMethods.createSNOCluster('aws', releaseImage, '', arch, fips).then((clusterName) => {
            managedClustersMethods.validateSNOClusterCreation(clusterName)
          })
        })
      }
    )
    it(
      `RHACM4K-4073: CLC: Clusters - Verify Single Node Openshift(SNO) 'Azure' cluster creation`,
      { tags: ['sno', 'azure', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addAzureCredential(
          { ...options.connections.apiKeys.azure, ...options.connections.secrets },
          'AzurePublicCloud'
        )
        let releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        misc.enableSNO().then(() => {
          managedClustersMethods.createSNOCluster('azure', releaseImage, '', arch, fips).then((clusterName) => {
            managedClustersMethods.validateSNOClusterCreation(clusterName)
          })
        })
      }
    )
    it(
      `RHACM4K-4074: CLC: Clusters - Verify Single Node Openshift(SNO) 'GCP' cluster creation`,
      { tags: ['sno', 'gcp', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addGCPCredential({
          ...options.connections.apiKeys.gcp,
          ...options.connections.secrets,
        })
        let releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        misc.enableSNO().then(() => {
          managedClustersMethods.createSNOCluster('gcp', releaseImage, '', arch, fips).then((clusterName) => {
            managedClustersMethods.validateSNOClusterCreation(clusterName)
          })
        })
      }
    )
    it(
      `RHACM4K-4076: CLC: Clusters - Verify Single Node Openshift(SNO) 'Openstack' cluster creation`,
      { tags: ['sno', 'openstack', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addOpenStackCredential({
          ...options.connections.apiKeys.openstack,
          ...options.connections.secrets,
        })
        options.clusters.openstacksno.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        misc.enableSNO().then(() => {
          managedClustersMethods.createOpenStackCluster(
            { ...options.connections.apiKeys.openstack, ...options.clusters.openstacksno },
            arch,
            true,
            networkType,
            fips
          )
          managedClustersMethods.validateSNOClusterCreation(options.clusters.openstacksno.clusterName)
        })
      }
    )
  }
)
