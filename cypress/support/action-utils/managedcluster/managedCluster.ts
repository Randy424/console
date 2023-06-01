/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { acm23xheaderMethods, acmHeaderSelectors } from '../../header'
import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'
import { clusterActions, clusterDeploymentActions } from '../clusterAction'
import * as genericFunctions from '../../genericFunctions'
import { clusterSetPages } from '../clusterset/clusterSets'
import * as automation from '../../api-utils/automation'
import * as constants from '../../constants'
import * as managedCluster from '../../api-utils/cluster-api'
import * as hive from '../../api-utils/hive'
import * as kube from '../../api-utils/kube'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

export const clusterType = {
  EKS: 'EKS',
  AKS: 'AKS',
  GKE: 'GKE',
  IKS: 'IKS',
  ROKS: 'ROKS',
  AWS: 'AWS',
  GCP: 'GCP',
  AZURE: 'AZURE',
  RHV: 'RHV',
  OPENSHIFT: 'OpenShift',
}

export const cloudType = {
  AWS: 'Amazon',
  AZURE: 'Azure',
  GCP: 'Google',
  IBM: 'IBM',
  IBMZ: 'IBMZPlatform',
  IBMP: 'IBMPowerPlatform',
  OPENSTACK: 'OpenStack',
  VMWARE: 'VSphere',
  BM: 'BareMetal',
  RHV: 'RHV',
  ALIBABACLOUD: 'AlibabaCloud',
  Other: 'Other',
}

export const controlPlaneType = {
  STANDALONE: 'Standalone',
  HUB: 'Hub',
  HOSTED: 'Hosted',
}

export const addonLabel = {
  WORK_MANAGE: 'feature.open-cluster-management.io/addon-work-manager',
  SEARCH_COLLECTOR: 'feature.open-cluster-management.io/addon-search-collector',
  POLICY_CONTROLLER: 'feature.open-cluster-management.io/addon-policy-controller',
  OBS_CONTROLLER: 'feature.open-cluster-management.io/addon-observability-controller',
  IAM_POLICY_CONTROLLER: 'feature.open-cluster-management.io/addon-iam-policy-controller',
  CERT_POLICY_CONTROLLER: 'feature.open-cluster-management.io/addon-cert-policy-controller',
  APP_MANAGER: 'feature.open-cluster-management.io/addon-application-manager',
}

export const addonLabelStatus = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
}

export const clusterStatus = {
  READY: 'Ready',
  FAILED: 'Failed',
  PENDING_IMPORT: 'Pending Import',
  CREATING: 'Creating',
  DESTROYING: 'Destroying',
  HIBERNATING: 'Hibernating',
  RESUMING: 'Resuming',
  STOPPING: 'Stopping',
}

export const clusterDeploymentPowerStatus = {
  WAIT_FOR_MACHINE_STOP: 'WaitingForMachinesToStop',
  HIBERNATING: 'Hibernating',
  RESUME_OR_RUNNING: 'ResumingOrRunning',
  RUNNING: 'Running',
}

export const clusterProvisionStatus = {
  COMPLETE: 'complete',
  FAILED: 'failed',
}

export const managedClustersSelectors = {
  elementText: {
    createClusterButton: 'Create cluster',
    importClusterButton: 'Import cluster',
  },
  elementTab: {
    clusters: 'Cluster list',
    clustersets: 'Cluster sets',
    clusterPools: 'Cluster pools',
    DiscoverClusters: 'Discovered clusters',
  },
  createCluster: {
    // the following dropdown will work for provider connection and cluster toggle
    commonDropdownToggle: 'button[aria-label="Options menu"]',
    basicInformation: {
      clusterName: '#eman',
      clusterSetPlaceHolderText: 'Select a cluster set',
      // clusterSetToggle : 'button[aria-label="Options menu"]',
      clusterSetList: 'clusterSet',
    },
    infrastructureProvider: {
      infaProvider: {
        aws: '#aws',
        gcp: '#google',
        azure: '#azure',
        vmware: '#vsphere',
        openstack: '#openstack',
        rhv: '#rhv',
        hostinventory: '#hostinventory',
      },
    },
    imageAndConnection: {
      releaseImageInput: '#imageSet',
    },
    masterNode: {},
    singleNode: '#singleNode',
    fips: '#fips',
  },
  importCluster: {
    clusterName: '#clusterName',
  },
  clusterTableRowOptionsMenu: {
    editLabels: 'a[text="Edit labels"]',
    selectChannel: 'a[text="Select channel"]',
    searchCluster: 'a[text="Search cluster"]',
    hibernateCluster: 'a[text="Hibernate cluster"]',
    resumeCluster: 'a[text="Resume cluster"]',
    detachCluster: 'a[text="Detach cluster"]',
    destroyCluster: 'a[text="Destroy cluster"]',
    importCluster: 'a[text="Import cluster"]',
  },
  clusterTableActionsMenu: {
    upgradeClusters: '#upgradeClusters',
    selectChannels: '#selectChannels',
    hibernateClusters: '#hibernate-cluster',
    resumeClusters: '#resume-cluster',
    detachClusters: '#detachCluster',
    destroyClusters: '#destroyCluster',
    updateAutomationTemplate: '#update-automation-template',
  },
  clusterOverviewPage: {},
  managedClusterDetailsTabs: {
    overview: 'a[text="Overview"]',
    nodes: 'a[text="Nodes"]',
    machinePools: 'a[text="Machine pools"]',
    addOns: 'a[text="Add-ons"]',
  },
  clusterTableColumnFields: {
    name: '[data-label="Name"]',
    status: '[data-label="Status"]',
    infraProvider: '[data-label="Infrastructure provider"]',
    distrVersion: '[data-label="Distribution version"]',
    labels: '[data-label="Labels"]',
    nodes: '[data-label="Nodes"]',
  },
  machinePoolRowOptionsMenu: {
    scaleMachinePool: '#scaleMachinePool',
    editAutoscale: '#editAutoscale',
    enableAutoscale: '#enableAutoscale',
    disableAutoscale: '#disableAutoscale',
    deleteMahcinePool: '#deleteMachinePool',
  },
  machinePoolScale: {
    plusButton: 'button[aria-label="Plus"]',
    minusButton: 'button[aria-label="Minus"]',
  },
  actionsDropdown: '#toggle-id',
  automationTemplate: '#templateName',
}

