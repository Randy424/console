// Copyright Contributors to the Open Cluster Management project

import { elements, elementsText } from './selectors'

export const checkIfElementExists = (element) => {
  return cy
    .wait(1000)
    .get('body')
    .then(($body) => {
      return cy.wrap($body.text().includes(element))
    })
}

export const checkIfElementExistsInClass = (element, elementClass) => {
  return cy
    .wait(1000)
    .get(elementClass)
    .then(($body) => {
      return $body.text().includes(element)
    })
}

export const clickIfExist = (element) => {
  cy.get('body').then((body) => {
    if (body.find(element).length > 0) {
      cy.get(element).click()
    }
  })
}

/**
 * This functions accepts Div id of the group that contains the dropdown, value to be selected from dropdown.
 * If you want to type text in input dropdown then pass typeText = true
 * @param {*} divId
 * @param {*} valueToBeSelected
 * @param {*} typeText
 */
export const selectOrTypeInInputDropDown = (divId, valueToBeSelected, typeText?: boolean) => {
  cy.get(divId).find(elements.input).click()
  if (typeText) {
    cy.get(divId).find(elements.input).type(valueToBeSelected).type('{enter}')
  } else {
    cy.contains(elements.selectMenuItem, valueToBeSelected).click()
  }
}

/**
 * This function accepts text to verify if a page is empty or not
 * for eg you can pass "You don't have any credentials." to verify that there are no credentians on credentials page
 * @param {*} emptyText
 */
export const isEmptyPage = (emptyText) => {
  cy.get('.pf-c-page__main-section').then(($body) => {
    if ($body.text().includes(emptyText)) {
      cy.log('No value found hence, returning true')
      return true
    } else {
      cy.log('value present hence, returning false')
      return false
    }
  })
}

export const clickNext = () => {
  cy.contains(elements.button, elementsText.next).click()
}

export const clickSave = () => {
  cy.get('.pf-m-primary').contains(elements.button, elementsText.save).click({ force: true })
}

export const clickAdd = () => {
  cy.contains(elements.button, elementsText.add).click()
}

export const clickSubmit = () => {
  cy.get('button[type="submit"]', { timeout: 2000 }).click()
}

export const clickCreateCluster = () => {
  cy.get('.pf-m-primary').contains(elements.button, elementsText.create).click({ force: true })
}

export const clickInstallCluster = () => {
  cy.get('.pf-m-primary').contains(elements.button, elementsText.InstallCluster).click({ force: true })
}

export const compareDropdownValues = (listId, valuesToBeCompared) => {
  cy.get(listId)
    .find('li')
    .each((item, index) => {
      cy.wrap(item).should('contain.text', valuesToBeCompared[index])
    })
}

export const shouldNotExistInDropdownValues = (listId, valuesToBeCompared) => {
  cy.get(listId)
    .find('li')
    .each((item, index) => {
      cy.wrap(item).should('not.contain.text', valuesToBeCompared[index])
    })
}

/**
 * This method accepts text or id of the element and clicks on that element
 * @param {*} textOrId
 */
export const clickButton = (textOrId) => {
  cy.contains('button', textOrId).click()
}

export const recurse = (commandFn, checkFn, limit = 10, interval = 30 * 1000) => {
  if (limit < 0) {
    throw new Error('Recursion limit reached')
  }
  cy.log(`**${commandFn}** remaining attempts **${limit}**`)
  return commandFn().then((x) => {
    if (checkFn(x)) {
      cy.log(`**${commandFn}** completed`)
      return
    }
    cy.wait(interval)
    recurse(commandFn, checkFn, limit - 1, interval)
  })
}
