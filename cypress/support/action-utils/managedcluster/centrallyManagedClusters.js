/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import * as centrallyManagedClustersData from '../../fixtures/cim/testData/centrallyManagedClustersData.json'
import * as generalTestData from '../../fixtures/cim/testData/generalTestData.json'

import { commonElementSelectors, commonPageMethods } from '../common/commonSelectors'
import { managedClusterDetailMethods, managedClustersMethods } from './managedCluster'

import { acm23xheaderMethods } from '../header'
import { genericFunctions } from '../../support/genericFunctions'
import { infraEnvPageMethods } from '../infrastructureEnv/infraEnv'

const infraEnvDataConfig = JSON.parse(Cypress.env('INFRA_ENV_CONFIG'))
const extraVars = JSON.parse(Cypress.env('EXTRA_VARS'))

/**
 * This object contain all the methods related to the
 * centrally managed clusters creation flow - for existing discovered hosts or AI flow
 */

export const clusterHyperShiftMethods = {
  getNodePoolPageTitle: () => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h2, 'Node pools')
  },

  clickAddNodePool: () => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.button)
      .contains(centrallyManagedClustersData.clusterNodePoolPage.txtNodePoolbtn)
      .click({ force: true })
  },

  fillNodePoolNumHosts: (hostsNum, nodePoolID) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(nodePoolID)
      .within(() => {
        cy.get(commonElementSelectors.elements.input).fill(hostsNum)
      })
  },

  fillNodePoolPage: (hostsNum, nodePoolsNum, nodePoolID) => {
    var numHostsForNodePool = 0
    for (let nodePoolIndex = 0; nodePoolIndex < nodePoolsNum; nodePoolIndex++) {
      clusterHyperShiftMethods.clickAddNodePool()
    }

    if (nodePoolsNum != 0) {
      numHostsForNodePool = hostsNum - 1
    } else {
      numHostsForNodePool = hostsNum
    }

    clusterHyperShiftMethods.fillNodePoolNumHosts(numHostsForNodePool, nodePoolID)
  },

  fillNodePortIPAdder: (nodePortIp) => {
    cy.get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputNodePortIpAdderID).type(nodePortIp)
  },

  selectAvailableMachineCidr: (dropDownMachineCidrID) => {
    // select the first machine cidr range
    return cy.get(dropDownMachineCidrID, { timeout: extraVars.waitFor.hostSubnetAppears }).select(0)
  },
}

export const clusterCreationNewHostsMethods = {
  clickAddHostToCluster: () => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.button)
      .contains(centrallyManagedClustersData.clusterHostsPage.txtAddHostsButton)
      .click({ force: true })
  },

  setClusterSSHKey: (sshKey) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterHostsPage.IDs.inputSSHPublicKeyID)
      .fill(sshKey, { parseSpecialCharSequences: false })
  },

  setSpokeProxy: (httpProxy, httpsProxy, noProxy) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterHostsPage.IDs.checkboxSetSpokeProxyID)
      .click()
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterHostsPage.IDs.inputSpokeHttpProxyID)
      .fill(httpProxy)
      .get(centrallyManagedClustersData.clusterHostsPage.IDs.inputSpokeHttpsProxyID)
      .fill(httpsProxy)
      .get(centrallyManagedClustersData.clusterHostsPage.IDs.inputSpokeNoProxyID)
      .fill(noProxy)
  },

  clickGenerateDiscoveryIso: () => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.button)
      .contains(centrallyManagedClustersData.clusterHostsPage.txtGenerateDiscoveryIsoButton)
      .click({ force: true })
  },

  wgetDownloadDiscoveryIso: (clusterName) => {
    // get the wget command
    cy.get(`[id^=${centrallyManagedClustersData.clusterHostsPage.IDs.txtClusterISOUrlFromClipboardID}]`)
      .last()
      .invoke('val')
      .then((cluster_iso_url) => {
        // add no-check-certificate
        let wgetCmd = [cluster_iso_url.slice(0, 5), '--no-check-certificate ', cluster_iso_url.slice(5)].join('')

        // download the iso
        cy.runCmd(wgetCmd, false, false, extraVars.waitFor.cmdCommandTimeout)

        const cpImageCmd = `mv ${centrallyManagedClustersData.clusterHostsPage.nameDiscoveryISOFile}\
             ${centrallyManagedClustersData.clusterHostsPage.pathVMDiscoveryIsoDestinationPath}/${clusterName}`

        // move the iso to it's correct path for booting a machine
        cy.runCmd(cpImageCmd, false, false, extraVars.waitFor.cmdCommandTimeout)
      })
  },

  bootVMWithDiscoveryIso: (vmName, nameDiscoveryISOFile, pathVMDiscoveryIsoDestinationPath) => {
    cy.uploadDiscoveryISO(vmName, nameDiscoveryISOFile, pathVMDiscoveryIsoDestinationPath)
    cy.startVM(vmName)
  },

  waitForDiscoveredHosts: (hostRowIndex) => {
    cy.hostDetailSelector(hostRowIndex, 'Status', extraVars.waitFor.hostBoundStatus).should('contain', 'Discovered')
  },
}

