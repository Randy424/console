/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2024 Red Hat, Inc.
 ****************************************************************************** */
import { ClusterDeployment } from '../../../resources/cluster-deployment'
import { InstallConfig } from '../../../resources/install-config'
import { ManagedCluster } from '../../../resources/managed-cluster'
import { IResource } from '../../../resources/resource'
import { createCredential } from '../../../support/utils/apiUtils'
import { loadAll } from 'js-yaml'

const fips = Cypress.env('FIPS') || false
const arch = Cypress.env('ARCH') || 'amd64'
const networkType = Cypress.env('NETWORK_TYPE') || 'OVNKubernetes'
const ocpImageRegistry = Cypress.env('CLC_OCP_IMAGE_REGISTRY') || 'quay.io/openshift-release-dev/ocp-release'
const ocpReleaseImage = Cypress.env('CLC_OCP_IMAGE_VERSION') || '4.13.15'
const ocpReleaseArch = Cypress.env('CLC_OCP_IMAGE_ARCH') || 'multi'
const CUSTOM_CLUSTERSET = 'auto-gitops-cluster-set'

function fillClusterDetails() {}

// TODO: implement random number generator for cluster names, credentials etc.
// test my end up running in parallel, we want to avoid test collisions
describe(
  'create clusters',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    before(function () {
      // add all new clusters into a custom cluster set, this can be re-used for application lifecycle
      //   clusterSetActions.createClusterSet(CUSTOM_CLUSTERSET)
    })

    beforeEach(() => {
      cy.readFile('cypress/fixtures/clusters/aws-cluster.yaml').as('awsClusterResources')
      cy.visit('multicloud/infrastructure/clusters/managed')
    })

    before(function () {
      // createCredential('aws-connection')
    })

    it(
      `RHACM4K-7473: CLC: Create an AWS managed cluster via the UI`,
      { tags: ['aws', 'managedclusters', '@post-release'] },
      function () {
        const allClusterResources = loadAll(this.awsClusterResources)
        const awsManagedClusterSpecs = allClusterResources.find(
          (clusterResource: IResource) => clusterResource.metadata.name === 'aws-managed-cluster'
        ) as ManagedCluster
        const awsClusterDeploymentSpecs = allClusterResources.find(
          (clusterResource: IResource) => clusterResource.metadata.name === 'aws-cluster-deployment'
        ) as ClusterDeployment
        const installConfigSpecs = allClusterResources.find(
          (clusterResource: IResource) => clusterResource.metadata.name === 'aws-install-config'
        ) as InstallConfig

        cy.get('Create cluster').click()

        cy.get('#aws').contains('Amazon Web Services').click()
        cy.get('#standalone').click()

        // credential
        cy.selectFromSelectField('#connection-label', 'aws-connection')

        // cluster name
        cy.get('#eman').type(awsManagedClusterSpecs.metadata.name)

        // cluster set
        if (awsManagedClusterSpecs.metadata.labels['cluster.open-cluster-management.io/clusterset'])
          // base DNS domain
          cy.typeToInputField('baseDomain', awsClusterDeploymentSpecs.spec.baseDomain)

        // FIPS
        if (installConfigSpecs.fips) cy.get('#fips').click()

        // release image

        // additional labels

        // Node Pools
        cy.get('button').contains('Next').click()

        // cy.exec('oc get secrets -l "cluster.open-cluster-management.io/credentials"=""', {
        //   failOnNonZeroExit: false,
        // }).then((result) => {
        //   cy.log('checking result: ', result)
        // })

        // create credential

        /*
        credentialsCreateMethods.addAWSCredential({ ...options.connections.apiKeys.aws, ...options.connections.secrets });
        options.clusters.aws.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
        managedClustersMethods.createCluster({ ...options.connections.apiKeys.aws, ...options.clusters.aws }, arch, networkType, fips)
        managedClustersMethods.checkClusterStatus(options.clusters.aws.clusterName)
        clusterActions.extractClusterKubeconfig(options.clusters.aws.clusterName)
        clusterDeploymentActions.assertInstallAttempt(options.clusters.aws.clusterName, 1)
        clusterMetricsActions.checkClusterMetrics(options.clusters.aws.clusterName)
        managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.aws.clusterName)
        clusterActions.assertCloudSecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName, 'aws')
        clusterActions.assertPullSecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName)
        clusterActions.assertSSHKeySecrets(options.clusters.aws.clusterName, options.clusters.aws.clusterName)
        */
      }
    )

    // it(`RHACM4K-7474: CLC: Create a GCP managed cluster via the UI`, { tags: ['gcp', 'managedclusters', '@ocpInterop'] }, function () {
    //     credentialsCreateMethods.addGCPCredential({ ...options.connections.apiKeys.gcp, ...options.connections.secrets });
    //     options.clusters.gcp.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createCluster({ ...options.connections.apiKeys.gcp, ...options.clusters.gcp }, arch, networkType, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.gcp.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.gcp.clusterName)
    //     clusterDeploymentActions.assertInstallAttempt(options.clusters.gcp.clusterName, 1)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.gcp.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.gcp.clusterName)
    //     clusterActions.assertCloudSecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName, 'gcp')
    //     clusterActions.assertPullSecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName)
    //     clusterActions.assertSSHKeySecrets(options.clusters.gcp.clusterName, options.clusters.gcp.clusterName)
    // })

    // it(`RHACM4K-7475: CLC: Create an Azure managed cluster via the UI`, { tags: ['azure', 'managedclusters'] }, function () {
    //     credentialsCreateMethods.addAzureCredential({ ...options.connections.apiKeys.azure, ...options.connections.secrets }, 'AzurePublicCloud');
    //     options.clusters.azure.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createCluster({ ...options.connections.apiKeys.azure, ...options.clusters.azure }, arch, networkType, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.azure.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.azure.clusterName)
    //     clusterDeploymentActions.assertInstallAttempt(options.clusters.azure.clusterName, 1)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.azure.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.azure.clusterName)
    //     clusterActions.assertCloudSecrets(options.clusters.azure.clusterName, options.clusters.azure.clusterName, 'azure')
    //     clusterActions.assertPullSecrets(options.clusters.azure.clusterName, options.clusters.azure.clusterName)
    //     clusterActions.assertSSHKeySecrets(options.clusters.azure.clusterName, options.clusters.azure.clusterName)
    // })

    // it(`RHACM4K-8108: CLC: Create an Azure Government managed cluster via the UI`, { tags: ['azgov', 'managedclusters'] }, function () {
    //     credentialsCreateMethods.addAzureCredential({ ...options.connections.apiKeys.azgov, ...options.connections.secrets }, 'AzureUSGovernmentCloud');
    //     options.clusters.azgov.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createCluster({ ...options.connections.apiKeys.azgov, ...options.clusters.azgov }, arch, networkType, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.azgov.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.azgov.clusterName)
    //     clusterDeploymentActions.assertInstallAttempt(options.clusters.azgov.clusterName, 1)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.azgov.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.azgov.clusterName)
    //     clusterActions.assertCloudSecrets(options.clusters.azgov.clusterName, options.clusters.azgov.clusterName, 'azure')
    //     clusterActions.assertPullSecrets(options.clusters.azgov.clusterName, options.clusters.azgov.clusterName)
    //     clusterActions.assertSSHKeySecrets(options.clusters.azgov.clusterName, options.clusters.azgov.clusterName)
    // })

    // it(`RHACM4K-7820: CLC: Create a VMWare managed cluster via the UI`, { tags: ['vmware', 'managedclusters'] }, function () {
    //     credentialsCreateMethods.addVMwareCredential({ ...options.connections.apiKeys.vmware, ...options.connections.secrets });
    //     options.clusters.vmware.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createVMWareCluster({ ...options.connections.apiKeys.vmware, ...options.clusters.vmware }, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.vmware.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.vmware.clusterName)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.vmware.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.vmware.clusterName)
    // })

    // it(`RHACM4K-3305: CLC: Create an OpenStack managed cluster via the UI`, { tags: ['openstack', 'managedclusters'] }, function () {
    //     credentialsCreateMethods.addOpenStackCredential({ ...options.connections.apiKeys.openstack, ...options.connections.secrets });
    //     options.clusters.openstack.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createOpenStackCluster({ ...options.connections.apiKeys.openstack, ...options.clusters.openstack }, arch, false, networkType, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.openstack.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.openstack.clusterName)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.openstack.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.openstack.clusterName)
    //     clusterActions.assertCloudSecrets(options.clusters.openstack.clusterName, options.clusters.openstack.clusterName, 'openstack')
    //     clusterActions.assertPullSecrets(options.clusters.openstack.clusterName, options.clusters.openstack.clusterName)
    //     clusterActions.assertSSHKeySecrets(options.clusters.openstack.clusterName, options.clusters.openstack.clusterName)
    // })

    // it(`RHACM4K-11153: CLC: Create a RHV Managed Cluster via the UI`, { tags: ['rhv', 'managedclusters'] }, function () {
    //     credentialsCreateMethods.addRHVCredential({ ...options.connections.apiKeys.rhv, ...options.connections.secrets });
    //     options.clusters.rhv.releaseImage = ocpImageRegistry + ':' + ocpReleaseImage + '-' + ocpReleaseArch
    //     managedClustersMethods.createRHVCluster({ ...options.connections.apiKeys.rhv, ...options.clusters.rhv }, false, networkType, fips)
    //     managedClustersMethods.checkClusterStatus(options.clusters.rhv.clusterName)
    //     clusterActions.extractClusterKubeconfig(options.clusters.rhv.clusterName)
    //     clusterMetricsActions.checkClusterMetrics(options.clusters.rhv.clusterName)
    //     managedClustersMethods.assertStandaloneControlPlaneType(options.clusters.rhv.clusterName)
    // })
  }
)