export const clustersPages = {
  /**
   * verified that the DOM contains text "Cluster management"
   */
  shouldExist: () => {
    cy.contains(
      commonElementSelectors.elements.h1,
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    ).should('contain', 'Cluster management')
  },

  goToClusterSet: () => {
    acm23xheaderMethods.goToClusters()
    cy.get(commonElementSelectors.elements.pageNavLink)
      .filter(`:contains("${managedClustersSelectors.elementTab.clustersets}")`)
      .click()
    clusterSetPages.shouldLoad()
  },

  // The function used to go to clusterset page when login as non-admin user.
  goToClusterSetsWithUser: () => {
    acm23xheaderMethods.goToClustersWithUser()
    cy.get(commonElementSelectors.elements.pageNavLink)
      .filter(`:contains("${managedClustersSelectors.elementTab.clustersets}")`)
      .click()
    clusterSetPages.shouldLoad()
  },
}

export const clustersMethods = {
  clusterShouldExist: (clusterName, role) => {
    switch (role) {
      case 'view':
      case 'bind':
        acm23xheaderMethods.goToClustersWithUser()
        break
      case 'admin':
      default:
        acm23xheaderMethods.goToClusters()
        break
    }
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
  },

  clusterShouldNotExist: (clusterName, role) => {
    switch (role) {
      case 'view':
      case 'bind':
        acm23xheaderMethods.goToClustersWithUser()
        break
      case 'admin':
      default:
        acm23xheaderMethods.goToClusters()
        break
    }
    commonPageMethods.resourceTable.rowShouldNotExist(clusterName)
  },
}
export const managedClusterDetailMethods = {
  shouldLoad: () => {
    cy.get('.pf-c-page').should('contain', 'Clusters')
    cy.get('.pf-c-nav__link').filter(':contains("Overview")').should('exist')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
  },

  goToManagedClusterOverview: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get(managedClustersSelectors.clusterTableColumnFields.name)
      .contains(commonElementSelectors.elements.a, clusterName)
      .click()
    managedClusterDetailMethods.shouldLoad()
  },

  clickEditChannels: () => {
    cy.get('[aria-label="Select channels"]').click()
    commonPageMethods.modal.shouldBeOpen()
  },

  clickUpdateAutomationTemplate: (clusterName) => {
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable('Update automation template', 'a')
    cy.get(managedClustersSelectors.clusterTableActionsMenu.updateAutomationTemplate).click()
  },

  getCurrentChannel: () => {
    return cy.get('dt:contains("Channel")').next().invoke('text')
  },

  getNewChannelButton: () => {
    return cy.get('[data-label="New channel"]').find('button')
  },

  getNewChannelDropdownButton: (clusterName) => {
    return cy.get('#' + clusterName + '-upgrade-selector-label').find('button')
  },

  saveNewChannel: () => {
    cy.get('[type=Submit]').contains('Save').click()
  },

  findLabel: (label) => {
    cy.get('[aria-label="Label group category"]').contains(label)
  },

  goToClusterAddons: () => {
    cy.get('.pf-c-nav__link', { timeout: 2000 }).filter(':contains("Add-ons")').click()
  },

  goToClusterNodes: () => {
    cy.get('.pf-c-nav__link', { timeout: 2000 }).filter(':contains("Nodes")').click()
  },

  goToMachinePools: () => {
    cy.get('.pf-c-nav__link', { timeout: 2000 }).filter(':contains("Machine pools")').click()
  },

  clusterSectionContainsItem: (term, value) => {
    return cy
      .get('div .pf-c-card__body')
      .find('dl')
      .contains(term)
      .parent()
      .parent()
      .contains(value, { timeout: 300000 })
  },

  isClusterName: (clusterName) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Cluster resource name', clusterName)
  },

  isClusterStatus: (status) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Status', status)
  },

  isClusterClaim: (claimName) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Cluster claim name', claimName)
  },
  isClusterProvider: (provider) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Infrastructure provider', provider)
  },
  isClusterVersion: (version) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Distribution version', version)
  },
  isClusterChannel: (channel) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Channel', channel)
  },
  isClusterSet: (clusterSetName) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Cluster set', clusterSetName)
  },
  isClusterPool: (clusterPoolName) => {
    managedClusterDetailMethods.clusterSectionContainsItem('Cluster pool', clusterPoolName)
  },

  /**
   *
   * @param {*} clusterName
   */
  goToMachinePoolClickRowOptions: (clusterName) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    hive.getMachinePools(clusterName).then((resp) => {
      let machinePoolName = resp.body.items[0].metadata.name
      managedClusterDetailMethods.goToMachinePools()
      cy.get('.pf-c-page__main-section').then(($body) => {
        if (!$body.text().includes("You don't have any machine pools")) {
          commonPageMethods.resourceTable.openRowMenu(machinePoolName)
        }
      })
    })
  },

  /**
   *
   * @param {*} clusterName
   * @param {*} scale up or down
   */
  scaleMachinePool: (clusterName, scale) => {
    managedClusterDetailMethods.goToMachinePoolClickRowOptions(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable('Scale machine pool', 'a')
    cy.get(managedClustersSelectors.machinePoolRowOptionsMenu.scaleMachinePool).click()
    commonPageMethods.modal.shouldBeOpen()
    cy.get('[name="scale"]')
      .invoke('val')
      .then(($currentScale) => {
        scale == 'up'
          ? cy.get('#scale').find(managedClustersSelectors.machinePoolScale.plusButton).click()
          : cy.get('#scale').find(managedClustersSelectors.machinePoolScale.minusButton).click()
        cy.get('button[type="submit"]', { timeout: 2000 }).contains('Scale').click()
        cy.get('[data-label="Machine set replicas"] > span')
          .first()
          .then((val) => {
            let newVal = scale == 'up' ? Number($currentScale) + 1 : Number($currentScale) - 1
            cy.wrap(val).contains('out of ' + newVal, { timeout: 900 * 1000 })
          })
      })
  },

  /**
   *
   * @param {*} clusterName
   * @param {*} action Enable or Disable
   */
  autoScaleMachinePool: (clusterName, action) => {
    managedClusterDetailMethods.goToMachinePoolClickRowOptions(clusterName)

    commonPageMethods.resourceTable.buttonShouldClickable(action + ' autoscale', 'a')
    action == 'Enable'
      ? cy.get(managedClustersSelectors.machinePoolRowOptionsMenu.enableAutoscale).click()
      : cy.get(managedClustersSelectors.machinePoolRowOptionsMenu.disableAutoscale).click()

    commonPageMethods.modal.shouldBeOpen()
    cy.get('button[type="submit"]').contains('Scale').click()
    action == 'Enable'
      ? cy.get('[data-label="Autoscale"]').contains('Enabled')
      : cy.get('[data-label="Autoscale"]').contains('Disabled')
  },

  /**
   *
   * @param {*} clusterName
   * @param {*} action up or down
   */
  editAutoScaleMachinePool: (clusterName, scale) => {
    managedClusterDetailMethods.goToMachinePoolClickRowOptions(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable('Edit autoscale', 'a')
    cy.get(managedClustersSelectors.machinePoolRowOptionsMenu.editAutoscale).click()
    commonPageMethods.modal.shouldBeOpen()

    cy.get('[name="scale-max"]')
      .invoke('val')
      .then(($currentScale) => {
        // Check the max value
        cy.get('#scale-max').find(managedClustersSelectors.machinePoolScale.plusButton).click()
        cy.get('button[type="submit"]').contains('Scale').click()
        let newVal = scale == 'up' ? Number($currentScale) + 1 : Number($currentScale) - 1
        cy.get('[data-label="Autoscale"]').contains('-' + newVal + ' replicas')
      })
  },
}

/**
 * This object contais the group of methods that are part of managed clusters page
 */
export const managedClustersMethods = {
  shouldLoad: () => {
    cy.get('.pf-c-page').should('contain', 'Clusters')
    cy.get('button[id=createCluster]')
      .should('exist')
      .and('not.have.class', commonElementSelectors.elements.disabledButton)
    cy.get('button[id=importCluster]')
      .should('exist')
      .and('not.have.class', commonElementSelectors.elements.disabledButton)
  },

  clusterListGetColumn: (clusterName, column) => {
    return cy.get(`tr[data-ouia-component-id="${clusterName}"] td[data-label="${column}"]`)
  },

  assertControlPlaneType: (clusterName, expectedValue) => {
    managedClustersMethods.clusterListGetColumn(clusterName, 'Control plane type').should('have.text', expectedValue)
  },

  assertStandaloneControlPlaneType: (clusterName) => {
    managedClustersMethods.assertControlPlaneType(clusterName, controlPlaneType.STANDALONE)
  },

  assertHubControlPlaneType: () => {
    managedClustersMethods.assertControlPlaneType('local-cluster', controlPlaneType.HUB)
  },

  assertHostedControlPlaneType: (clusterName) => {
    managedClustersMethods.assertControlPlaneType(clusterName, controlPlaneType.HOSTED)
  },

  /**
   * This functon select the infra type
   * @param {*} provider
   */
  fillInfrastructureProviderDetails: (provider) => {
    switch (provider) {
      case 'Amazon Web Services':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.aws).click()
        cy.get('#standalone').click()
        break
      case 'Microsoft Azure':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.azure).click()
        break
      case 'Google Cloud':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.gcp).click()
        break
      case 'VMware vSphere':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.vmware).click()
        break
      case 'Red Hat OpenStack Platform':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.openstack).click()
        break
      case 'Red Hat Virtualization':
        cy.get(managedClustersSelectors.createCluster.infrastructureProvider.infaProvider.rhv).click()
        break
      default:
        cy.log('Invalid provider name! These are the supported provider names: aws, azure, gcp, vmware, openstack, rhv')
    }
  },

  fillClusterDetails: (credentialName, clusterName, clusterSet, releaseImage, additionalLabels, enableSNO, fips) => {
    if (credentialName) {
      cy.get('#connection-label').find('[aria-label="Options menu"]').click()
      cy.get('#connection-label').contains('li', credentialName).click()
    }

    cy.get(managedClustersSelectors.createCluster.basicInformation.clusterName).click().type(clusterName)

    // select the clusterset
    if (clusterSet) genericFunctions.selectOrTypeInInputDropDown('#clusterSet-label', clusterSet)

    // enable the FIPS if needed
    if (fips) cy.get(managedClustersSelectors.createCluster.fips).click()

    // select the release image
    genericFunctions.selectOrTypeInInputDropDown('#imageSet-group', releaseImage, true)

    // enable the SNO cluster if needed
    if (enableSNO) cy.get(managedClustersSelectors.createCluster.singleNode).click()

    // add the additional labels for the clusters
    if (additionalLabels) cy.get('#additional').type(additionalLabels)

    // click next
    genericFunctions.clickNext()
  },

  /**
   * check available release images are actually supported
   * for clusterpools only
   * Expects to be on the update release images dialog
   * Uses a regex expression to test if versions shown are supported
   */
  validateSupportedReleaseImages: () => {
    cy.get('#imageSet').click()
    cy.get('.tf--list-box__menu-item > div > div > div:first-of-type').each(($releaseImage) => {
      var re = new RegExp('^OpenShift ' + constants.supportedOCPReleasesRegex + '.[0-9][0-9]*$')
      if (!re.test($releaseImage.eq(0).text()))
        throw new Error(
          'Unexpected release image found: ' +
            $releaseImage.eq(0).text() +
            '\nSupported release major versions expected: ' +
            constants.supportedOCPReleasesRegex
        )
    })
  },

  fillNodePools: (region, arch?, masterInstanceType?, workerInstanceType?, sno?) => {
    if (region) genericFunctions.selectOrTypeInInputDropDown('#region-label', region, true)
    if (arch) genericFunctions.selectOrTypeInInputDropDown('#architecture-label', arch, true)
    if (masterInstanceType) managedClustersMethods.fillMasterNodeDetails(masterInstanceType)
    if (workerInstanceType && !sno) managedClustersMethods.fillWorkerPoolDetails(workerInstanceType)
    genericFunctions.clickNext()
  },

  fillMasterNodeDetails: (masterInstanceType) => {
    cy.get('#masterpool-control-plane-pool')
      .click()
      .then(() => cy.get('#masterType').clear().type(masterInstanceType).type('{enter}'))
  },

  fillWorkerPoolDetails: (workerInstanceType) => {
    cy.get('#workerpool-worker-pool-1')
      .click()
      .then(
        () => cy.get('#workerType-input').clear().type(workerInstanceType).type('{enter}')
        // .then(() => cy.get('.tf--list-box__menu > div').last().click())
      )
  },

  fillOpenstackNodePools: (arch, sno) => {
    if (arch != '') genericFunctions.selectOrTypeInInputDropDown('#architecture-label', arch, true)
    cy.get('#masterpool-control-plane-pool')
      .click()
      .then(() => cy.get('#masterType').clear().type('ocp-master'))
    if (!sno)
      cy.get('#workerpool-worker-pool-1')
        .click()
        .then(() => cy.get('#workerType').clear().type('ocp-master'))
    genericFunctions.clickNext()
  },

  // for now this methods only click on next button and uses default values
  fillProxyDetails: () => {
    genericFunctions.clickNext()
  },

  // for now this methods only click on next button and uses default values
  fillAWSPrivateConfig: () => {
    genericFunctions.clickNext()
  },

  // for now this methods only click on next button and uses default values
  fillDisconnectedInfo: () => {
    genericFunctions.clickNext()
  },

  fillNetworkingDetails: (networkType?, clusterNetworkCIDR?, serviceNetworkCIDR?) => {
    if (networkType) genericFunctions.selectOrTypeInInputDropDown('#networkType-label', networkType)
    if (clusterNetworkCIDR) cy.get('#clusterNetwork').clear().type(clusterNetworkCIDR)
    if (serviceNetworkCIDR) cy.get('#serviceNetwork').clear().type(serviceNetworkCIDR)

    genericFunctions.clickNext()
  },

  fillVMWareNetworkingDetails: (network, apiVIP, ingressVIP) => {
    cy.get('#networkName').should('have.value', '').type(network)
    cy.get('#apiVIP').should('have.value', '').type(apiVIP)
    cy.get('#ingressVIP').should('have.value', '').type(ingressVIP)

    genericFunctions.clickNext()
  },

  fillOpenstackNetworkingDetails: (extNetwork, apiFIP, ingressFIP, networkType, machineCIDR) => {
    cy.get('[data-testid="text-externalNetworkName"]').should('have.value', '').type(extNetwork)
    cy.get('[data-testid="text-apiFloatingIP"]').should('have.value', '').type(apiFIP)
    cy.get('[data-testid="text-ingressFloatingIP"]').should('have.value', '').type(ingressFIP)
    if (networkType) genericFunctions.selectOrTypeInInputDropDown('#networkType-label', networkType)
    cy.get('#networkgroup-network-1').then(($body) => {
      if ($body.hasClass('#collapsed')) cy.get('#networkgroup-network-1').click()
      // cy.get('input[id="clusterNetwork"]').clear().type(clusterCIDR)
      // cy.get('input[id="hostPrefix"]').clear().type(netHostPrefix)
      // cy.get('input[id="serviceNetwork"]').clear().type(serviceCIDR)
      cy.get('input[id="machineCIDR"]').clear().type(machineCIDR)
    })

    genericFunctions.clickNext()
  },

  fillRHVNetworkingDetails: (
    networkName,
    vnicProfile,
    apiIP,
    ingressIP,
    networkType,
    clusterNetworkCIDR,
    networkHost,
    serviceNetworkCIDR,
    machineCIDR
  ) => {
    cy.get('[data-testid="text-ovirt_network_eman"]').should('have.value', '').type(networkName)
    cy.get('[data-testid="text-vnicProfileID"]').should('have.value', '').type(vnicProfile)
    cy.get('[data-testid="text-apiVIP"]').should('have.value', '').type(apiIP)
    cy.get('[data-testid="text-ingressVIP"]').should('have.value', '').type(ingressIP)
    if (networkType) genericFunctions.selectOrTypeInInputDropDown('#networkType-label', networkType)
    cy.get('#networkgroup-network-1').then(($body) => {
      if ($body.hasClass('#collapsed')) cy.get('#networkgroup-network-1').click()
      if (clusterNetworkCIDR) cy.get('#clusterNetwork').clear().type(clusterNetworkCIDR)
      if (networkHost) cy.get('#hostPrefix').clear().type(networkHost)
      if (serviceNetworkCIDR) cy.get('#serviceNetwork').clear().type(serviceNetworkCIDR)
      if (serviceNetworkCIDR) cy.get('#machineCIDR').clear().type(machineCIDR)
    })

    genericFunctions.clickNext()
  },

  fillAutomationDetails: (templateName?) => {
    if (templateName && templateName != '') {
      cy.get(managedClustersSelectors.automationTemplate).type(templateName).type('{enter}')
      cy.toggleYamlEditor('#edit-yaml')
      cy.getYamlEditorTextCreate().then(() => {
        cy.get('@yamlInnerText').should('contain', 'kind: ClusterCurator') // string contains no-break space character U+00A0
        cy.get('@yamlInnerText').should('contain', 'towerAuthSecret: toweraccess-install')
        cy.get('@yamlInnerText').should('contain', 'towerAuthSecret: toweraccess-upgrade')
      })
    }
    genericFunctions.clickNext()
  },

  clickCreateAndVerify: (clusterName) => {
    cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.create).click()
    commonPageMethods.notification.shouldExist('success')
    cy.location().should((loc) =>
      expect(loc.pathname).to.eq(`/multicloud/infrastructure/clusters/details/${clusterName}/${clusterName}/overview`)
    )
    acm23xheaderMethods.goToClusters()

    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get(commonElementSelectors.elements.a).contains(clusterName).should('exist').click()
  },

  checkClusterTable: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get(commonElementSelectors.elements.a).contains(clusterName).should('exist')
    cy.get(commonElementSelectors.elements.resetSearch, { timeout: 25000 }).click()
  },

  editClusterLabelsByOptions: (clusterName, label, user?) => {
    if (typeof user != 'undefined' && user != '') {
      acm23xheaderMethods.goToClustersWithUser()
    } else {
      acm23xheaderMethods.goToClusters()
    }
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    if (typeof user != 'undefined' && user != 'admin') {
      cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.editLabels).should('have.attr', 'rbac')
    } else {
      commonPageMethods.resourceTable.buttonShouldClickable(
        managedClustersSelectors.clusterTableRowOptionsMenu.editLabels
      )
      cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.editLabels).click()
      commonPageMethods.modal.shouldBeOpen()
      cy.get('input[id="labels-input"]').type(label)
      cy.get('button[type="submit"]').click()
    }
  },

  removeClusterLabelsByOptions: (clusterName, label) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      managedClustersSelectors.clusterTableRowOptionsMenu.editLabels
    )
    cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.editLabels).click()
    commonPageMethods.modal.shouldBeOpen()
    cy.get(`button[id="remove-${label}"]`).click()
    cy.get('button[type="submit"]').click()
  },

  searchClusterByOptions: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      managedClustersSelectors.clusterTableRowOptionsMenu.searchCluster
    )
    cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.searchCluster)
      .click()
      .then(() => {
        cy.url().includes(`/search?filters={%22textsearch%22:%22cluster%3A${clusterName}%22}`)
        // default timeout was not enough to wait for search page open, so we increase the timeout here.
        cy.contains(commonElementSelectors.elements.h1, 'Search', { timeout: 60000 }).should('exist')
      })
  },

  hibernateClusterByOptions: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      managedClustersSelectors.clusterTableRowOptionsMenu.hibernateCluster
    )
    cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.hibernateCluster).click()
    commonPageMethods.modal.shouldBeOpen()
    commonPageMethods.modal.clickDanger('Hibernate')
  },

  resumeClusterByOptions: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      managedClustersSelectors.clusterTableRowOptionsMenu.resumeCluster
    )
    cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.resumeCluster).click()
    commonPageMethods.modal.shouldBeOpen()
    commonPageMethods.modal.clickDanger('Resume')
  },

  hibernateClusterByAction: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get('input[id="select-all"]').uncheck().should('not.be.checked')
    cy.get(managedClustersSelectors.clusterTableColumnFields.name)
      .contains(commonElementSelectors.elements.a, clusterName)
      .parent()
      .parent()
      .prev()
      .find('input')
      .check()
      .should('be.checked')
    cy.get('.pf-c-toolbar__content-section').within(() =>
      cy.get(managedClustersSelectors.actionsDropdown).should('exist').click()
    )
    cy.get(commonElementSelectors.elements.a).contains('Hibernate clusters').should('exist').click()
    commonPageMethods.modal.shouldBeOpen()
    commonPageMethods.modal.clickDanger('Hibernate')
  },

  resumeClusterByAction: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get('input[id="select-all"]').uncheck().should('not.be.checked')
    cy.get(managedClustersSelectors.clusterTableColumnFields.name)
      .contains(commonElementSelectors.elements.a, clusterName)
      .parent()
      .parent()
      .prev()
      .find('input')
      .check()
      .should('be.checked')
    cy.get('.pf-c-toolbar__content-section').within(() =>
      cy.get(managedClustersSelectors.actionsDropdown).should('exist').click()
    )
    cy.get(commonElementSelectors.elements.a).contains('Resume clusters').should('exist').click()
    commonPageMethods.modal.shouldBeOpen()
    commonPageMethods.modal.clickDanger('Resume')
  },

  actionNotExistByOptions: (clusterName, action) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    cy.get(action).should('not.exist')
  },

  actionNotAllowedByActionDropdown: (clusterName, action) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get('input[id="select-all"]').uncheck().should('not.be.checked')
    cy.get(managedClustersSelectors.clusterTableColumnFields.name)
      .contains(commonElementSelectors.elements.a, clusterName)
      .parent()
      .parent()
      .prev()
      .find('input')
      .check()
      .should('be.checked')
    cy.get('.pf-c-toolbar__content-section').within(() =>
      cy.get(managedClustersSelectors.actionsDropdown).should('exist').click()
    )
    cy.get(action).should('exist').click()
    commonPageMethods.modal.shouldBeOpen()
    cy.get('.pf-c-page__main-section').should('include.text', 'You do not have any ')
  },

  clickCreate: () => {
    cy.get(commonElementSelectors.elements.pageMenu, { timeout: 50000 }).then(($body) => {
      if ($body.text().includes("You don't have any clusters")) {
        commonPageMethods.resourceTable.buttonShouldClickable('Create cluster', 'a')
        cy.get('a').contains('Create cluster').should('have.attr', 'aria-disabled', 'false').click()
      } else {
        //     commonPageMethods.resourceTable.buttonShouldClickable('#createCluster').click()
        cy.contains('button', 'Create cluster').should('have.attr', 'aria-disabled', 'false').click()
        //   cy.contains(commonElementSelectors.elements.button, managedClustersSelectors.elementText.createClusterButton).click()
      }
    })
  },

  clickImport: () => {
    cy.get(commonElementSelectors.elements.pageMenu, { timeout: 50000 }).then(($body) => {
      if ($body.text().includes("You don't have any clusters")) {
        commonPageMethods.resourceTable.buttonShouldClickable('Import cluster', 'a')
        cy.get('a').contains('Import cluster').click()
      } else {
        commonPageMethods.resourceTable.buttonShouldClickable('#importCluster')
        cy.contains(
          commonElementSelectors.elements.button,
          managedClustersSelectors.elementText.importClusterButton
        ).click()
      }
    })
  },

  createCluster: (
    {
      provider,
      name,
      clusterName,
      clusterSet,
      releaseImage,
      additionalLabels,
      region,
      clusterNetworkCIDR,
      serviceNetworkCIDR,
      masterInstanceType,
      workerInstanceType,
    },
    arch?,
    networkType?,
    fip?,
    jobTemplate?
  ) => {
    acm23xheaderMethods.goToClusters()
    managedCluster.getManagedCluster(clusterName).then((resp) => {
      if (resp.status === 404) {
        managedClustersMethods.clickCreate()
        managedClustersMethods.fillInfrastructureProviderDetails(provider)
        managedClustersMethods.fillClusterDetails(
          name,
          clusterName,
          clusterSet,
          releaseImage,
          additionalLabels,
          false,
          fip
        )
        managedClustersMethods.fillNodePools(region, arch, masterInstanceType, workerInstanceType)
        managedClustersMethods.fillNetworkingDetails(networkType, clusterNetworkCIDR, serviceNetworkCIDR)
        managedClustersMethods.fillProxyDetails()
        if (provider == 'Amazon Web Services') managedClustersMethods.fillAWSPrivateConfig()
        managedClustersMethods.fillAutomationDetails(jobTemplate)
        managedClustersMethods.clickCreateAndVerify(clusterName)
      }
    })
    managedClustersMethods.checkClusterTable(clusterName)
  },

  createVMWareCluster: (
    { provider, name, clusterName, clusterSet, releaseImage, additionalLabels, network, apiVIP, ingressVIP },
    fips
  ) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    managedClustersMethods.fillInfrastructureProviderDetails(provider)
    managedClustersMethods.fillClusterDetails(
      name,
      clusterName,
      clusterSet,
      releaseImage,
      additionalLabels,
      false,
      fips
    )
    managedClustersMethods.fillNodePools('')
    managedClustersMethods.fillVMWareNetworkingDetails(network, apiVIP, ingressVIP)
    managedClustersMethods.fillProxyDetails()
    managedClustersMethods.fillDisconnectedInfo()
    managedClustersMethods.fillAutomationDetails()
    managedClustersMethods.clickCreateAndVerify(clusterName)
  },

  createOpenStackCluster: (
    {
      provider,
      name,
      clusterName,
      clusterSet,
      releaseImage,
      additionalLabels,
      extNetwork,
      apiFIP,
      ingressFIP,
      machineCIDR,
    },
    arch,
    sno,
    networkType,
    fips
  ) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    managedClustersMethods.fillInfrastructureProviderDetails(provider)
    if (sno)
      managedClustersMethods.fillClusterDetails(
        name,
        clusterName,
        clusterSet,
        releaseImage,
        additionalLabels + ',clc-cluster-type=qe-sno',
        true,
        fips
      )
    else
      managedClustersMethods.fillClusterDetails(
        name,
        clusterName,
        clusterSet,
        releaseImage,
        additionalLabels,
        false,
        fips
      )
    managedClustersMethods.fillOpenstackNodePools(arch, sno)
    managedClustersMethods.fillOpenstackNetworkingDetails(extNetwork, apiFIP, ingressFIP, networkType, machineCIDR)
    managedClustersMethods.fillProxyDetails()
    managedClustersMethods.fillDisconnectedInfo()
    managedClustersMethods.fillAutomationDetails()
    managedClustersMethods.clickCreateAndVerify(clusterName)
  },

  createRHVCluster: (
    {
      provider,
      name,
      clusterName,
      clusterSet,
      releaseImage,
      additionalLabels,
      targetClusterID,
      storageDomainID,
      networkName,
      vnicProfileID,
      apiIP,
      ingressIP,
      clusterCIDR,
      netHostPrefix,
      serviceCIDR,
      machineCIDR,
    },
    sno,
    networkType,
    fips
  ) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    managedClustersMethods.fillInfrastructureProviderDetails(provider)
    cy.get('#ovirt_cluster_id').type(targetClusterID)
    cy.get('#ovirt_storage_domain_id').type(storageDomainID)

    if (sno)
      managedClustersMethods.fillClusterDetails(
        name,
        clusterName,
        clusterSet,
        releaseImage,
        additionalLabels + ',clc-cluster-type=qe-sno',
        true,
        fips
      )
    else
      managedClustersMethods.fillClusterDetails(
        name,
        clusterName,
        clusterSet,
        releaseImage,
        additionalLabels,
        false,
        fips
      )

    managedClustersMethods.fillNodePools('')
    managedClustersMethods.fillRHVNetworkingDetails(
      networkName,
      vnicProfileID,
      apiIP,
      ingressIP,
      networkType,
      clusterCIDR,
      netHostPrefix,
      serviceCIDR,
      machineCIDR
    )
    managedClustersMethods.fillProxyDetails()
    managedClustersMethods.fillAutomationDetails()
    managedClustersMethods.clickCreateAndVerify(clusterName)
  },

  destroyCluster: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    managedCluster.getManagedCluster(clusterName).then((resp) => {
      if (resp.isOkStatusCode) {
        commonPageMethods.resourceTable.rowShouldExist(clusterName)
        commonPageMethods.resourceTable.openRowMenu(clusterName)
        commonPageMethods.resourceTable.buttonShouldClickable(
          managedClustersSelectors.clusterTableRowOptionsMenu.destroyCluster
        )
        cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.destroyCluster).click()
        commonPageMethods.modal.shouldBeOpen()
        commonPageMethods.modal.confirmAction(clusterName)
        commonPageMethods.modal.clickDanger('Destroy')
      }
    })
  },

  destroyClusterWithClusterClaim: (clusterClaimName, namespace) => {
    hive.getClusterClaim(clusterClaimName, namespace).then((resp) => {
      if (resp.isOkStatusCode) {
        managedClustersMethods.destroyCluster(resp.body.spec.namespace)
      }
    })
  },

  importCluster: (clusterName, clusterSet, additionalLabels, kubeconfig) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickImport()

    // Import details page
    managedClustersMethods.fillImportClusterDetails(clusterName, clusterSet, additionalLabels, kubeconfig)
    genericFunctions.clickNext()

    // Automation template page
    managedClustersMethods.fillAutomationDetailsforImport()
    genericFunctions.clickNext()

    cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.import).click()
    clusterActions.checkManagedCluster(clusterName)
    cy.contains('h1', clusterName, { timeout: 60000 }).should('exist')
    // wait before failing
    // check on main first before retrying
  },

  checkAutomationPageforImport: () => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickImport()
    cy.get('button[id="automation"]').click()
    managedClustersMethods.fillAutomationDetailsforImport()
  },

  fillAutomationDetailsforImport: () => {
    cy.get('#templateName-label > .pf-c-form__group-control > .pf-c-select > .pf-c-select__toggle').click()
    cy.get('body').then(($body) => {
      if ($body.find('.pf-c-select__menu-item').length > 0) {
        // select template from dropdown as there is currently no option to type it in
        cy.get('.pf-c-select__menu-item').eq(0).click()
        cy.toggleYamlEditor('#yaml-switch')
        cy.getYamlEditorTextImport().then(() => {
          cy.get('@yamlInnerText').should('contain', 'kind: ClusterCurator') // string contains no-break space character U+00A0
          cy.get('@yamlInnerText').should('contain', 'towerAuthSecret: toweraccess-install')
          cy.get('@yamlInnerText').should('contain', 'towerAuthSecret: toweraccess-upgrade')
        })
      }
    })
  },

  importClusterToken: (clusterName, clusterSet, additionalLabels, server, token) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickImport()
    managedClustersMethods.fillImportClusterDetailsToken(clusterName, clusterSet, additionalLabels, server, token)
    cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.import).click()
    clusterActions.checkManagedCluster(clusterName)
    cy.contains('h1', clusterName, { timeout: 60000 }).should('exist')
    // wait before failing
    // check on main first before retrying
  },

  importClusterByOption: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      managedClustersSelectors.clusterTableRowOptionsMenu.importCluster
    )
    cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.importCluster).click()
    commonPageMethods.modal.shouldBeOpen()
    commonPageMethods.modal.clickDanger('Import')
  },

  fillImportClusterDetails: (clusterName, clusterSet, additionalLabels, kubeConfig) => {
    cy.get(managedClustersSelectors.importCluster.clusterName).type(clusterName)
    if (clusterSet) {
      cy.get('#managedClusterSet').find(commonElementSelectors.elements.dropDownToggleButton).click()
      cy.contains(commonElementSelectors.elements.selectMenuItem, clusterSet).click()
    }
    if (additionalLabels) {
      cy.get('#additionalLabels').type(additionalLabels).type('{enter}')
    }

    cy.get('#import-mode-label').find('.pf-c-select__toggle').click()
    cy.contains(commonElementSelectors.elements.selectMenuItem, 'Kubeconfig').click()
    cy.get('#kubeConfigEntry').invoke('val', kubeConfig).type(' ')
  },

  fillImportClusterDetailsToken: (clusterName, clusterSet, additionalLabels, server, token) => {
    cy.get(managedClustersSelectors.importCluster.clusterName).type(clusterName)
    if (clusterSet) {
      cy.get('#managedClusterSet').find(commonElementSelectors.elements.dropDownToggleButton).click()
      cy.contains(commonElementSelectors.elements.selectMenuItem, clusterSet).click()
    }
    if (additionalLabels) {
      cy.get('#additionalLabels').type(additionalLabels).type('{enter}')
    }

    cy.get('#import-mode-label').find('.pf-c-select').click()
    cy.contains(
      commonElementSelectors.elements.selectMenuItem,
      'Enter your server URL and API token for the existing cluster'
    ).click()
    cy.get('#server').type(server, { delay: 0 })
    cy.get('#token').type(token, { delay: 0 })
  },

  detachCluster: (clusterName?, user?) => {
    if (typeof user != 'undefined' && user != '') {
      acm23xheaderMethods.goToClustersWithUser()
    } else {
      acm23xheaderMethods.goToClusters()
    }
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    commonPageMethods.resourceTable.openRowMenu(clusterName)
    if (typeof user != 'undefined' && user != 'admin') {
      cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.detachCluster).should('have.attr', 'rbac')
    } else {
      cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.detachCluster)
        .should('have.attr', 'aria-disabled', 'false')
        .click()
      commonPageMethods.modal.shouldBeOpen()
      commonPageMethods.modal.confirmAction(clusterName)
      commonPageMethods.modal.clickDanger('Detach')
      clusterActions.waitManagedClusterRemoved(clusterName)
      hive.getClusterDeployment(clusterName).then((resp) => {
        if (resp == 404) {
          // The managedcluster namespace should be deleted if the cluster did not created by hive here
          kube.checkNamespaceDeleted(clusterName)
        }
      })
    }
  },

  detachClusterByLabels: (label) => {
    acm23xheaderMethods.goToClusters()
    managedCluster.getManagedClusters(label).then((resp) => {
      if (resp.isOkStatusCode && resp.body.items.length > 0) {
        for (const cluster of resp.body.items) {
          commonPageMethods.resourceTable.clearSearch()
          commonPageMethods.resourceTable.openRowMenu(cluster.metadata.name)
          cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.detachCluster).click()
          commonPageMethods.modal.shouldBeOpen()
          commonPageMethods.modal.confirmAction(cluster.metadata.name)
          commonPageMethods.modal.clickDanger('Detach')
          clusterActions.waitManagedClusterRemoved(cluster.metadata.name)
          hive.getClusterDeployment(cluster.metadata.name).then((resp) => {
            if (resp == 404) {
              // The managedcluster namespace should be deleted if the cluster was not created by hive here
              kube.checkNamespaceDeleted(cluster.metadata.name)
            }
          })
        }
      }
    })
  },

  checkCluster: (clusterName, clusterStatus) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
    cy.get(managedClustersSelectors.clusterTableColumnFields.status).find('button').should('contain', clusterStatus)
  },

  clusterLabelExists: (clusterName, labelName, labelVal) => {
    cy.log('Check the managed cluster labels for ' + labelName + '=' + labelVal)
    cy.waitUntil(
      () => {
        return managedCluster.getManagedCluster(clusterName).then((resp) => {
          var exist = false
          if (resp.body.metadata.labels[labelName] === labelVal) {
            exist = true
          }
          return exist
        })
      },
      {
        errorMsg: 'Can not find the label ' + labelName + ' in managed cluster ' + clusterName + '\n',
        interval: 2 * 1000,
        timeout: 2000 * 1000,
      }
    )
  },

  clusterclaimExists: (clusterName, clusterclaim) => {
    cy.log('Checking if the clusterclaim exists and is correct')
    clusterActions.checkManagedClusterClaim(clusterName, clusterclaim)
  },

  checkClusterImportStatus: (clusterName) => {
    cy.log("Check the cluster's import status")
    cy.waitUntil(
      () => {
        return managedCluster.getManagedCluster(clusterName).then((resp) => {
          var exist = false
          for (let i = 0; i < resp.body['status']['conditions'].length; i++) {
            var condition = resp.body['status']['conditions'][i]
            if (condition.type === 'ManagedClusterConditionAvailable' && condition.status == 'True') {
              exist = true
            }
          }
          return exist
        })
      },
      {
        interval: 2 * 1000,
        timeout: 1800 * 1000,
      }
    )
  },

  checkClusterStatus: (clusterName) => {
    clusterDeploymentActions.checkClusterProvisionStatus(clusterName)
    hive.getClusterProvisions(clusterName, `hive.openshift.io/cluster-deployment-name=${clusterName}`).then((resp) => {
      if (resp.body.items[resp.body.items.length - 1].spec.stage === clusterProvisionStatus.FAILED) {
        cy.log('The cluster creation failed, validating failed cluster appears correctly...').then(() => {
          managedClustersUIValidations
            .validateManagedClusterFailed(clusterName)
            .log('Dumping the cluster provision status install log...')
            .then(() => {
              throw new Error(resp.body.items[resp.body.items.length - 1].spec.installLog)
            })
        })
      } else {
        if (clusterActions.checkClusterStatus(clusterName)) {
          acm23xheaderMethods.goToClusters()
          commonPageMethods.resourceTable.rowShouldExist(clusterName)
          cy.get(`tr[data-ouia-component-id="${clusterName}"] td[data-label="Status"] > span > div > span > button`, {
            timeout: 300000,
          }) // 5 minutes for it to appear
            .should('have.text', clusterStatus.READY)
        }
      }
    })
  },

  createSNOCluster: (providerType, releaseImage, jobTemplateName, arch, fips) => {
    let connection = options.connections.apiKeys[`${providerType}`]
    let cluster = options.clusters[`${providerType}`]
    let clusterName = `${cluster.clusterName}-sno-${Date.now()}`
    acm23xheaderMethods.goToClusters()
    cy.wait(5 * 1000)
      .contains('button', 'Create cluster')
      .should(($el) => {
        expect(Cypress.dom.isDetached($el)).to.eq(false)
      })
      .click()
    managedClustersMethods.fillInfrastructureProviderDetails(connection.provider)
    managedClustersMethods.fillClusterDetails(
      connection.name,
      clusterName,
      '',
      releaseImage,
      cluster.additionalLabels + ',clc-cluster-type=qe-sno',
      true,
      fips
    )
    managedClustersMethods.fillNodePools(
      cluster.region,
      arch,
      cluster.masterInstanceType,
      cluster.workerInstanceType,
      'sno'
    )
    managedClustersMethods.fillNetworkingDetails()
    managedClustersMethods.fillProxyDetails()
    providerType === 'aws' && managedClustersMethods.fillAWSPrivateConfig()
    managedClustersMethods.fillAutomationDetails(jobTemplateName)
    managedClustersMethods.clickCreateAndVerify(clusterName)
    cy.contains('h1', clusterName).should('exist')
    return cy.wrap(clusterName)
  },

  destroySNOClusters: () => {
    acm23xheaderMethods.goToClusters()
    managedCluster.getAllSNOClusters().then((list) => {
      if (list != null) {
        list.forEach((clusterName) => {
          commonPageMethods.resourceTable.searchTable(clusterName.split('-').pop())
          commonPageMethods.resourceTable.openRowMenu(clusterName)
          commonPageMethods.resourceTable.buttonShouldClickable(
            managedClustersSelectors.clusterTableRowOptionsMenu.destroyCluster
          )
          cy.get(managedClustersSelectors.clusterTableRowOptionsMenu.destroyCluster).click()
          commonPageMethods.modal.shouldBeOpen()
          commonPageMethods.modal.confirmAction(clusterName)
          commonPageMethods.modal.clickDanger('Destroy')
          managedClustersUIValidations.validateManagedClusterDestroyed(clusterName)
        })
      }
    })
  },

  validateSNOClusterCreation: (clusterName) => {
    clusterDeploymentActions.checkClusterProvisionStatus(clusterName)
    clusterDeploymentActions.dumpClusterProvisionStatus(clusterName).then((status) => {
      if (status === 'failed') {
        cy.log('The cluster creation failed')
        clusterDeploymentActions.dumpClusterInstallMsg(clusterName).then((installLog) => {
          cy.log('the installation failed due to: \n' + installLog)
        })
        managedClustersUIValidations.validateManagedClusterFailed(clusterName)
        // Mark the case failed here
        expect(status).to.eq('complete')
      } else {
        managedClustersUIValidations.validateManagedClusterInstalled(clusterName).then(() => {
          managedClustersUIValidations.validateAddons(clusterName)
          managedClustersUIValidations.validateNodes(clusterName)
          managedClustersUIValidations.validateMachinePools(clusterName)
        })
      }
    })
  },
}