export const clusterCreationExistingHostsMethods = {
  clickAutoSelectHostsToggle: (hostsToggleID) => {
    cy.wait(extraVars.waitFor.hostsAutoSelectToSwitch).get(hostsToggleID).click()
  },

  clickLocationDropDown: (locationDropDownID) => {
    cy.wait(extraVars.waitFor.elementToShow).get(locationDropDownID).first().click({ force: true })
  },

  selectLocationFromDropDown: (locationOptionID, hostsLocationName) => {
    cy.wait(extraVars.waitFor.elementToShow).get(locationOptionID).contains(hostsLocationName).click({ force: true })
  },

  waitForHostToBeDiscovered: (hostRowIndex) => {
    cy.hostDetailSelector(hostRowIndex, 'Status').contains(/Discovering|Ready/, {
      timeout: extraVars.waitFor.hostReadyStatus,
    })
  },

  waitForHostToBeReady: (hostRowIndex) => {
    cy.hostDetailSelector(hostRowIndex, 'Status', extraVars.waitFor.hostBoundStatus).should('contain', 'Ready')
  },

  fillClusterHostsBoundPage: (hostsCount, hostsLocation) => {
    clusterCreationExistingHostsMethods.clickAutoSelectHostsToggle(
      centrallyManagedClustersData.clusterHostsPage.IDs.inputAutoSelectHostsID
    )
    clusterCreationExistingHostsMethods.clickLocationDropDown(
      centrallyManagedClustersData.clusterHostsPage.IDs.btnSelectHostLocationID
    )

    clusterCreationExistingHostsMethods.selectLocationFromDropDown(
      centrallyManagedClustersData.clusterHostsPage.IDs.btnLocationOptionID,
      hostsLocation
    )
    centrallyManagedClustersMethods.selectHostsByCount(hostsCount)

    // time to wait after a host is selected
    cy.wait(extraVars.waitFor.hostToBeChecked)
  },

  destroySpokeCluster: (clusterName, infraenvName) => {
    managedClustersMethods.destroyCluster(clusterName)
    cy.wait(extraVars.waitFor.clusterToBeDestroyed)
    acm23xheaderMethods.goToInfrastructureEnvironmentPage()
    infraEnvPageMethods.deleteAllInfraEnvHosts(infraenvName)
    infraEnvPageMethods.deleteInfraEnv(infraenvName)
  },

  clickRemoveLastWorkerFromSpoke: (btnAction) => {
    cy.wrap(btnAction).click({ force: true })

    // click on the remove button from the popup
    cy.get(commonElementSelectors.elements.button)
      .contains('Remove from cluster')
      .click({ force: true, waitForAnimations: true, failOnNonZeroExit: false })

    cy.wait(extraVars.waitFor.workerToBeRemoved)
  },

  wipeVmDisk: (clusterName, vmName, vmType) => {
    // this function is a workaround for bz2064404

    if (vmType === 'worker') {
      var volPrefix = 'worker_vol_'
    }

    if (vmType === 'master') {
      var volPrefix = 'master_vol_'
    }

    // create the name of the vm's volume name
    var vmVolName = volPrefix + `${vmName}`.slice(-3).replace('-', '_')
    var pathToDiskFile = `${centrallyManagedClustersData.clusterHostsPage.pathVMDiscoveryIsoDestinationPath}/${clusterName}/${vmVolName}`

    // destroy the vm
    cy.destroyVM(vmName)

    // wipe the vm disk
    cy.wipeVmDisk(pathToDiskFile)

    // start the vm again
    cy.startVM(vmName)
  },

  unbindAWorkerFromSpoke: (clusterName, infraenvName, clusterHostsCount) => {
    acm23xheaderMethods.goToClusters()
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)

    // click on the remove button from the menu
    cy.wait(extraVars.waitFor.elementToShow)
      .get('table.hosts-table')
      .find('button[aria-label="Actions"]')
      .last()
      .click({ force: true })

    // click on the remove button from the popup
    cy.get(commonElementSelectors.elements.button)
      .contains('Remove from the cluster')
      .then(($btn) => {
        // in case the node is a control plane node - the button is disabled
        if ($btn.attr('aria-disabled') == 'true') {
          cy.log("The button is disabled, which means the node is a control plane, can't remove it.")
        } else {
          // remove the latest worker from the cluster
          clusterCreationExistingHostsMethods.clickRemoveLastWorkerFromSpoke($btn)

          // go to the infraenv page from which the worker came from
          infraEnvPageMethods.goToInfraEnv(infraenvName)

          cy.get('a').contains('Hosts').click({ force: true, waitForAnimations: true, failOnNonZeroExit: false })

          // wipe the vm disk
          var workerRow = cy.contains('tr', 'Removing from cluster')
          workerRow.within(() => {
            cy.get('td[data-testid="host-name"]')
              .invoke('text')
              .then((workerName) => {
                clusterCreationExistingHostsMethods.wipeVmDisk(clusterName, workerName, 'worker')
              })
          })

          // wait for the worker to be available again
          infraEnvPageMethods.waitForBMHStatusAvailable(clusterHostsCount)
        }
      })
  },
}

