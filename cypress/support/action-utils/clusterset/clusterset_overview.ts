/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'
import { acmHeaderSelectors } from '../../header'

import { clustersPages } from '../managedcluster/managedCluster'

import { clusterSetMethods, clusterSetPages } from '../clusterset/clusterSets'
import { userManagementPages } from './clusterset_usermanage'
import { resourceAssignmentSelector } from './clusterset_resourceassign'

import { getClusterSet } from '../../api-utils/clusterSet'

/**
 * This object contais the group of selector that are part of cluster overview
 */
export const clusterSetOverviewSelector = {
  elementTab: {
    overview: 'Overview',
    submarinerAddon: 'Submariner add-ons',
    clusterList: 'Cluster list',
    clusterPools: 'Cluster pools',
    userManagement: 'User management',
  },
  elementText: {
    createClusterSet: 'Create cluster set',
    deleteClusterSet: 'Delete cluster set',
    backToClusterSet: 'Back to cluster sets',
  },
  actionText: {
    editNamespaceBinding: 'Edit namespace bindings',
    manageResourceAssignment: 'Manage resource assignments',
    deleteClusterSet: 'Delete cluster set',
  },
  actions: {
    editNamespaceBinding: 'li[id="edit-bindings"]',
    manageResourceAssignment: 'li[id="manage-clusterSet-resources"]',
    deleteClusterSet: 'li[id="delete-clusterSet"]',
  },
}

/**
 * This object contais the group of methods that are part of clusterSet overview page
 */
export const clusterSetOverviewPages = {
  shouldLoad: (clusterSet) => {
    cy.get(commonElementSelectors.elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', `/infrastructure/clusters/sets/details/${clusterSet}`, { timeout: 10000 })
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.overview + '")', { timeout: 2000 })
      .should('exist')
  },

  goToOverview: (clusterSet, role) => {
    // need to make sure we are in cluster detail page before click the user management tab
    clusterSetMethods.clusterSetShouldExist(clusterSet, role)
    clusterSetPages.goToClusterSetDetail(clusterSet)
  },

  goToUserManagement: (clusterSet) => {
    // need to make sure we are in cluster detail page before click the user management tab
    clusterSetOverviewPages.goToOverview(clusterSet)
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.userManagement + '")')
      .click()
    userManagementPages.shouldLoad(clusterSet)
  },

  goToManagedClusters: (clusterSet, role) => {
    // need to make sure we are in cluster detail page before click the cluster list tab
    clusterSetOverviewPages.goToOverview(clusterSet, role)
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.clusterList + '")')
      .click()
  },

  goToClusterPools: (clusterSet, role) => {
    // need to make sure we are in cluster detail page before click the cluster pools tab
    clusterSetOverviewPages.goToOverview(clusterSet, role)
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.clusterPools + '")')
      .click()
  },

  goToResourceAssignmentByAction: (clusterSet) => {
    clusterSetOverviewPages.goToOverview(clusterSet)
    commonPageMethods.actionMenu.clickActionButton(clusterSet)
    commonPageMethods.actionMenu.clickActionByOption(clusterSetOverviewSelector.actionText.manageResourceAssignment)
  },

  goToEditNamespaceBindingByAction: (clusterSet) => {
    clusterSetOverviewPages.goToOverview(clusterSet)
    commonPageMethods.actionMenu.clickActionButton(clusterSet)
    commonPageMethods.actionMenu.clickActionByOption(clusterSetOverviewSelector.actionText.editNamespaceBinding)
  },

  goToDeleteClusterSetByAction: (clusterSet) => {
    clusterSetOverviewPages.goToOverview(clusterSet)
    commonPageMethods.actionMenu.clickActionButton(clusterSet)
    commonPageMethods.actionMenu.clickActionByOption(clusterSetOverviewSelector.actionText.deleteClusterSet)
  },

  goToManageResourceAssignmentFromManagedClustersPage: (clusterSet) => {
    // this only available when the clusterset did not have any cluster added
    clusterSetOverviewPages.goToOverview(clusterSet)
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.clusterList + '")')
      .click()
    cy.get(commonElementSelectors.elements.mainSection, { timeout: 5000 }).then(($body) => {
      if ($body.text().includes(resourceAssignmentSelector.msg.noClusters)) {
        cy.wait(1500)
          .contains(commonElementSelectors.elements.a, resourceAssignmentSelector.elementText.manageResourceAssignment)
          .click()
      }
    })
  },
}

/**
 * This object contais the group of methods that are part of clusterSet overview page method
 */
