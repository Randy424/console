import { load } from 'js-yaml'

// Login
// cy.session & cacheAcrossSpecs option will preserve session cache (cookies) across specs
// 'local-user' is the session id for caching and restoring session
// TODO: error output for local-user who is not authenticated
Cypress.Commands.add('login', (user: string = 'kube:admin', password?: string) => {
  cy.session(
    user,
    () => {
      if (process.env.NODE_ENV === 'production' || password) {
        const apiUrl = Cypress.env('CLUSTER_API_URL')
        const username = user || Cypress.env('OPTIONS_HUB_USER')
        const pass = password || Cypress.env('OPTIONS_HUB_PASSWORD')
        cy.exec(`oc login ${apiUrl} -u ${username} -p ${pass}`).then(() => {
          cy.exec('oc whoami -t').then((result) => {
            cy.setCookie('acm-access-token-cookie', result.stdout)
            Cypress.env({ token: result.stdout })
          })
        })
      } else {
        // simple auth for local development environments
        cy.exec('oc whoami -t').then((result) => {
          cy.setCookie('acm-access-token-cookie', result.stdout)
        })
      }
    },
    { cacheAcrossSpecs: true }
  )
})

Cypress.Commands.add('clearCredentialsWithLabel', (label: string) => {
  cy.exec(`oc delete secrets -l "cluster.open-cluster-management.io/credentials"="" -l ${label}`)
})

Cypress.Commands.add('clearAllCredentials', () => {
  cy.exec('oc delete secrets -l "cluster.open-cluster-management.io/credentials"=""')
})

Cypress.Commands.add('clearAllManagedClusters', () => {
  cy.exec('oc delete managedClusters -l cypress-test-cluster=true')
})

Cypress.Commands.add('createCredential', (credentialFileName: string) => {
  cy.exec(`oc apply -f ./cypress/fixtures/credentials/${credentialFileName}`)
})

Cypress.Commands.add('typeToInputField', (selector: string, content: string) => {
  // It is unsafe to chain further commands that rely on the subject after .click().
  // Dividing operation into two commands
  cy.get(selector).click()
  cy.focused().type(content, { parseSpecialCharSequences: false })
})

Cypress.Commands.add('selectFromSelectField', (selector: string, targetSelectValue: string) => {
  cy.get(selector).click()
  cy.get('li').contains(targetSelectValue).click()
})