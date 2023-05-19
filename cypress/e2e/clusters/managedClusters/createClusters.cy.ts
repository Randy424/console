/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import {
  clusterActions,
  clusterMetricsActions,
  clusterDeploymentActions,
} from '../../../support/action-utils/clusterAction'
import { credentialsCreateMethods } from '../../../support/action-utils/credentials-actions'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))
const fips = Cypress.env('FIPS') || false
const arch = Cypress.env('ARCH') || 'amd64'
const networkType = Cypress.env('NETWORK_TYPE') || 'OpenShiftSDN'
const ocpImageRegistry = Cypress.env('CLC_OCP_IMAGE_REGISTRY') || 'quay.io/openshift-release-dev/ocp-release'
const ocpReleaseImage = Cypress.env('CLC_OCP_IMAGE_VERSION') || '4.12.0'

describe(
  'create clusters',
  {
    tags: ['@CLC', '@create'],
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
      `RHACM4K-7473: CLC: Create an AWS managed cluster via the UI`,
      { tags: ['aws', 'managedclusters', '@ocpInterop', '@post-release'] },
      function () {
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })
        options.clusters.aws.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createCluster(
          { ...options.connections.apiKeys.aws, ...options.clusters.aws },
          arch,
          networkType,
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.aws.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.aws.clusterName)
        clusterDeploymentActions.assertInstallAttempt(options.clusters.aws.clusterName, 1)
        clusterMetricsActions.checkClusterMetrics(options.clusters.aws.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.aws.clusterName)
        clusterActions.assertCloudSecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName, 'aws')
        clusterActions.assertPullSecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName)
        clusterActions.assertSSHKeySecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName)
      }
    )

    it(`RHACM4K-7474: CLC: Create a GCP managed cluster via the UI`, { tags: ['gcp', 'managedclusters'] }, function () {
      credentialsCreateMethods.addGCPCredential({ ...options.connections.apiKeys.gcp, ...options.connections.secrets })
      options.clusters.gcp.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
      managedClustersMethods.createCluster(
        { ...options.connections.apiKeys.gcp, ...options.clusters.gcp },
        arch,
        networkType,
        fips
      )
      managedClustersMethods.checkClusterStatus(options.clusters.gcp.clusterName)
      clusterActions.extractClusterKubeconfig(options.clusters.gcp.clusterName)
      clusterDeploymentActions.assertInstallAttempt(options.clusters.gcp.clusterName, 1)
      clusterMetricsActions.checkClusterMetrics(options.clusters.gcp.clusterName)
      managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.gcp.clusterName)
      clusterActions.assertCloudSecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName, 'gcp')
      clusterActions.assertPullSecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName)
      clusterActions.assertSSHKeySecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName)
    })

    it(
      `RHACM4K-7475: CLC: Create an Azure managed cluster via the UI`,
      { tags: ['azure', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addAzureCredential(
          { ...options.connections.apiKeys.azure, ...options.connections.secrets },
          'AzurePublicCloud'
        )
        options.clusters.azure.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createCluster(
          { ...options.connections.apiKeys.azure, ...options.clusters.azure },
          arch,
          networkType,
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.azure.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.azure.clusterName)
        clusterDeploymentActions.assertInstallAttempt(options.clusters.azure.clusterName, 1)
        clusterMetricsActions.checkClusterMetrics(options.clusters.azure.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.azure.clusterName)
        clusterActions.assertCloudSecrets(
          options.clusters.azure.clusterName,
          options.clusters.azure.clusterName,
          'azure'
        )
        clusterActions.assertPullSecrets(options.clusters.azure.clusterName, options.clusters.azure.clusterName)
        clusterActions.assertSSHKeySecrets(options.clusters.azure.clusterName, options.clusters.azure.clusterName)
      }
    )

    it(
      `RHACM4K-8108: CLC: Create an Azure Government managed cluster via the UI`,
      { tags: ['azgov', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addAzureCredential(
          { ...options.connections.apiKeys.azgov, ...options.connections.secrets },
          'AzureUSGovernmentCloud'
        )
        options.clusters.azgov.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createCluster(
          { ...options.connections.apiKeys.azgov, ...options.clusters.azgov },
          arch,
          networkType,
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.azgov.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.azgov.clusterName)
        clusterDeploymentActions.assertInstallAttempt(options.clusters.azgov.clusterName, 1)
        clusterMetricsActions.checkClusterMetrics(options.clusters.azgov.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.azgov.clusterName)
        clusterActions.assertCloudSecrets(
          options.clusters.azgov.clusterName,
          options.clusters.azgov.clusterName,
          'azure'
        )
        clusterActions.assertPullSecrets(options.clusters.azgov.clusterName, options.clusters.azgov.clusterName)
        clusterActions.assertSSHKeySecrets(options.clusters.azgov.clusterName, options.clusters.azgov.clusterName)
      }
    )

    it(
      `RHACM4K-7820: CLC: Create a VMWare managed cluster via the UI`,
      { tags: ['vmware', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addVMwareCredential({
          ...options.connections.apiKeys.vmware,
          ...options.connections.secrets,
        })
        options.clusters.vmware.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createVMWareCluster(
          { ...options.connections.apiKeys.vmware, ...options.clusters.vmware },
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.vmware.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.vmware.clusterName)
        clusterMetricsActions.checkClusterMetrics(options.clusters.vmware.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.vmware.clusterName)
      }
    )

    it(
      `RHACM4K-3305: CLC: Create an OpenStack managed cluster via the UI`,
      { tags: ['openstack', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addOpenStackCredential({
          ...options.connections.apiKeys.openstack,
          ...options.connections.secrets,
        })
        options.clusters.openstack.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createOpenStackCluster(
          { ...options.connections.apiKeys.openstack, ...options.clusters.openstack },
          arch,
          false,
          networkType,
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.openstack.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.openstack.clusterName)
        clusterMetricsActions.checkClusterMetrics(options.clusters.openstack.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.openstack.clusterName)
        clusterActions.assertCloudSecrets(
          options.clusters.openstack.clusterName,
          options.clusters.openstack.clusterName,
          'openstack'
        )
        clusterActions.assertPullSecrets(options.clusters.openstack.clusterName, options.clusters.openstack.clusterName)
        clusterActions.assertSSHKeySecrets(
          options.clusters.openstack.clusterName,
          options.clusters.openstack.clusterName
        )
      }
    )

    it(
      `RHACM4K-11153: CLC: Create a RHV Managed Cluster via the UI`,
      { tags: ['rhv', 'managedclusters'] },
      function () {
        credentialsCreateMethods.addRHVCredential({
          ...options.connections.apiKeys.rhv,
          ...options.connections.secrets,
        })
        options.clusters.rhv.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-x86_64'
        managedClustersMethods.createRHVCluster(
          { ...options.connections.apiKeys.rhv, ...options.clusters.rhv },
          false,
          networkType,
          fips
        )
        managedClustersMethods.checkClusterStatus(options.clusters.rhv.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.rhv.clusterName)
        clusterMetricsActions.checkClusterMetrics(options.clusters.rhv.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.rhv.clusterName)
      }
    )
  }
)