export const managedClustersUIValidations = {
  validateManagedClusterInstalled: (clusterName) => {
    hive.checkClusterDeployment(clusterName)
    managedCluster.checkManagedClusterInfoStatus(clusterName)
    managedCluster.checkManagedClusterWorkAddon(clusterName)
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    return cy
      .get('dt:contains("Status")')
      .next()
      .invoke('text')
      .then((txt) => {
        expect(txt).to.be.oneOf(['Pending import', 'Importing', 'Posthook', 'Ready'])
      })
  },

  validateManagedClusterFailed: (clusterName) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    cy.wait(5 * 1000)
    return cy
      .get('dt:contains("Status")')
      .next()
      .invoke('text')
      .should('equal', clusterStatus.FAILED, { timeout: 50000 })
  },

  validateAddons: (clusterName) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    managedClusterDetailMethods.goToClusterAddons()
    commonPageMethods.resourceTable.rowCount().then((counts) => {
      function getAddonsStatus() {
        let arr = []
        cy.get('td[data-label="Status"]').each((el) => {
          cy.get(el)
            .invoke('text')
            .then((txt) => {
              arr.push(txt)
            })
        })
        return cy.wrap(arr)
      }
      // timeout = 15 mins, polling every 30s
      genericFunctions.recurse(
        () => getAddonsStatus(),
        (status) => !(status.includes('Progressing') || status.includes('Unknown') || status.includes('Degraded')),
        30,
        30 * 1000
      )
      cy.get('td[data-label="Status"]').each((el) => cy.get(el).should('have.text', 'Available'))
    })
  },

  validateAddon: (clusterName?, addon?, status?) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    managedClusterDetailMethods.goToClusterAddons()
    commonPageMethods.resourceTable.checkIfRowExistsByName(addon)
    function getAddonsStatus() {
      let arr = []
      cy.get(`tr[data-ouia-component-id="${addon}"] td[data-label="Status"]`)
        .invoke('text')
        .then((txt) => {
          arr.push(txt)
        })
      return cy.wrap(arr)
    }
    // timeout = 15 mins, polling every 30s
    genericFunctions.recurse(
      () => getAddonsStatus(),
      (status) => status.includes(`${status}`) || status.includes('Available'),
      30,
      30 * 1000
    )
    if (status) cy.get(`tr[data-ouia-component-id="${addon}"] td[data-label="Status"]`).should('have.text', `${status}`)
    else cy.get(`tr[data-ouia-component-id="${addon}"] td[data-label="Status"]`).should('have.text', 'Available')
  },

  validateNodes: (clusterName) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    managedClusterDetailMethods.goToClusterNodes()
    commonPageMethods.resourceTable.rowCount().then((counts) => {
      expect(counts).to.be.at.least(1)
    })
  },

  validateMachinePools: (clusterName) => {
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    managedClusterDetailMethods.goToMachinePools()
    commonPageMethods.resourceTable.rowCount().then((counts) => {
      expect(counts).to.be.at.least(1)
    })
  },

  validateManagedClusterDestroyed: (clusterName) => {
    hive.checkClusterDeploymentDeleted(clusterName)
    managedCluster.checkManagedClusterInfoDeleted(clusterName)
    cy.wait(40 * 1000)
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.rowShouldNotExist(clusterName)
  },

  validateAnsibleJobHooks: (clusterName, stage) => {
    let selector = stage.toLowerCase() == 'prehook' ? 'Prehook' : 'Posthook'
    automation.checkAnsibleJobResult(clusterName, stage)
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)
    cy.get('dt:contains("Status")')
      .next()
      .invoke('text')
      .then((txt) => {
        if (txt != 'Ready') {
          cy.contains('div', selector)
            .next()
            .invoke('text')
            .then((txt) => expect(txt).to.be.oneOf(['In progress', 'Complete']))
        }
      })
  },

  validateClusterCreateYAML: ({ provider, clusterName }, templateName) => {
    acm23xheaderMethods.goToClusters()
    managedCluster.getManagedCluster(clusterName).then(() => {
      managedClustersMethods.clickCreate()
      managedClustersMethods.fillInfrastructureProviderDetails(provider)
      cy.get('#automationStep > .tf--finish-step-button > div').click({ force: true })
      managedClustersMethods.fillAutomationDetails(templateName)
    })
  },

  validateAnsibleTemplate: (phase, template) => {
    cy.get(`button:contains('View template')`).click()
    switch (phase.toLowerCase()) {
      case 'install': {
        cy.get(`table:contains('Preinstall Ansible templates') > tbody > tr > td`).first().should('have.text', template)
        cy.get(`table:contains('Postinstall Ansible templates') > tbody > tr > td`)
          .first()
          .should('have.text', template)
        break
      }
      case 'upgrade': {
        cy.get(`table:contains('Preupgrade Ansible templates') > tbody > tr > td`).first().should('have.text', template)
        cy.get(`table:contains('Postupgrade Ansible templates') > tbody > tr > td`)
          .first()
          .should('have.text', template)
        break
      }
      case 'all': {
        cy.get(`table:contains('Preinstall Ansible templates') > tbody > tr > td`).first().should('have.text', template)
        cy.get(`table:contains('Postinstall Ansible templates') > tbody > tr > td`)
          .first()
          .should('have.text', template)
        cy.get(`table:contains('Preupgrade Ansible templates') > tbody > tr > td`).first().should('have.text', template)
        cy.get(`table:contains('Postupgrade Ansible templates') > tbody > tr > td`)
          .first()
          .should('have.text', template)
        break
      }
    }
    cy.get('button[aria-label="Close"]').click()
  },
}
