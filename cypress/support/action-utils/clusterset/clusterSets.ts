/* Copyright Contributors to the Open Cluster Management project */
/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { acm23xheaderMethods, acmHeaderSelectors } from '../../header'
import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'

import { managedClustersMethods, clustersPages } from '../managedcluster/managedCluster'
import { clusterPoolsSelectors, clusterPoolCreatePages, clusterPoolPages } from '../clusterpool/clusterPools'

import { clusterSetOverviewPages } from './clusterset_overview'
import { resourceAssignmentPages } from './clusterset_resourceassign'

import { getClusterSet, getNamespaceBinding } from '../../api-utils/clusterSet'

/**
 * This object contais the group of selector that are part of clusterSet
 */
export const clusterSetPageSelector = {
  elementTab: {
    clusterSetTab: 'Cluster sets',
  },
  elementText: {
    createClusterSet: 'Create cluster set',
    deleteClusterSets: 'Delete cluster sets',
  },
  button: {
    createClusterSet: 'button[id="createClusterSet"]',
    deleteClusterSets: 'li[id="deleteClusterSets"]',
  },
  tableRowOptionsMenu: {
    editNamespaceBinding: 'a[text="Edit namespace bindings"]',
    manageResourceAssignment: 'a[text="Manage resource assignments"]',
    deleteClusterSet: 'a[text="Delete cluster set"]',
  },
  tableRowOptionsText: {
    editNamespaceBinding: 'Edit namespace bindings',
    manageResourceAssignment: 'Manage resource assignments',
    deleteClusterSet: 'Delete cluster set',
  },
  tableColumnFields: {
    name: '[data-label="Name"]',
    clusterStatus: '[data-label="Cluster status"]',
    namespaceBindings: '[data-label="Namespace bindings"]',
  },
  popOver: {
    globalClusterSetPopOver:
      'This global cluster set exists by default and contains all of the managed clusters, imported or created.',
  },
  msg: {
    noClusterSet: "You don't have any cluster sets",
    createSuccess: 'Cluster set successfully created',
  },
  createClusterSet: {
    title: 'Create cluster set',
    clusterSetName: '#clusterSetName',
  },
  namespaceBinding: {
    ns: '#namespaces-label',
    title: 'Edit namespace bindings',
    nsList: 'ul[id="namespaces"]',
    remove: 'button[aria-label="Remove"]',
  },
}

/**
 * This object contais the group of methods that are part of clusterSet page
 */
