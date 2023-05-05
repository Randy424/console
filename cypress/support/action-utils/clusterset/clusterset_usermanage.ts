/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'
import * as genericFunctions from '../../genericFunctions'
import { acmHeaderSelectors } from '../../header'

import { clusterSetOverviewPages, clusterSetOverviewSelector } from './clusterset_overview'

/**
 * This object contais the group of selector that are part of user management
 */
export const userManagementSelectors = {
  elementTab: {
    userManagement: 'User management',
  },
  elementText: {
    addUserOrGroup: 'Add user or group',
  },
  emptyPage: {
    addUserOrGroupButton: 'button[text="Add user or group"]',
    emptyMsg: "This cluster set doesn't have any users or groups, yet. Click Add user or group to add a user or group.",
    emptyTitle: 'No users or groups found',
  },
  button: {
    addUserOrGroup: 'button[id="addUserGroup"]',
    users: 'button[id="user"]',
    groups: 'button[id="group"]',
  },
  tableColumnFields: {
    name: '[data-label="Name"]',
    displayRole: '[data-label="Display role"]',
    clusterRole: '[data-label="Cluster role"]',
    type: '[data-label="Type"]',
  },
  tableRowOptionsMenu: {
    action: 'button[aria-label="Actions"]',
    remove: 'button[text="Remove"]',
  },
  addUserGroupDialog: {
    title: 'Add user or group',
    users: 'button[id="user"]',
    groups: 'button[id="group"]',
    roles: 'ul[id="role"]',
    roleLabel: '#role-label',
  },
  clusterSetRole: {
    admin: 'Cluster set admin',
    bind: 'Cluster set bind',
    view: 'Cluster set view',
  },
}

/**
 * This object contais the group of pages that are part of clusterSet user management
 */