export const clusterSetOverviewMethods = {
  deleteClusterSetByAction: (clusterSet, cancel) => {
    clusterSetOverviewPages.goToDeleteClusterSetByAction(clusterSet)
    commonPageMethods.modal.confirmAction(clusterSet)

    if (!cancel) {
      cy.get(commonElementSelectors.elements.submit).click()
      getClusterSet(clusterSet).then((resp) => {
        expect(resp.status).to.be.eq(404)
      })
      cy.url().should('include', `/infrastructure/clusters/sets/details/${clusterSet}/overview`)
      cy.get(commonElementSelectors.elements.emptyContent)
        .should('exist')
        .contains(commonElementSelectors.elements.button, clusterSetOverviewSelector.elementText.backToClusterSet)
        .should('exist')
        .click()
      clusterSetPages.shouldLoad()
      cy.url().should('not.include', `details/${clusterSet}/overview`)
    } else {
      cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
        .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
        .click()
      getClusterSet(clusterSet).then((resp) => {
        expect(resp.status).to.be.eq(200)
      })
    }
  },

  checkGlobalClusterSet: (clusterSet) => {
    clusterSetOverviewPages.goToOverview(clusterSet)

    cy.get('.pf-c-page__main-nav > nav > .pf-c-nav__list > li').each((li) =>
      cy
        .get(li)
        .invoke('text')
        .then((txt) => {
          expect(txt).to.be.oneOf([
            clusterSetOverviewSelector.elementTab.overview,
            clusterSetOverviewSelector.elementTab.userManagement,
          ])
        })
    )
    cy.get('article[id="summary-status]').should('not.exist')
  },

  checkClusterSetActionByOption: (clusterSet) => {
    clusterSetOverviewPages.goToOverview(clusterSet)

    commonPageMethods.actionMenu.clickActionButton(clusterSet)
    if (clusterSet == 'global') {
      commonPageMethods.actionMenu.checkActionByOption(clusterSetOverviewSelector.actionText.editNamespaceBinding, true)
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetOverviewSelector.actionText.manageResourceAssignment,
        false
      )
      commonPageMethods.actionMenu.checkActionByOption(clusterSetOverviewSelector.actionText.deleteClusterSet, false)
    } else {
      commonPageMethods.actionMenu.checkActionByOption(clusterSetOverviewSelector.actionText.editNamespaceBinding, true)
      commonPageMethods.actionMenu.checkActionByOption(
        clusterSetOverviewSelector.actionText.manageResourceAssignment,
        true
      )
      commonPageMethods.actionMenu.checkActionByOption(clusterSetOverviewSelector.actionText.deleteClusterSet, true)
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
    clusterSetPages.goToClusterSetDetail(clusterSet)

    commonPageMethods.actionMenu.clickActionButton(clusterSet)
    switch (role) {
      case 'view':
        cy.get(clusterSetOverviewSelector.actions.editNamespaceBinding)
          .contains(clusterSetOverviewSelector.actionText.editNamespaceBinding)
          .and('have.class', commonElementSelectors.elements.disabledButton)
        if (clusterSet == 'global') {
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetOverviewSelector.actionText.manageResourceAssignment,
            false
          )
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetOverviewSelector.actionText.deleteClusterSet,
            false
          )
        } else {
          cy.get(clusterSetOverviewSelector.actions.manageResourceAssignment)
            .contains(clusterSetOverviewSelector.actionText.manageResourceAssignment)
            .and('have.class', commonElementSelectors.elements.disabledButton)
          cy.get(clusterSetOverviewSelector.actions.deleteClusterSet)
            .contains(clusterSetOverviewSelector.actionText.deleteClusterSet)
            .and('have.class', commonElementSelectors.elements.disabledButton)
        }
        break
      case 'bind':
        cy.get(clusterSetOverviewSelector.actions.editNamespaceBinding)
          .contains(clusterSetOverviewSelector.actionText.editNamespaceBinding)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        if (clusterSet == 'global') {
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetOverviewSelector.actionText.manageResourceAssignment,
            false
          )
          commonPageMethods.actionMenu.checkActionByOption(
            clusterSetOverviewSelector.actionText.deleteClusterSet,
            false
          )
        } else {
          cy.get(clusterSetOverviewSelector.actions.manageResourceAssignment)
            .contains(clusterSetOverviewSelector.actionText.manageResourceAssignment)
            .and('have.class', commonElementSelectors.elements.disabledButton)
          cy.get(clusterSetOverviewSelector.actions.deleteClusterSet)
            .contains(clusterSetOverviewSelector.actionText.deleteClusterSet)
            .and('have.class', commonElementSelectors.elements.disabledButton)
        }
        break
      case 'admin':
        cy.get(clusterSetOverviewSelector.actions.editNamespaceBinding)
          .contains(clusterSetOverviewSelector.actionText.editNamespaceBinding)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        cy.get(clusterSetOverviewSelector.actions.manageResourceAssignment)
          .contains(clusterSetOverviewSelector.actionText.manageResourceAssignment)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        cy.get(clusterSetOverviewSelector.actions.deleteClusterSet)
          .contains(clusterSetOverviewSelector.actionText.deleteClusterSet)
          .and('have.class', commonElementSelectors.elements.disabledButton)
        break
      default:
        cy.get(clusterSetOverviewSelector.actions.editNamespaceBinding)
          .contains(clusterSetOverviewSelector.actionText.editNamespaceBinding)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        cy.get(clusterSetOverviewSelector.actions.manageResourceAssignment)
          .contains(clusterSetOverviewSelector.actionText.manageResourceAssignment)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        cy.get(clusterSetOverviewSelector.actions.deleteClusterSet)
          .contains(clusterSetOverviewSelector.actionText.deleteClusterSet)
          .and('not.have.class', commonElementSelectors.elements.disabledButton)
        break
    }
  },
}
