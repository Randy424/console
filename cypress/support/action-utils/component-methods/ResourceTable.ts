/* Copyright Contributors to the Open Cluster Management project */

import { elements as selectors } from '../../selectors'

export const resourceTable = {
  shouldExist: () => cy.get(selectors.table, { timeout: 20000 }).should('exist'),
  shouldNotExist: () => cy.get(selectors.table, { timeout: 20000 }).should('not.exist'),
  rowShouldExist: function (name) {
    this.searchTable(name)
    cy.get(`tr > td a`, { timeout: 30000 }).contains(name, { timeout: 30000 }).should('exist')
  },
  rowShouldNotExist: function (name, timeout, disableSearch) {
    !disableSearch && this.searchTable(name)
    cy.get(`tr[data-ouia-component-id="${name}"]`, { timeout: timeout || 30000 }).should('not.exist')
  },
  getRowByIndex: function (rowIndex) {
    return cy.get(selectors.table, { timeout: 1000 }).find(selectors.tr).eq(rowIndex)
  },
  checkIfRowExistsByName: function (name) {
    this.searchTable(name)
    return cy
      .wait(500)
      .get(selectors.table)
      .then(($table) => {
        return cy.wrap($table.text().includes(name))
      })
  },
  openRowMenu: (name) => {
    cy.log(name)
    cy.get(`#${name}-actions`).click()
    cy.wait(1500).get('div[triggerclassname="overflow-permission-tooltip"]', { timeout: 2000 }).should('not.exist')
  },
  clickInfraEnvActionButton: () => {
    cy.get(selectors.button).contains('Actions').click({ force: true })
  },
  menuClickEdit: () => cy.get('button[data-table-action="table.actions.connection.edit"]').click(),
  menuClickEditLabels: () => cy.get('button[data-table-action="table.actions.cluster.edit.labels"]').click(),
  menuClickDelete: () => cy.get('button[data-table-action="table.actions.connection.delete"]').click(),
  menuClickDeleteType: (type) => cy.get(`button[data-table-action="table.actions.${type}.delete"]`).click(),
  menuClickDestroy: () => cy.get('button[data-table-action="table.actions.cluster.destroy"]').click(),
  menuClickDetach: () => cy.get('button[data-table-action="table.actions.cluster.detach"]').click(),
  clearSearch: () => cy.get(selectors.pageSearch, { timeout: 10 * 1000 }).clear(),
  searchTable: (name) => {
    resourceTable.clearSearch()
    cy.get(selectors.pageSearch).type(name)
    // TODO, will update belows to check the first row for the correct search result
    cy.wait(2 * 1000)
  },
  rowShouldToggle: function (name) {
    cy.get('#pf-c-page').then((page) => {
      if (page.find(selectors.pageSearch, { timeout: 15000 }).length > 0) {
        cy.get(selectors.pageSearch).clear({ force: true })
        cy.get(selectors.pageSearch).type(name)
      }
    })
    cy.get(`tr[data-row-name="${name}"]`).get('input[name="tableSelectRow"]').click({ force: true })
  },
  rowCount: () =>
    cy.get('table', { timeout: 30 * 1000 }).then(($table) => {
      return $table.find('tbody').find('tr').length
    }),
  rowExist: (name) => cy.get(`tr[data-ouia-component-id="${name}"]`).should('exist'),
  rowValue: (name, colume, value, span) => {
    if (span)
      cy.get(`tr[data-ouia-component-id="${name}"] td[data-label="${colume}"] > span`)
        .contains(`${value}`)
        .should('exist')
    else cy.get(`tr[data-ouia-component-id="${name}"] td[data-label="${colume}"]`).contains(`${value}`).should('exist')
  },
  buttonShouldClickable: (text, href?) => {
    if (href) {
      cy.waitUntil(
        () => {
          return cy
            .get('a')
            .contains(text, { timeout: 20000 })
            .then(($button) => {
              return $button.attr('aria-disabled') == 'false'
            })
        },
        {
          errorMsg: 'wait for hyperlink to be clickable',
          interval: 4 * 1000, // check every 4s
          timeout: 60 * 1000, // wait for 60s
        }
      )
    } else {
      cy.waitUntil(
        () => {
          return cy.get(text).then(($button) => {
            return $button.attr('aria-disabled') == 'false'
          })
        },
        {
          errorMsg: 'wait for button to be clickable',
          interval: 4 * 1000, // check every 4s
          timeout: 60 * 1000, // wait for 60s
        }
      )
    }
  },
}

export const actionMenu = {
  checkActionByOption: (action, exists) => {
    if (exists) cy.get(selectors.dropDownMenu).should('contain', action)
    else cy.get(selectors.dropDownMenu).should('not.contain', action)
  },
  clickActionByOption: (name) => {
    resourceTable.buttonShouldClickable(name, selectors.a)
    cy.contains(selectors.a, name).click({ timeout: 20000 })
  },
  clickActionButton: (name) => {
    cy.get(`button[id="${name}-actions"]`).click()
  },
}

export const modal = {
  getDialogElement: () => {
    return cy.get(selectors.dialog, { withinSubject: null })
  },
  shouldBeOpen: () => cy.get(selectors.dialog, { withinSubject: null }).should('exist'),
  shouldBeClosed: () => cy.get('.pf-c-modal-box pf-m-warning pf-m-md', { withinSubject: null }).should('not.exist'),
  clickDanger: (text) => cy.get(selectors.dialog, { withinSubject: null }).contains('button', text).click(),
  clickPrimary: () =>
    cy.get(selectors.dialog, { withinSubject: null }).contains('button', 'Cancel').click({ timeout: 20000 }),
  clickSecondaryClose: () => cy.get('button[aria-label="Close"]', { withinSubject: null }).click(),
  confirmAction: (text) => cy.get('#confirm', { withinSubject: null }).type(text),
}

export const notification = {
  shouldExist: (type) => cy.get(`.pf-c-alert.pf-m-${type}`, { timeout: 40 * 1000 }).should('exist'),
  shouldSuccess: () => cy.contains('.pf-c-alert__title', 'Success').should('be.visible'),
}

export function waitforDialogClosed() {
  cy.waitUntil(
    () => {
      return cy.get('body').then((body) => {
        console.log('The length of dialog is:', body.find(selectors.dialog).length)
        return body.find(selectors.dialog).length <= 1
      })
    },
    {
      errorMsg: 'wait for dialog closed',
      interval: 500,
      timeout: 5000,
    }
  )
}