export const userManagementPages = {
  shouldLoad: (clusterSet) => {
    cy.get(commonElementSelectors.elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', `/infrastructure/clusters/sets/details/${clusterSet}/access`, { timeout: 10000 })
    cy.get(commonElementSelectors.elements.button, { timeout: 10000 }).should(
      'contain',
      userManagementSelectors.elementText.addUserOrGroup
    )
  },

  gotoAddUser: () => {
    cy.contains(commonElementSelectors.elements.button, userManagementSelectors.elementText.addUserOrGroup, {
      timeout: 2000,
    }).click()
    commonPageMethods.modal.shouldBeOpen()
  },
}

/**
 * This object contais the group of methods that are part of clusterSet user management
 */
export const userManagementMethods = {
  addUser: (userName, role) => {
    genericFunctions.selectOrTypeInInputDropDown(userManagementSelectors.addUserGroupDialog.roleLabel, userName)
    cy.get(userManagementSelectors.addUserGroupDialog.roleLabel)
      .parents()
      .next()
      .find(commonElementSelectors.elements.button)
      .click()
      .then(() => cy.contains(commonElementSelectors.elements.selectMenuItem, role).click())
    cy.get(commonElementSelectors.elements.submit).click()
  },

  removeUser: () => {
    cy.get(userManagementSelectors.tableRowOptionsMenu.action).click()
    cy.get(commonElementSelectors.elements.dropDownMenuItem, { timeout: 2000 })
      .should('contain', commonElementSelectors.elementsText.remove)
      .click({ timeout: 10000 })
    cy.get(commonElementSelectors.elements.submit, { timeout: 2000 }).click()
  },

  addUserRoleToClusterSet: (clusterSet, userName, role) => {
    clusterSetOverviewPages.goToUserManagement(clusterSet)
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if ($body.text().includes(userManagementSelectors.emptyPage.emptyTitle)) {
        // no users or groups exists, add user or group directly
        userManagementPages.gotoAddUser(clusterSet)
        userManagementMethods.addUser(userName, role)
      } else {
        commonPageMethods.resourceTable.searchTable(userName)
        cy.get(userManagementSelectors.tableColumnFields.name, { timeout: 2000 }).then(($body) => {
          if (!$body.text().includes(userName)) {
            userManagementPages.gotoAddUser(clusterSet)
            userManagementMethods.addUser(userName, role)
          }
        })
      }
    })
  },

  removeUserRoleFromClusterSet: (clusterSet, userName, role) => {
    clusterSetOverviewPages.goToUserManagement(clusterSet)
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (!$body.text().includes(userManagementSelectors.emptyPage.emptyTitle)) {
        commonPageMethods.resourceTable.searchTable(role)
        cy.get(userManagementSelectors.tableColumnFields.name, { timeout: 2000 }).then(($body) => {
          if ($body.text().includes(userName)) {
            userManagementMethods.removeUser()
          }
        })
      }
    })
  },

  checkUserRoleFromClusterSet: (clusterSet, userName, role) => {
    clusterSetOverviewPages.goToUserManagement(clusterSet)
    commonPageMethods.resourceTable.searchTable(userName)
    cy.get(userManagementSelectors.tableColumnFields.name, { timeout: 2000 }).contains(userName)
    cy.get(userManagementSelectors.tableColumnFields.displayRole).contains(role)
  },

  checkRoleInAddUser: (clusterSet) => {
    clusterSetOverviewPages.goToUserManagement(clusterSet)
    userManagementPages.gotoAddUser(clusterSet)

    // check the role list when select the users
    cy.get(userManagementSelectors.addUserGroupDialog.users).click()
    cy.get(userManagementSelectors.addUserGroupDialog.roleLabel)
      .parents()
      .next()
      .find(commonElementSelectors.elements.button)
      .click()
      .then(() => {
        if (clusterSet == 'global') {
          cy.get(commonElementSelectors.elements.selectMenuItem)
            .should('contain', userManagementSelectors.clusterSetRole.bind)
            .should('contain', userManagementSelectors.clusterSetRole.view)
            .should('not.contain', userManagementSelectors.clusterSetRole.admin)
        } else {
          cy.get(commonElementSelectors.elements.selectMenuItem)
            .should('contain', userManagementSelectors.clusterSetRole.bind)
            .should('contain', userManagementSelectors.clusterSetRole.view)
            .should('contain', userManagementSelectors.clusterSetRole.admin)
        }
      })

    // check the role list when select the groups
    cy.get(userManagementSelectors.addUserGroupDialog.groups).click()
    cy.get(userManagementSelectors.addUserGroupDialog.roleLabel)
      .parents()
      .next()
      .find(commonElementSelectors.elements.button)
      .click()
      .then(() => {
        if (clusterSet == 'global') {
          cy.get(commonElementSelectors.elements.selectMenuItem)
            .should('contain', userManagementSelectors.clusterSetRole.bind)
            .should('contain', userManagementSelectors.clusterSetRole.view)
            .should('not.contain', userManagementSelectors.clusterSetRole.admin)
        } else {
          cy.get(commonElementSelectors.elements.selectMenuItem)
            .should('contain', userManagementSelectors.clusterSetRole.bind)
            .should('contain', userManagementSelectors.clusterSetRole.view)
            .should('contain', userManagementSelectors.clusterSetRole.admin)
        }
      })

    cy.get(userManagementSelectors.addUserGroupDialog.roleLabel)
      .parents()
      .next()
      .find(commonElementSelectors.elements.button)
      .first()
      .click()

    cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
      .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
      .click()
  },

  checkUserManagementByUser: (role) => {
    cy.get(commonElementSelectors.elements.pageNavLink, { timeout: 2000 })
      .filter(':contains("' + clusterSetOverviewSelector.elementTab.userManagement + '")')
      .click()
    switch (role) {
      case 'view':
      case 'bind':
      case 'admin':
        cy.wait(2000)
          .get(commonElementSelectors.elements.title)
          .should('contain', commonElementSelectors.elementsText.forbindden)
        cy.get(commonElementSelectors.elements.emptyBody).contains(commonElementSelectors.elementsText.forbiddenMsg)
        break
      case 'cluster-manager-admin':
      default:
        cy.wait(500)
          .contains(commonElementSelectors.elements.button, userManagementSelectors.elementText.addUserOrGroup)
          .click()
        commonPageMethods.modal.shouldBeOpen()
        cy.get(userManagementSelectors.addUserGroupDialog.roleLabel)
          .find(commonElementSelectors.elements.input)
          .click()
          .then(() =>
            cy
              .get(userManagementSelectors.addUserGroupDialog.roles, { timeout: 20000 })
              .contains(commonElementSelectors.elementsText.noResult)
          )
        cy.get(commonElementSelectors.elements.dialog, { withinSubject: null })
          .contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.cancel)
          .click({ timeout: 20000 })
        break
    }
  },
}