export const clusterSetMethods = {
  // The function used to make sure the clusterset was exists
  clusterSetShouldExist: (clusterSet, role?) => {
    clusterSetPages.goToClusterSetTable(role)
    commonPageMethods.resourceTable.rowShouldExist(clusterSet)
  },

  // The function used to make sure the clusterset was not exists
  clusterSetShouldNotExist: (clusterSet, role?) => {
    clusterSetPages.goToClusterSetTable(role)
    commonPageMethods.resourceTable.rowShouldNotExist(clusterSet)
  },

  /**
   * Create a clusterset via the UI
   * @param {*} clusterSet the clusterset name
   */
  createClusterSet: (clusterSet) => {
    // if the clusterset doesn't exist, let's create it. Otherwise we won't bother.
    getClusterSet(clusterSet).then((resp) => {
      if (resp.status == 404) {
        clusterSetPages.goToCreateClusterSet()
        cy.get(clusterSetPageSelector.createClusterSet.clusterSetName).type(clusterSet)
        cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
        cy.get(commonElementSelectors.elements.dialog, { timeout: 2000 })
          .contains(clusterSetPageSelector.msg.createSuccess)
          .then(() =>
            cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.close).click()
          )
      }
    })
  },

  /**
   * Delete a clusterset via the UI
   * @param {*} clusterSet the clusterset name
   */
  deleteClusterSet: (clusterSet, cancel) => {
    getClusterSet(clusterSet).then((resp) => {
      if (resp.status == 200) {
        clusterSetMethods.clusterSetShouldExist(clusterSet)
        clusterSetPages.goToDeleteClusterSet(clusterSet)
        commonPageMethods.modal.confirmAction(clusterSet)
        if (!cancel) {
          cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
          cy.log('Make sure the clusterset should be deleted')
          cy.waitUntil(
            () => {
              return getClusterSet(clusterSet).then((resp) => {
                return resp.status == 404
              })
            },
            {
              interval: 2 * 1000,
              timeout: 20 * 1000,
            }
          )
        } else {
          cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
            .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
            .click({ timeout: 20000 })
          getClusterSet(clusterSet).then((resp) => {
            expect(resp.status).to.be.eq(200)
          })
        }
      }
    })
  },

  deleteClusterSetByAction: (clusterSet, cancel) => {
    getClusterSet(clusterSet).then((resp) => {
      if (resp.status == 200) {
        clusterSetMethods.clusterSetShouldExist(clusterSet)
        clusterSetPages.goToDeleteClusterSetbyAction(clusterSet)
        if (clusterSet != 'global') {
          commonPageMethods.modal.confirmAction('confirm')
          if (!cancel) {
            cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
            cy.log('Make sure the clusterset should be deleted')
            cy.waitUntil(
              () => {
                return getClusterSet(clusterSet).then((resp) => {
                  return resp.status == 404
                })
              },
              {
                interval: 2 * 1000,
                timeout: 20 * 1000,
              }
            )
          } else {
            cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
              .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
              .click({ timeout: 20000 })
            getClusterSet(clusterSet).then((resp) => {
              expect(resp.status).to.be.eq(200)
            })
          }
        }
      }
    })
  },

  createInvalidClusterSet: (clusterSet) => {
    clusterSetPages.goToCreateClusterSet()
    cy.get(clusterSetPageSelector.createClusterSet.clusterSetName).type(clusterSet)
    cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
    commonPageMethods.notification.shouldExist('danger')
    cy.get(commonElementSelectors.alerts.alertTitle).should('contain', 'ResourceError')
    cy.get(commonElementSelectors.alerts.alertIcon).should('exist')
    cy.get(commonElementSelectors.alerts.alertAction).should('exist')
    cy.get(commonElementSelectors.alerts.alertDescrition).should('contain', clusterSet)
    cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
      .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
      .click({ timeout: 20000 })
  },

  checkClusterSetInClusterCreation: (clusterSet, provider, exist) => {
    // TODO, add goto create cluster func
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickCreate()
    managedClustersMethods.fillInfrastructureProviderDetails(provider)
    cy.get('#clusterSet-label')
      .find(commonElementSelectors.elements.input)
      .click()
      .then(() => {
        if (exist) cy.get(commonElementSelectors.elements.selectMenuItem).contains(clusterSet)
        else cy.get(commonElementSelectors.elements.selectMenuItem).should('not.contain', clusterSet)
      })
  },

  checkClusterSetInClusterImport: (clusterSet, exist) => {
    // TODO, add goto import cluster func
    acm23xheaderMethods.goToClusters()
    managedClustersMethods.clickImport()
    cy.get('#managedClusterSet')
      .click()
      .then(() => {
        if (exist) cy.get('#managedClusterSet-form-group').contains(clusterSet)
        else cy.get('#managedClusterSet-form-group').should('not.contain', clusterSet)
      })
  },

  checkClusterSetInClusterPoolCreation: (clusterSet, provider, exist) => {
    // TODO, add goto create clusterpool func
    clusterPoolPages.goToClusterPools()
    cy.wait(500)
      .contains(commonElementSelectors.elements.button, clusterPoolsSelectors.elementText.createClusterPoolButton)
      .click()
    clusterPoolCreatePages.fillInfrastructureProviderDetails(provider)

    cy.get('#clusterSet-label')
      .click()
      .then(() => {
        if (exist) cy.get('#clusterSet').contains(clusterSet)
        else cy.get('#clusterSet').should('not.contain', clusterSet)
      })
  },

  addNamespaceBinding: (clusterSet, ns) => {
    getNamespaceBinding(clusterSet, ns).then((resp) => {
      if (resp.status == 404) {
        clusterSetMethods.clusterSetShouldExist(clusterSet)
        clusterSetPages.goToNamespaceBindingByOption(clusterSet)
        cy.get(clusterSetPageSelector.namespaceBinding.ns).find(commonElementSelectors.elements.input).click()
        cy.get(clusterSetPageSelector.namespaceBinding.ns)
          .find(commonElementSelectors.elements.input)
          .type(ns)
          .wait(500)
          .then(() => {
            cy.get(clusterSetPageSelector.namespaceBinding.nsList)
              .find('li')
              .each(($namespace) => {
                if ($namespace.text() == ns) cy.wrap($namespace).click()
              })
          })
        cy.get(clusterSetPageSelector.namespaceBinding.ns).then((body) => {
          if (body.find(clusterSetPageSelector.namespaceBinding.nsList).length > 0) {
            cy.get(commonElementSelectors.elements.dropDownToggleButton).click()
          }
        })
        cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
      }
    })
  },

  deleteNamespaceBinding: (clusterSet, ns) => {
    getNamespaceBinding(clusterSet, ns).then((resp) => {
      if (resp.status != 404) {
        clusterSetMethods.clusterSetShouldExist(clusterSet)
        clusterSetPages.goToNamespaceBindingByOption(clusterSet)
        cy.get(commonElementSelectors.elements.chipText)
          .contains(ns)
          .parent()
          .find(clusterSetPageSelector.namespaceBinding.remove)
          .click()
        cy.get(clusterSetPageSelector.namespaceBinding.ns).then((body) => {
          if (body.find(clusterSetPageSelector.namespaceBinding.nsList).length > 0) {
            cy.get(commonElementSelectors.elements.dropDownToggleButton).click()
          }
        })
        cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
      }
    })
  },

  checkClusterSetActionByOption: (clusterSet) => {
    clusterSetMethods.clusterSetShouldExist(clusterSet)
    commonPageMethods.resourceTable.openRowMenu(clusterSet)
    if (clusterSet == 'global') {
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.editNamespaceBinding,
        true
      )
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.manageResourceAssignment,
        false
      )
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.deleteClusterSet,
        false
      )
    } else {
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.editNamespaceBinding,
        true
      )
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.manageResourceAssignment,
        true
      )
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetPageSelector.tableRowOptionsText.deleteClusterSet,
        true
      )
    }
  },

  checkUserClusterSetActionByOption: (clusterSet, role) => {
    switch (role) {
      case 'view':
      case 'bind':
        // clusterset bind and view did not have permission to create the cluster
        clustersPages.goToClusterSetsWithUser()
        break
      case 'admin':
      default:
        clustersPages.goToClusterSet()
        break
    }
    commonPageMethods.resourceTable.rowShouldExist(clusterSet)
    commonPageMethods.resourceTable.openRowMenu(clusterSet)
    switch (role) {
      case 'view':
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        if (clusterSet == 'global') {
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetPageSelector.tableRowOptionsText.manageResourceAssignment,
            false
          )
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetPageSelector.tableRowOptionsText.deleteClusterSet,
            false
          )
        } else {
          cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).should(
            'have.class',
            commonElementSelectors.elements.disabledButton
          )
          cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).should(
            'have.class',
            commonElementSelectors.elements.disabledButton
          )
        }
        break
      case 'bind':
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        if (clusterSet == 'global') {
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetPageSelector.tableRowOptionsText.manageResourceAssignment,
            false
          )
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetPageSelector.tableRowOptionsText.deleteClusterSet,
            false
          )
        } else {
          cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).should(
            'have.class',
            commonElementSelectors.elements.disabledButton
          )
          cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).should(
            'have.class',
            commonElementSelectors.elements.disabledButton
          )
        }
        break
      case 'admin':
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        break
      default:
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        break
    }
  },

  checkUserClusterSetDeleteByAction: (clusterSet) => {
    clustersPages.goToClusterSetsWithUser()
    commonPageMethods.resourceTable.rowShouldExist(clusterSet)

    clusterSetPages.goToDeleteClusterSetbyAction(clusterSet)
    if (clusterSet != 'global') {
      commonPageMethods.modal.confirmAction('confirm')
      cy.get(commonElementSelectors.elements.submit, { timeout: 2000 })
        .click()
        .then(() =>
          cy
            .get(`tr[data-ouia-component-id="${clusterSet}"] td[data-label="Error"]`)
            .contains(commonElementSelectors.elementsText.forbiddenMsg)
            .then(() =>
              cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.close).click()
            )
        )
    }
  },
}