export const centrallyManagedClustersMethods = {
  getSpokeClusterType: (numHosts) => {
    if (numHosts == 1) {
      return centrallyManagedClustersData.clusterType.sno
    } else if (numHosts == 3) {
      return centrallyManagedClustersData.clusterType.mastersOnly
    } else {
      return centrallyManagedClustersData.clusterType.ocpMultiNode
    }
  },

  getSpokeAutomationPageTitle: () => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h2, 'Automation')
  },

  getSpokeClustreHostsPageTitle: () => {
    return cy
      .wait(extraVars.waitFor.spokeToBeSaved)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h2, 'Cluster hosts')
  },

  getSpokeClusterNetworkPageTitle: (title) => {
    return cy
      .wait(extraVars.waitFor.clusterNetworkPage)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h2, title)
  },

  getSpokeClusterReviewPageTitle: (title) => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h2, title)
  },

  getClusterInstallTitle: (title) => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.pageClassKey)
      .contains(commonElementSelectors.elements.h1, title)
  },

  getIsArm64Checkbox: () => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterDetailsPage.IDs.checkBoxIsArm64CPU)
  },

  validateAssistedInstallationTitle: (title) => {
    return cy
      .wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.pageClassKey)
      .should('contain', title)
  },

  clickOnHostInventoryProvider: () => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.installationTypePage.IDs.btnHostInventoryProviderID)
      .click({ force: true })
  },

  clickHostedCPType: () => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.installationTypePage.IDs.btnHostedCPTypeID)
      .contains(centrallyManagedClustersData.installationTypePage.txtHostedButtonTitle)
      .click({ force: true })
  },

  clickOnStandAloneCPType: () => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.installationTypePage.IDs.btnStandAloneCPTypeID)
      .contains(centrallyManagedClustersData.installationTypePage.txtStandAloneButtonTitle)
      .click({ force: true })
  },

  clickExistingHostsInstallationType: (buttonTitle, buttonID) => {
    cy.wait(extraVars.waitFor.elementToShow).get(buttonID).contains(buttonTitle).click({ force: true })
  },

  clickNewDiscoveredHostsInstallationType: (buttonTitle, buttonID) => {
    cy.wait(extraVars.waitFor.elementToShow).get(buttonID).contains(buttonTitle).click({ force: true })
  },

  setClusterName: (clusterName) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterDetailsPage.IDs.inputClusterNameID)
      .type(clusterName)
  },

  setClusterBaseDomain: (baseDomain) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterDetailsPage.IDs.inputClusterBaseDomain)
      .type(baseDomain)
  },

  setClusterOCPVersion: (version) => {
    // take the list of versions and select the one that matches the version

    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterDetailsPage.IDs.inputClusterOCPVersion)
      .then(($dropDownVersions) => {
        if ($dropDownVersions.find(`option[value="${version}"]`).length > 0) {
          cy.wrap($dropDownVersions).select(version)
        } else {
          throw new Error(
            version + ' version ' + 'is not supported/available/present in the OCP versions list. Aborting...'
          )
        }
      })
  },

  setClusterPullSecret: (pullSecret) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterDetailsPage.IDs.inputClusterPullSecret)
      .fill(pullSecret, { parseSpecialCharSequences: false })
  },

  checkIsSNOCheckBox: (checkBoxId) => {
    cy.wait(extraVars.waitFor.elementToShow).get(checkBoxId).check({ force: true })
  },

  checkIsArm64CPUBox: () => {
    centrallyManagedClustersMethods.getIsArm64Checkbox().check({ force: true })
  },

  fillClusterDetailsPage: (
    clusterName,
    clusterType,
    clusterPullSecret,
    clusterBaseDomain,
    clusterOCPVersion,
    isCPUx86
  ) => {
    centrallyManagedClustersMethods.setClusterName(clusterName)
    centrallyManagedClustersMethods.setClusterBaseDomain(clusterBaseDomain)

    // check cluster type before filling - if sno, check sno
    if (clusterType == centrallyManagedClustersData.clusterType.sno) {
      centrallyManagedClustersMethods.checkIsSNOCheckBox(
        centrallyManagedClustersData.clusterDetailsPage.IDs.checkBoxIsSNO
      )
    }
    centrallyManagedClustersMethods.setClusterOCPVersion(clusterOCPVersion)

    if (clusterType == centrallyManagedClustersData.clusterType.ocpMultiNode) {
      var majorVersion = parseInt(clusterOCPVersion.split('.')[0])
      var minorVersion = parseInt(clusterOCPVersion.split('.')[1])
      if (((majorVersion == 4) & (minorVersion >= 10)) | (majorVersion > 4)) {
        centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.enabled')
        if (!isCPUx86) {
          centrallyManagedClustersMethods.checkIsArm64CPUBox()
        }
      } else {
        centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.disabled')
      }
    }

    centrallyManagedClustersMethods.setClusterPullSecret(clusterPullSecret)
  },

  verifyClusterDetailsInfo: (clusterName, clusterType, clusterBaseDomain, clusterOCPImageSet, isCPUx86) => {
    // verify cluster name shown correctly
    cy.get(':nth-child(4) > .pf-c-description-list__description > .pf-c-description-list__text > div').contains(
      clusterName
    )

    // verify base DNS shown correctly
    cy.get(':nth-child(5) > .pf-c-description-list__description > .pf-c-description-list__text > div').contains(
      clusterBaseDomain
    )

    // verify the version shown correctly
    cy.get(':nth-child(6) > .pf-c-description-list__description > .pf-c-description-list__text > div').contains(
      clusterOCPImageSet
    )

    // verify the CPU architecture shown correctly (not ready yet - https://issues.redhat.com/browse/MGMT-13276)
    // if (isCPUx86) {
    //     cy.get(':nth-child(4) > .pf-c-description-list__description > .pf-c-description-list__text')
    //     .contains(generalTestData.cpuArchitecture.txtCPUArchitectureX86)
    // } else {
    //     cy.get(':nth-child(4) > .pf-c-description-list__description > .pf-c-description-list__text')
    //     .contains(generalTestData.cpuArchitecture.txtCPUArchitectureArm64)
    // }
  },

  verifyReviewAndCreateInfo: (clusterName, clusterBaseDomain, clusterOCPImageSet, isCPUx86) => {
    // verify cluster address shown correctly
    cy.get('[data-testid="cluster-address-value"]').contains(clusterName + '.' + clusterBaseDomain)

    // verify the version shown correctly
    cy.get('[data-testid="openshift-version-value"]').contains(clusterOCPImageSet)

    // verify the CPU architecture shown correctly
    if (isCPUx86) {
      cy.get('[data-testid="cpu-architecture-value"]').contains(generalTestData.cpuArchitecture.txtCPUArchitectureX86)
    } else {
      cy.get('[data-testid="cpu-architecture-value"]').contains(generalTestData.cpuArchitecture.txtCPUArchitectureArm64)
    }

    // verify all validations passed
    cy.get('[data-testid="cluster-validations-value"]').contains(
      centrallyManagedClustersData.clusterReviewPage.txtValidationPassed
    )
    cy.get('[data-testid="host-validations-value"]').contains(
      centrallyManagedClustersData.clusterReviewPage.txtValidationPassed
    )
  },

  approveAllHosts: () => {
    cy.get('#select-checkbox').check({ force: true })
    cy.get(commonElementSelectors.elements.button)
      .contains(commonElementSelectors.elementsText.actions)
      .click({ force: true })
    cy.get(commonElementSelectors.elements.a)
      .contains(commonElementSelectors.elementsText.approve)
      .click({ force: true })
    cy.get(commonElementSelectors.elements.button)
      .contains(commonElementSelectors.elementsText.approveAll)
      .click({ force: true })
  },

  waitForPrepreForInstallTitle: (title) => {
    return cy
      .get(commonElementSelectors.elements.pageClassKey, { timeout: extraVars.waitFor.prepearClusterInstallTitle })
      .contains(commonElementSelectors.elements.h4, title)
  },

  waitForClusterIsReadyForInstallTitle: (title) => {
    return cy.contains(commonElementSelectors.elements.h4, title, {
      timeout: extraVars.waitFor.clusterIsReadyForInstall,
    })
  },

  waitForSpokeClusterToCompleteInstallation: (clusterName) => {
    acm23xheaderMethods.goToClusters()
    commonPageMethods.resourceTable.checkIfRowExistsByName(clusterName).then((spokeClusterExists) => {
      if (spokeClusterExists) {
        commonPageMethods.resourceTable
          .getRowByIndex(commonElementSelectors.elements.firstRowIndex)
          .then((spokeClusterObj) => {
            cy.wrap(spokeClusterObj)
              .get("tbody > tr > [data-label='Status']")
              .contains('Ready', { timeout: extraVars.waitFor.clusterInstallToComplete })
          })
      }
    })
  },

  verifySpokeClusterHostsCPUArcitecture: (expectedCPUArch) => {
    cy.log('Verifying CPU arch for hosts')
    // verify in the host row
    cy.get('table [data-testid="host-cpu-architecture"]').each(($item) => cy.wrap($item).contains(expectedCPUArch))

    // expand host info and verify in it
    cy.get('table .pf-c-button.pf-m-plain').each(($item) => cy.wrap($item).click({ force: true }))
    cy.get('table [data-testid="cpu-arch-value"]').each(($item) => cy.wrap($item).contains(expectedCPUArch))
  },

  setApiVipAddress: (apiVipAddress) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputApiVipID)
      .type(apiVipAddress)
  },

  setIngressVipAddress: (ingressVipAddress) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputIngressVipID)
      .type(ingressVipAddress)
  },

  setClusterNetworkCidr: (clusterNetworkCidr) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputClusterNetworkCidrID)
      .fill(clusterNetworkCidr)
  },

  setClusterNetworkHostPrefix: (clusterNetworkHostPrefix) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputClusterNetworkHostPrefixID)
      .fill(clusterNetworkHostPrefix)
  },

  setServiceNetworkCidr: (serviceNetworkCidr) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.inputServiceNetworkCidrID)
      .fill(serviceNetworkCidr)
  },

  selectHostsByCount: (hostsCount) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(commonElementSelectors.elements.checkbox)
      .each(($checkboxElement, checkboxIndex) => {
        if (checkboxIndex < hostsCount) {
          cy.wrap($checkboxElement).click({ force: true })
        }
      })
  },

  selectAvailableSubnets: (dropDownHostsSubnetID) => {
    // select the first subnet range
    return cy.get(dropDownHostsSubnetID, { timeout: extraVars.waitFor.hostSubnetAppears }).select(1)
  },

  fillClusterHostsPage: (wizardFlow, clusterHostsCount, infraenvLocation, clusterName) => {
    // wizardFlow == "latebinding"
    if (wizardFlow == centrallyManagedClustersData.wizardFlow.latebinding) {
      clusterCreationExistingHostsMethods.fillClusterHostsBoundPage(clusterHostsCount, infraenvLocation)

      // confirm selection
      genericFunctions.clickNext()
    }

    // wizardFlow == "integratedAI"
    else if (wizardFlow == centrallyManagedClustersData.wizardFlow.integratedAI) {
      clusterCreationNewHostsMethods.clickAddHostToCluster()
      clusterCreationNewHostsMethods.setClusterSSHKey(infraEnvDataConfig.metadata.infraenvSshPublicKey)

      // check if proxy configured for the hub, if so,
      // configure it for the spoke aswell
      if ('httpsProxy' in extraVars) {
        clusterCreationNewHostsMethods.setSpokeProxy(extraVars.httpProxy, extraVars.httpsProxy, extraVars.noProxy)
      }

      clusterCreationNewHostsMethods.clickGenerateDiscoveryIso()
      clusterCreationNewHostsMethods.wgetDownloadDiscoveryIso(clusterName)

      // close the iso download dialog
      cy.get(commonElementSelectors.elements.button)
        .contains(commonElementSelectors.elementsText.close)
        .click({ force: true })

      // boot vm/s with the discovery iso
      for (let vmName of Object.keys(extraVars.spoke_cluster_info.hosts)) {
        clusterCreationNewHostsMethods.bootVMWithDiscoveryIso(
          vmName,
          centrallyManagedClustersData.clusterHostsPage.nameDiscoveryISOFile,
          `${centrallyManagedClustersData.clusterHostsPage.pathVMDiscoveryIsoDestinationPath}/${clusterName}`
        )
      }

      // wait for all hosts to be discovered
      for (let hostIndex = 2; hostIndex <= clusterHostsCount + 1; hostIndex++) {
        clusterCreationNewHostsMethods.waitForDiscoveredHosts(hostIndex)
      }

      // approve all hosts
      centrallyManagedClustersMethods.approveAllHosts()

      // wait for hosts to be approved
      cy.wait(extraVars.waitFor.hostToBeApproved)

      // wait till all hosts are Ready for install
      for (let hostIndex = 2; hostIndex <= clusterHostsCount + 1; hostIndex++) {
        clusterCreationExistingHostsMethods.waitForHostToBeReady(hostIndex)
      }

      genericFunctions.clickNext()
    }
  },

  fillAdvancedNetworking: (clusterNetworkCidr, clusterNetworkHostPrefix, serviceNetworkCidr) => {
    // check the advanced networking option
    centrallyManagedClustersMethods.clickUseAdvancedNetworkOptions()

    // fill advanced configurations such as Cluster network CIDR, service network CIDR...
    centrallyManagedClustersMethods.setClusterNetworkCidr(clusterNetworkCidr)
    centrallyManagedClustersMethods.setClusterNetworkHostPrefix(clusterNetworkHostPrefix)
    centrallyManagedClustersMethods.setServiceNetworkCidr(serviceNetworkCidr)
  },

  fillClusterNetworkPage: (clusterType, sshKey = '') => {
    // if hypershift cluster
    if (clusterType == centrallyManagedClustersData.clusterType.hypershift) {
      clusterHyperShiftMethods.fillNodePortIPAdder(extraVars.node_port_ip)

      // select hypershift workers machine cidr range
      clusterHyperShiftMethods.selectAvailableMachineCidr(
        centrallyManagedClustersData.clusterNetworkPage.IDs.dropDownMachineCidrID
      )

      // fill ssh public key
      clusterCreationNewHostsMethods.setClusterSSHKey(sshKey)
    } else {
      // select hosts subnet
      centrallyManagedClustersMethods.selectAvailableSubnets(
        centrallyManagedClustersData.clusterNetworkPage.IDs.dropDownHostsSubnetID
      )

      if (clusterType != centrallyManagedClustersData.clusterType.sno) {
        // fill apivip and ingressvip addresses
        centrallyManagedClustersMethods.setApiVipAddress(extraVars.spoke_cluster_info.api_vip)
        centrallyManagedClustersMethods.setIngressVipAddress(extraVars.spoke_cluster_info.ingress_vip)
      }

      // check if this is an ipv6 cluster
      if (extraVars.is_baremetal_net_ipv6) {
        centrallyManagedClustersMethods.fillAdvancedNetworking(
          extraVars.advancedNetworkConfig.spoke_cluster_network_cidr_ipv6,
          extraVars.advancedNetworkConfig.spoke_cluster_network_hostprefix_ipv6,
          extraVars.advancedNetworkConfig.spoke_service_network_ipv6
        )
      }
    }
  },

  clickUseAdvancedNetworkOptions: () => {
    cy.wait(extraVars.waitFor.elementToShow)
      .get(centrallyManagedClustersData.clusterNetworkPage.IDs.checkBoxUseAdvancedNetworkID)
      .click({ force: true })
  },

  clickGoToClusterInstallation: (txtGoToClusterInstallBtn) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .contains(commonElementSelectors.elements.button, txtGoToClusterInstallBtn)
      .click({ force: true })
  },

  waitForAgentsStatusInstalled: (hostRowIndex) => {
    cy.hostDetailSelector(hostRowIndex, 'Status', extraVars.waitFor.agentsInsalledStatus)
      .should('contain', 'Installed')
      .and('not.contain', 'Error')
  },

  clickDownloadKubeConfig: (txtDownloadKubeConfigButtonName) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .contains(commonElementSelectors.elements.button, txtDownloadKubeConfigButtonName)
      .click({ force: true })

    // give the file time to download
    cy.wait(extraVars.waitFor.downloadToFinish)
  },

  getSpokeKubeadminPassword: (txtRevealCredentialsButton, idPasswordCredentialsButton) => {
    cy.wait(extraVars.waitFor.elementToShow)
      .contains(commonElementSelectors.elements.button, txtRevealCredentialsButton)
      .click({ force: true })

    cy.wait(extraVars.waitFor.elementToShow)
      .get(idPasswordCredentialsButton)
      .invoke('text')
      .then((text) => {
        expect(text.length).to.equal(23)
        cy.writeFile(`${extraVars.spoke_kubeconfig_path}/auth/kubeadmin-password`, text)
      })
  },

  waitForSpokeAgentsToCompletedInstallation: (clusterHostsCount) => {
    for (var clusterHostIndex = 2; clusterHostIndex <= clusterHostsCount + 1; clusterHostIndex++) {
      centrallyManagedClustersMethods.waitForAgentsStatusInstalled(clusterHostIndex)
    }
  },

  createSpokeCluster: (
    clusterName,
    clusterType,
    wizardFlow,
    clusterHostsCount,
    infraenvLocation,
    clusterPullSecret,
    clusterBaseDomain,
    clusterOCPImageSet = extraVars.spoke_cluster_version,
    sshKey = '',
    nodePoolNumToAdd = 0,
    isCPUx86 = false
  ) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    centrallyManagedClustersMethods.clickOnHostInventoryProvider()

    centrallyManagedClustersMethods.openClusterDetailsPage(wizardFlow)

    centrallyManagedClustersMethods.fillClusterDetailsPage(
      clusterName,
      clusterType,
      clusterPullSecret,
      clusterBaseDomain,
      clusterOCPImageSet,
      isCPUx86
    )
    genericFunctions.clickNext()

    switch (wizardFlow) {
      case centrallyManagedClustersData.wizardFlow.latebinding:
      case centrallyManagedClustersData.wizardFlow.integratedAI:
        // skip the automation template page and continue
        centrallyManagedClustersMethods.getSpokeAutomationPageTitle().should('exist')
        genericFunctions.clickNext()

        // review and save the cluster
        centrallyManagedClustersMethods.verifyClusterDetailsInfo(
          clusterName,
          clusterType,
          clusterBaseDomain,
          clusterOCPImageSet,
          isCPUx86
        )
        genericFunctions.clickSave()

        // call ClusterHosts page method and fill details according to the wizard flow
        centrallyManagedClustersMethods.getSpokeClustreHostsPageTitle().should('exist')
        centrallyManagedClustersMethods.fillClusterHostsPage(
          wizardFlow,
          clusterHostsCount,
          infraenvLocation,
          clusterName
        )

        // wait for Cluster Network detail page to load, check title and fill details
        centrallyManagedClustersMethods
          .getSpokeClusterNetworkPageTitle(centrallyManagedClustersData.clusterNetworkPage.txtTitle)
          .should('exist')

        centrallyManagedClustersMethods.fillClusterNetworkPage(clusterType)

        // wait till all hosts are Ready for install
        for (let hostIndex = 2; hostIndex <= clusterHostsCount + 1; hostIndex++) {
          clusterCreationExistingHostsMethods.waitForHostToBeReady(hostIndex)
        }
        genericFunctions.clickNext()

        // wait for validation to finish processing and verify Review and Create Page
        centrallyManagedClustersMethods
          .getSpokeClusterReviewPageTitle(centrallyManagedClustersData.clusterReviewPage.txtTitle)
          .should('exist')
        centrallyManagedClustersMethods.verifyReviewAndCreateInfo(
          clusterName,
          clusterBaseDomain,
          clusterOCPImageSet,
          isCPUx86
        )

        // click 'Install Cluster'
        genericFunctions.clickInstallCluster()

        // wait until spoke cluster agents complete installation - by status 'Installed'
        centrallyManagedClustersMethods.getClusterInstallTitle(clusterName).should('exist')
        centrallyManagedClustersMethods.waitForSpokeAgentsToCompletedInstallation(clusterHostsCount)

        break
      case centrallyManagedClustersData.wizardFlow.hypershift:
        clusterHyperShiftMethods.getNodePoolPageTitle().should('exist')
        clusterHyperShiftMethods.fillNodePoolPage(
          clusterHostsCount,
          nodePoolNumToAdd,
          `#form-numberinput-nodePools-${nodePoolNumToAdd}-count-count-field`
        )
        genericFunctions.clickNext()

        centrallyManagedClustersMethods.fillClusterNetworkPage(clusterType, sshKey)

        genericFunctions.clickNext()

        centrallyManagedClustersMethods.getSpokeAutomationPageTitle().should('exist')
        genericFunctions.clickNext()

        // click 'Create'
        genericFunctions.clickCreateCluster()

        break
      default:
        cy.log('no such flow in cim')
    }

    // wait until spoke cluster installation is finalized and completed
    centrallyManagedClustersMethods.waitForSpokeClusterToCompleteInstallation(clusterName)

    // go to the installed spoke cluster
    managedClusterDetailMethods.goToManagedClusterOverview(clusterName)

    // ensure the CPU type showm correctly for all hosts
    if (clusterType == centrallyManagedClustersData.clusterType.ocpMultiNode) {
      var majorVersion = parseInt(clusterOCPImageSet.split('.')[0])
      var minorVersion = parseInt(clusterOCPImageSet.split('.')[1])
      if (((majorVersion == 4) & (minorVersion >= 10)) | (majorVersion > 4)) {
        if (isCPUx86) {
          centrallyManagedClustersMethods.verifySpokeClusterHostsCPUArcitecture(
            generalTestData.cpuArchitecture.txtCPUArchitectureX86
          )
        } else {
          centrallyManagedClustersMethods.verifySpokeClusterHostsCPUArcitecture(
            generalTestData.cpuArchitecture.txtCPUArchitectureArm64
          )
        }
      }
    }

    // download kubeconfig file
    centrallyManagedClustersMethods.clickDownloadKubeConfig(
      centrallyManagedClustersData.clusterInstallDetailsPage.txtDownloadKubeconfigBtn
    )

    // create a folder to store spoke cluster kubeconfig and kubeadmin password files,
    // and copy the downloaded kubeconfig to that folder
    cy.runCmd(`mkdir -p ${extraVars.spoke_kubeconfig_path}/auth`)
    cy.copyKubeconfigToPath(
      centrallyManagedClustersData.clusterInstallDetailsPage.pathKubeconfigCurrentPath,
      extraVars.spoke_kubeconfig
    )

    // get the spoke kubeadmin password and save it to file
    centrallyManagedClustersMethods.getSpokeKubeadminPassword(
      centrallyManagedClustersData.clusterInstallDetailsPage.revealCredentialsButtonTxt,
      centrallyManagedClustersData.clusterInstallDetailsPage.passwordCredentialsButtonId
    )
  },

  openClusterDetailsPage: (wizardFlow) => {
    switch (wizardFlow) {
      case centrallyManagedClustersData.wizardFlow.latebinding:
        centrallyManagedClustersMethods.clickOnStandAloneCPType()
        centrallyManagedClustersMethods.clickExistingHostsInstallationType(
          centrallyManagedClustersData.installationTypePage.txtExistingDiscoveredHostsButtonTitle,
          centrallyManagedClustersData.installationTypePage.IDs.btnExistingDiscoveredHostsButtonID
        )
        break
      case centrallyManagedClustersData.wizardFlow.integratedAI:
        centrallyManagedClustersMethods.clickOnStandAloneCPType()
        centrallyManagedClustersMethods.clickNewDiscoveredHostsInstallationType(
          centrallyManagedClustersData.installationTypePage.txtNewDiscoveredHostsButtonTitle,
          centrallyManagedClustersData.installationTypePage.IDs.btnNewDiscoveredHostsButtonID
        )
        break
      case centrallyManagedClustersData.wizardFlow.hypershift:
        centrallyManagedClustersMethods.clickHostedCPType()
        break
      default:
        cy.log('no such flow in cim')
    }
  },

  verifyCPUArchAvailabilityClusterDetailsPage: (clusterName, clusterType, clusterBaseDomain) => {
    centrallyManagedClustersMethods.setClusterName(clusterName)
    centrallyManagedClustersMethods.setClusterBaseDomain(clusterBaseDomain)

    // check cluster type before filling - if sno, check sno
    if (clusterType == centrallyManagedClustersData.clusterType.sno) {
      centrallyManagedClustersMethods.checkIsSNOCheckBox(
        centrallyManagedClustersData.clusterDetailsPage.IDs.checkBoxIsSNO
      )
    }

    // verify for 4.9 version CPU arch checkbox is disabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.9')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.disabled')

    // verify for 4.10 version CPU arch checkbox is enabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.10')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.enabled')

    // Check the box to ensure it can be checked
    centrallyManagedClustersMethods.checkIsArm64CPUBox()

    // verify for 4.8 version CPU arch checkbox is disabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.8')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.disabled').should('not.be.checked')

    // verify for 4.11 version CPU arch checkbox is enabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.11')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.enabled')

    // Check the box to ensure it can be checked
    centrallyManagedClustersMethods.checkIsArm64CPUBox()

    // set again to 4.9 version to ensure CPU arch checkbox is disabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.9')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.disabled').should('not.be.checked')

    // verify for 4.12 version CPU arch checkbox is enabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.12')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.enabled')

    // Check the box to ensure it can be checked
    centrallyManagedClustersMethods.checkIsArm64CPUBox()

    // set again to 4.9 version to ensure CPU arch checkbox is disabled
    centrallyManagedClustersMethods.setClusterOCPVersion('4.9')

    centrallyManagedClustersMethods.getIsArm64Checkbox().should('be.disabled').should('not.be.checked')
  },

  createSpokeClusterVerifyCPUArchAvailability: (clusterName, clusterType, wizardFlow, clusterBaseDomain) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    centrallyManagedClustersMethods.clickOnHostInventoryProvider()
    centrallyManagedClustersMethods.openClusterDetailsPage(wizardFlow)

    centrallyManagedClustersMethods.verifyCPUArchAvailabilityClusterDetailsPage(
      clusterName,
      clusterType,
      clusterBaseDomain
    )

    genericFunctions.clickCancel()
  },

  createSpokeClusterNoHostsAvailable: (
    clusterName,
    clusterType,
    wizardFlow,
    clusterPullSecret,
    clusterBaseDomain,
    clusterOCPImageSet = extraVars.spoke_cluster_version,
    isCPUx86
  ) => {
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    centrallyManagedClustersMethods.clickOnHostInventoryProvider()

    // fill info in cluster details page
    centrallyManagedClustersMethods.openClusterDetailsPage(wizardFlow)
    centrallyManagedClustersMethods.fillClusterDetailsPage(
      clusterName,
      clusterType,
      clusterPullSecret,
      clusterBaseDomain,
      clusterOCPImageSet,
      isCPUx86
    )
    genericFunctions.clickNext()

    // skip the automation template page and continue
    centrallyManagedClustersMethods.getSpokeAutomationPageTitle().should('exist')
    genericFunctions.clickNext()

    // review and save the cluster
    genericFunctions.clickSave()

    // wait for ClusterHosts page
    centrallyManagedClustersMethods.getSpokeClustreHostsPageTitle().should('exist')

    // verify the warning "No available hosts" is shown
    if (isCPUx86) {
      cy.get('.pf-c-alert__title').contains('No available hosts with x86_64 architecture were found')
    } else {
      cy.get('.pf-c-alert__title').contains('No available hosts with arm64 architecture were found')
    }

    //click Cancel to leave Summary page
    genericFunctions.clickCancel()

    //click Cancel to leave fill details page
    genericFunctions.clickCancel()
  },
}
