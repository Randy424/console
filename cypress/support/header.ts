/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress"/>

import { elements } from './selectors'
import { resourceTable } from './action-utils/component-methods/ResourceTable'
import { credentialsPages } from './action-utils/credentials-actions'
import { checkIfElementExists } from './genericFunctions'

export const acmHeaderSelectors = {
  mainHeader: '.pf-c-page__header',
  leftNavigation: {
    hamburbgerButton: "button[aria-label='Global navigation']",
    leftSideBar: '#page-sidebar',
    leftSideBarNav: 'nav[aria-label="Global"]',
    leftSideBarNavList: 'nav[aria-label="Global"] ui',
    listItemsText: {
      credentials: 'Credentials',
      infrastructure: 'Infrastructure',
      infrastructureText: {
        clusters: 'Clusters',
        automation: 'Automation',
        hostInventory: 'Host inventory',
      },
    },
  },
  headerTools: {
    userDropdown: 'nav button[aria-label="User menu"]',
    text: {
      logout: 'Log out',
    },
  },
}

export const acm23xheaderMethods = {
  // left navigation methods
  openMenu: () => {
    cy.get('body').then((body) => {
      if (body.find('#guided-tour-modal').length > 0) {
        cy.get('#guided-tour-modal').within(() => {
          cy.get('button[aria-label="Close"]').click()
        })
      }
      if (body.text().includes('Managing clusters just got easier')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })

    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar).should('exist').and('be.visible')
    cy.get('.oc-nav-header > .pf-c-dropdown > button > .pf-c-dropdown__toggle-text')
      .first()
      .invoke('text')
      .then((txt) => {
        if (txt != 'All Clusters') {
          cy.get('.oc-nav-header > .pf-c-dropdown > button')
            .first()
            .click()
            .then(() => {
              cy.get('.pf-c-dropdown__menu').should('exist').contains('All Clusters').click()
            })
        }
      })
  },

  expandInfrastructure: () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500)
      .contains(elements.button, acmHeaderSelectors.leftNavigation.listItemsText.infrastructure)
      .then(($expand) => {
        if ($expand.attr('aria-expanded') == 'false') {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1500)
            .contains(elements.button, acmHeaderSelectors.leftNavigation.listItemsText.infrastructure)
            .click({ timeout: 20000 })
          cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters, {
            timeout: 5000,
          }).should('exist')
        }
      })
  },

  goToClusters: () => {
    process.env.NODE_ENV === 'production' && acm23xheaderMethods.openMenu()
    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar, { timeout: 20000 }).should('exist')

    acm23xheaderMethods.expandInfrastructure()
    cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters, {
      timeout: 5000,
    })
      .should('exist')
      .click()
    cy.get('body').then((body) => {
      if (body.text().includes('Managing clusters just got easier')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })
    cy.get(elements.pageMenu, { timeout: 50000 }).then(($body) => {
      if ($body.text().includes("You don't have any clusters")) {
        resourceTable.buttonShouldClickable('Create cluster', 'a')
        resourceTable.buttonShouldClickable('Import cluster', 'a')
        cy.get('a')
          .contains('Create cluster', { timeout: 20000 })
          .should('exist')
          .and('not.have.class', elements.disabledButton)
        cy.get('a')
          .contains('Import cluster', { timeout: 20000 })
          .should('exist')
          .and('not.have.class', elements.disabledButton)
      } else {
        resourceTable.buttonShouldClickable('#createCluster')
        resourceTable.buttonShouldClickable('#importCluster')
        cy.get('#createCluster', { timeout: 20000 }).should('exist').and('not.have.class', elements.disabledButton)
        cy.get('#importCluster', { timeout: 20000 }).should('exist').and('not.have.class', elements.disabledButton)
      }
    })
  },

  goToClustersWithUser: () => {
    acm23xheaderMethods.openMenu()
    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar, { timeout: 20000 }).should('exist')

    acm23xheaderMethods.expandInfrastructure()
    cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters, {
      timeout: 5000,
    })
      .should('exist')
      .click()
    cy.get('body').then((body) => {
      if (body.text().includes('Managing clusters just got easier')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })
    cy.get(elements.pageMenu, { timeout: 50000 }).then(($body) => {
      if ($body.text().includes("You don't have any clusters")) {
        cy.get('a')
          .contains('Create cluster', { timeout: 20000 })
          .should('exist')
          .and('have.class', 'pf-c-button pf-m-primary pf-m-aria-disabled')
        cy.get('a')
          .contains('Import cluster', { timeout: 20000 })
          .should('exist')
          .and('have.class', 'pf-c-button pf-m-primary pf-m-aria-disabled')
      } else {
        cy.get('#createCluster', { timeout: 20000 })
          .should('exist')
          .and('have.class', 'pf-c-button pf-m-primary pf-m-aria-disabled')
        cy.get('#importCluster', { timeout: 20000 })
          .should('exist')
          .and('have.class', 'pf-c-button pf-m-secondary pf-m-aria-disabled')
      }
    })
  },

  goToAutomationPage: () => {
    acm23xheaderMethods.openMenu()
    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar, { timeout: 20000 }).should('exist')
    acm23xheaderMethods.expandInfrastructure()
    cy.get('body').then((body) => {
      if (body.text().includes('Managing clusters just got easier')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })
    cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.automation, {
      timeout: 5000,
    })
      .should('exist')
      .click()
  },

  goToInfrastructureEnvironmentPage: () => {
    acm23xheaderMethods.openMenu()
    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar, { timeout: 20000 }).should('exist')
    acm23xheaderMethods.expandInfrastructure()
    cy.get('body').then((body) => {
      if (body.text().includes('Managing clusters just got easier')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })
    cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.hostInventory, {
      timeout: 5000,
    })
      .should('exist')
      .click()
  },

  shouldLoad: () => {
    cy.get(elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.credentials
    )
    cy.url().should('include', '/credentials', { timeout: 10000 })
    cy.get('.pf-c-spinner', { timeout: 20000 }).should('not.exist')
  },

  goToCredentials: () => {
    process.env.NODE_ENV === 'production' && acm23xheaderMethods.openMenu()
    cy.get(acmHeaderSelectors.leftNavigation.leftSideBar, { timeout: 20000 }).should('exist')
    cy.get('body').then((body) => {
      if (body.text().includes('Managing clusters')) {
        cy.get('button[aria-label="Close"]').click()
      }
    })
    checkIfElementExists('Add credential').then((onCredentials) => {
      if (!onCredentials) {
        cy.contains(elements.a, acmHeaderSelectors.leftNavigation.listItemsText.credentials).should('exist').click()
        acm23xheaderMethods.shouldLoad()
      } else {
        cy.log('Already on credentials page!')
      }
    })
  },
}