/**
 * This object contais the group of page that are part of clusterSet page
 */
export const clusterSetPages = {
  shouldLoad: () => {
    cy.get(commonElementSelectors.elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', '/infrastructure/clusters/sets', { timeout: 10000 })
    cy.get(commonElementSelectors.elements.button, { timeout: 10000 }).should(
      'contain',
      clusterSetPageSelector.elementText.createClusterSet
    )
    cy.wait(1000)
  },

  goToClusterSetTable: (role) => {
    switch (role) {
      case 'view':
      case 'bind':
        clustersPages.goToClusterSetsWithUser()
        break
      case 'admin':
      default:
        clustersPages.goToClusterSet()
        break
    }
  },

  goToClusterSetDetail: (clusterSet) => {
    cy.get(clusterSetPageSelector.tableColumnFields.name)
      .contains(commonElementSelectors.elements.a, clusterSet)
      .click()
    clusterSetOverviewPages.shouldLoad(clusterSet)
  },

  goToCreateClusterSet: () => {
    clustersPages.goToClusterSet()
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (!$body.text().includes(clusterSetPageSelector.msg.noClusterSet)) {
        cy.get(clusterSetPageSelector.button.createClusterSet, { timeout: 3000 }).should('exist').click()
      } else {
        cy.contains(commonElementSelectors.elements.button, clusterSetPageSelector.elementText.createClusterSet).click()
      }
    })
  },

  goToDeleteClusterSet: (clusterSet) => {
    commonPageMethods.resourceTable.openRowMenu(clusterSet)
    cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).click()
  },

  goToDeleteClusterSetbyAction: (clusterSet) => {
    if (clusterSet == 'global') {
      cy.get(clusterSetPageSelector.tableColumnFields.name)
        .contains(commonElementSelectors.elements.a, clusterSet)
        .parent()
        .parent()
        .prev()
        .find(commonElementSelectors.elements.input)
        .should('be.disabled')
    } else {
      cy.get(clusterSetPageSelector.tableColumnFields.name)
        .contains(commonElementSelectors.elements.a, clusterSet)
        .parent()
        .parent()
        .prev()
        .find(commonElementSelectors.elements.input)
        .check()
        .should('be.checked')
      cy.get(commonElementSelectors.elements.toolbarContentSection).within(() =>
        cy.get(commonElementSelectors.elements.actionsButton).should('exist').click()
      )
      cy.wait(500)
      cy.get(commonElementSelectors.elements.a)
        .contains(clusterSetPageSelector.elementText.deleteClusterSets)
        .should('exist')
        .click()
      commonPageMethods.modal.shouldBeOpen()
    }
  },

  goToNamespaceBindingByOption: (clusterSet) => {
    commonPageMethods.resourceTable.openRowMenu(clusterSet)
    commonPageMethods.resourceTable.buttonShouldClickable(
      clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding
    )
    cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).click()
    commonPageMethods.modal.shouldBeOpen()
  },

  goToResourceAssignmentByOption: (clusterSet) => {
    commonPageMethods.resourceTable.openRowMenu(clusterSet)
    commonPageMethods.resourceTable.buttonShouldClickable(
      clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment
    )
    cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).click()
    resourceAssignmentPages.shouldLoad(clusterSet)
  },
}
