/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'
import { acmHeaderSelectors } from '../../header'

import { clusterSetPages, clusterSetMethods } from './clusterSets'
import { clusterSetOverviewPages } from './clusterset_overview'

/**
 * This object contais the group of selector that are part of resource assignment
 */
export const resourceAssignmentSelector = {
  elementText: {
    backToClusterSet: 'Back to cluster sets',
    manageResourceAssignment: 'Manage resource assignments',
  },
  tableColumnFields: {
    name: '[data-label="Name"]',
    infra: '[data-label="Infrastructure"]',
    distrVer: '[data-label="Distribution version"]',
    labels: '[data-label="Labels"]',
    nodes: '[data-label="Nodes"]',
    currentClusterSet: '[data-label="Current cluster set"]',
  },
  msg: {
    noClusters: "You don't have any clusters assigned to this cluster set",
    noClusterPools: "You don't have any cluster pools assigned to this cluster set",
  },
  confirmDialog: {
    tableColumnFields: {
      name: 'td[data-label="Name"]',
      currentClusterSet: 'td[data-label="Current cluster set"]',
      change: 'td[data-label="Change"]',
    },
    button: {
      save: 'button[id="save"]',
    },
  },
}

/**
 * This object contais the group of methods that are part of clusterSet resource assignment
 */
export const resourceAssignmentMethods = {
  clusterShouldExist: (clusterName, clusterSet, role) => {
    clusterSetOverviewPages.goToManagedClusters(clusterSet, role)
    commonPageMethods.resourceTable.rowShouldExist(clusterName)
  },

  clusterShouldNotExist: (clusterName, clusterSet, role) => {
    clusterSetOverviewPages.goToManagedClusters(clusterSet, role)
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (!$body.text().includes(resourceAssignmentSelector.msg.noClusters)) {
        commonPageMethods.resourceTable.rowShouldNotExist(clusterName)
      }
    })
  },

  clusterPoolShouldExist: (clusterPool, clusterSet, role) => {
    clusterSetOverviewPages.goToClusterPools(clusterSet, role)
    commonPageMethods.resourceTable.checkIfRowExistsByName(clusterPool)
  },

  clusterPoolShouldNotExist: (clusterPool, clusterSet, role) => {
    clusterSetOverviewPages.goToClusterPools(clusterSet, role)
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (!$body.text().includes(resourceAssignmentSelector.msg.noClusterPools)) {
        commonPageMethods.resourceTable.rowShouldNotExist(clusterPool)
      }
    })
  },

  clusterShouldNotExistInManagedResourcePage: (clusterName, clusterSet) => {
    clusterSetMethods.clusterSetShouldExist(clusterSet)
    clusterSetPages.goToResourceAssignmentByOption(clusterSet)
    commonPageMethods.resourceTable.rowShouldNotExist(clusterName)
  },

  addClusterToClusterSet: (clusterName, clusterSet, action) => {
    commonPageMethods.resourceTable.searchTable(clusterName)

    cy.get(resourceAssignmentSelector.tableColumnFields.name)
      .contains(clusterName)
      .parent()
      .parent()
      .prev()
      .find(commonElementSelectors.elements.input)
      .check()
      .should('be.checked')
    cy.get(resourceAssignmentSelector.confirmDialog.button.save).click()

    if (action) cy.get(resourceAssignmentSelector.confirmDialog.tableColumnFields.change + ':visible').contains(action)

    commonPageMethods.modal.clickDanger(commonElementSelectors.elementsText.save)
    commonPageMethods.waitforDialogClosed()
    cy.contains(commonElementSelectors.elements.h1, clusterSet, { timeout: 60000 }).should('exist')
  },

  addClusterByOption: (clusterName, clusterSet, action) => {
    clusterSetMethods.clusterSetShouldExist(clusterSet)
    clusterSetPages.goToResourceAssignmentByOption(clusterSet)
    resourceAssignmentMethods.addClusterToClusterSet(clusterName, clusterSet, action)
  },

  addClusterByAction: (clusterName, clusterSet, action) => {
    clusterSetOverviewPages.goToResourceAssignmentByAction(clusterSet)
    resourceAssignmentMethods.addClusterToClusterSet(clusterName, clusterSet, action)
  },

  addClusterInManagedClusterPage: (clusterName, clusterSet, action) => {
    clusterSetOverviewPages.goToManageResourceAssignmentFromManagedClustersPage(clusterSet)
    resourceAssignmentMethods.addClusterToClusterSet(clusterName, clusterSet, action)
  },

  removeClusterByOption: (clusterName, clusterSet, action) => {
    clusterSetMethods.clusterSetShouldExist(clusterSet)
    clusterSetPages.goToResourceAssignmentByOption(clusterSet)
    resourceAssignmentMethods.removeClusterFromClusterSet(clusterName, clusterSet, action)
  },

  removeClusterByAction: (clusterName, clusterSet, action) => {
    clusterSetOverviewPages.goToResourceAssignmentByAction(clusterSet)
    resourceAssignmentMethods.removeClusterFromClusterSet(clusterName, clusterSet, action)
  },

  removeClusterFromClusterSet: (clusterName, clusterSet, action) => {
    commonPageMethods.resourceTable.searchTable(clusterName)
    cy.get(resourceAssignmentSelector.tableColumnFields.name)
      .contains(clusterName)
      .parent()
      .parent()
      .prev()
      .find(commonElementSelectors.elements.input)
      .uncheck()
      .should('not.be.checked')
    cy.get(resourceAssignmentSelector.confirmDialog.button.save).click()

    if (action) cy.get(resourceAssignmentSelector.confirmDialog.tableColumnFields.change + ':visible').contains(action)

    commonPageMethods.modal.clickDanger(commonElementSelectors.elementsText.save)
    commonPageMethods.waitforDialogClosed()

    cy.contains(commonElementSelectors.elements.h1, clusterSet, { timeout: 60000 }).should('exist')
  },
}

/**
 * This object contais the group of pages that are part of clusterSet resource assignment
 */
export const resourceAssignmentPages = {
  shouldLoad: (clusterSet) => {
    cy.get(commonElementSelectors.elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', `/clusters/sets/details/${clusterSet}/manage-resources`, { timeout: 10000 })
    cy.get(commonElementSelectors.elements.button, { timeout: 10000 }).should(
      'contain',
      commonElementSelectors.elementsText.review
    )
    cy.wait(1000)
  },
}
