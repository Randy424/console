import { load } from 'js-yaml'
import { ProviderConnection } from '../../resources/provider-connection'
describe('example to-do app', () => {
  beforeEach(() => {
    cy.clearAllCredentials()
  })
  // TODO: VALIDATE THAT THE NECESSARY FIXTURES ARE PRESENT

  // TODO: add tags
  it('CLC: Traverse to create credential page from empty state credential page', () => {
    cy.visit('/multicloud/credentials')
    cy.get('a').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
    cy.location('href').should('include', '/credentials/create')
  })

  it('CLC: Traverse to create credential page from populated credential page', () => {
    // Adding credential via api call
    cy.createCredential('aws-credential.yaml')

    cy.visit('/multicloud/credentials')
    cy.get('button').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
    cy.location('href').should('include', '/credentials/create')
  })

  // TODO: finish this test
  it('CLC: Create provider connection using Editor input', { tags: ['aws', 'credentials'] }, async () => {
    cy.visit('/multicloud/credentials/create')
    cy.get('a').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
    // Select credential type
    cy.get('article').contains('Amazon Web Services').click()
    cy.get('article').contains('Red Hat OpenShift Provisioning').click()

    // get credential fixture cypress/fixtures/credentials/aws-credential.yaml
    cy.readFile('cypress/fixtures/credentials/aws-credential.yaml').then((str) => {
      const awsCred = load(str)
      cy.log('checking parsed cred: ', awsCred['metadata'])

      cy.get('span').contains('YAML').click()
      cy.get('div.monaco-scrollable-element').click()
      cy.focused().clear()

      cy.focused().type(JSON.stringify(awsCred))
    })
  })

  it('RHACM4K-567: CLC: Create AWS provider connections', { tags: ['aws', 'credentials'] }, async () => {
    // move directly to creation page
    cy.visit('/multicloud/credentials/create')

    // Select credential type
    cy.get('article').contains('Amazon Web Services').click()
    cy.get('article').contains('Red Hat OpenShift Provisioning').click()

    // get credential fixture
    cy.readFile('./cypress/fixtures/credentials/aws-credential.yaml').then((str) => {
      const awsCred = load(str) as ProviderConnection

      // Basic information
      fillBasicInformation(awsCred)
      cy.get('button').contains('next')

      // AWS keys
      cy.typeToInputField('#aws_access_key_id', awsCred.stringData.aws_access_key_id)
      cy.typeToInputField('#aws_secret_access_key', awsCred.stringData.aws_access_key_id)
      cy.get('button').contains('next')

      // Proxy (skip proxy)
      cy.get('button').contains('next')

      // Pull Secret
      fillPullSecrets(awsCred)
      cy.get('button').contains('next')

      // Summary page
    })
  })
})
//
function fillBasicInformation(credentialObject: ProviderConnection) {
  cy.typeToInputField('#credentialsName', credentialObject.metadata.name)
  cy.selectFromSelectField('#namespaceName-form-group', credentialObject.metadata.namespace)
  cy.typeToInputField('#baseDomain', credentialObject.stringData.baseDomain)
}
function fillPullSecrets(credentialObject: ProviderConnection) {
  cy.typeToInputField('#pullSecret', credentialObject.stringData.pullSecret)
  cy.typeToInputField('#ssh-privatekey', credentialObject.stringData['ssh-privatekey'])
  cy.typeToInputField('#ssh-publickey', credentialObject.stringData['ssh-publickey'])
}
