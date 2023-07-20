describe('example to-do app', () => {
  beforeEach(() => {
    cy.clearAllCredentials()
  })
  // TODO: add tags
  it('CLC: Traverse to create credential page from empty state', () => {
    cy.visit('/multicloud/credentials')
    cy.get('button').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
  })

  it('CLC: Traverse to create credential page from populated credential page', () => {
    // TODO: add api method for quick credential creation
    // Adding credential
    cy.visit('/multicloud/credentials')
    cy.get('button').contains('Add credential').should('have.attr', 'aria-disabled', 'false').click()
  })

  it('RHACM4K-567: CLC: Create AWS provider connections', { tags: ['aws', 'credentials'] }, () => {})
})
