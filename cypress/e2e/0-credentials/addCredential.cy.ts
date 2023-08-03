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

  it('RHACM4K-567: CLC: Create AWS provider connections', { tags: ['aws', 'credentials'] }, () => {
    cy.visit('/multicloud/credentials/create')

    // Select credential type
    cy.get('#aws').click()
    cy.get('#aws-standard').click()

    // Basic information
    fillBasicInformation('aws-credential.yaml')
    //
  })
})
//
function fillBasicInformation(credentialFileName: string) {
  const credentialObject = cy.parseCredential('aws-credential.yml')
  console.log(credentialObject)
}
