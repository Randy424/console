import * as yaml from 'js-yaml'
describe('Credential creation page', () => {
  beforeEach(() => {
    cy.clearAllCredentials()
  })
  // TODO: add tags
  // it('CLC: Traverse to create credential page from empty state', () => {
  //   cy.visit('/multicloud/credentials')
  //   cy.get('a').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
  //   cy.url().should('include', '/credentials/create')
  // })

  // it('CLC: Traverse to create credential page from populated credential page', () => {
  //   // Adding credential
  //   cy.visit('/multicloud/credentials')
  //   cy.createCredential('aws-credential.yaml')
  //   cy.get('button').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
  //   cy.url().should('include', '/credentials/create')
  // })

  it('RHACM4K-567: CLC: Create AWS provider connections', { tags: ['aws', 'credentials'] }, () => {
    cy.visit('/multicloud/credentials')
    cy.get('a').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
    // credential type
    cy.get('article').contains('Amazon Web Services').click()
    cy.get('article').contains('Red Hat OpenShift Provisioning').click()

    // get credential fixture cypress/fixtures/credentials/aws-credential.yaml
    cy.readFile('cypress/fixtures/credentials/aws-credential.yaml').then((str) => {
      const awsCred = yaml.loadAll(str)
      cy.log('checking parsed cred: ', awsCred[0]['metadata'])

      cy.get('span').contains('YAML').click()
      cy.get('div.monaco-scrollable-element').click()
      cy.focused().clear()

      cy.focused().type(JSON.stringify(awsCred[0]))
    })
  })
})

function fillBasicCredentialInformation() {}
