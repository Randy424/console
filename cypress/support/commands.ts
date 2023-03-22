//
// Command library

import 'cypress-wait-until'

Cypress.Commands.add('multiselect', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, text: string) => {
  cy.wrap(subject)
    .click()
    .get('.pf-c-check')
    .contains(text)
    .parent()
    .within(() => cy.get('[type="checkbox"]').check())
})

// Login
// cy.session & cacheAcrossSpecs option will preserve session cache (cookies) across specs
// 'local-user' is the session id for caching and restoring session
Cypress.Commands.add('login', (user?: string, password?: string) => {
  cy.session(
    user,
    () => {
      if (process.env.NODE_ENV === 'production' || password) {
        const baseUrl = Cypress.env('BASE_URL')
        const username = user || Cypress.env('OPTIONS_HUB_USER')
        const pass = password || Cypress.env('OPTIONS_HUB_PASSWORD')
        cy.exec(`oc login ${baseUrl} -u ${username} -p ${pass}`).then(() => {
          cy.exec('oc whoami -t').then((result) => {
            cy.setCookie('acm-access-token-cookie', result.stdout)
          })
        })
      } else {
        // simple auth for local development environments
        cy.exec('oc whoami -t').then((result) => {
          cy.setCookie('acm-access-token-cookie', result.stdout)
        })
      }
      cy.exec('curl --insecure https://localhost:3000', { timeout: 120000 })
    },
    { cacheAcrossSpecs: true }
  )
})

Cypress.Commands.add('createNamespace', (namespace: string) => {
  cy.exec(`oc create namespace ${namespace}`)
  cy.exec(`oc label namespaces ${namespace} cypress=true`)
})

Cypress.Commands.add('deleteNamespace', (namespace: string) => {
  cy.exec(`oc delete namespace ${namespace}`)
})

Cypress.Commands.add(
  'paste',
  {
    // @ts-ignore
    prevSubject: true,
    element: true,
  },
  ($element, text) => {
    const subString = text.substr(0, text.length - 1)
    const lastChar = text.slice(-1)

    $element.text(subString)
    $element.val(subString)
    cy.get($element)
      .type(lastChar)
      .then(() => {
        if ($element.val() !== text)
          // first usage only setStates the last character for some reason
          cy.get($element).clear().type(text)
      })
  }
)
