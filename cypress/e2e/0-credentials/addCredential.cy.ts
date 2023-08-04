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
    // TODO: add api method for quick credential creation
    // Adding credential
    cy.createCredential('aws-credential.yaml')
    cy.visit('/multicloud/credentials')
    cy.get('button').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
    cy.location('href').should('include', '/credentials/create')
  })

  it('RHACM4K-567: CLC: Create AWS provider connections', { tags: ['aws', 'credentials'] }, async () => {
    cy.visit('/multicloud/credentials/create')

    // Select credential type
    cy.get('#aws').click()
    cy.get('#aws-standard').click()

    //
    cy.fixture(`credentials/aws-credential.yaml`, 'utf8').then(async (credential) => {
      const credentialObject: ProviderConnection = await load(credential)
      cy.log(JSON.stringify(credentialObject))

      // Basic information
      fillBasicInformation(credentialObject)
    })
  })
})
//
function fillBasicInformation(credentialObject: object) {}
