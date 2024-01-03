import { dump, load, loadAll } from 'js-yaml'
import { ProviderConnection, ServicePrinciple } from '../../resources/provider-connection'
const fs = require('fs')
/* 
    Note: This test will create credentials via API + fixtures, then delete them within various test cases.
    This way the spec can run as a standalone e2e test
*/

function createCredential(credentialName: string) {
  const allCredentials = loadAll(this.credentials) as ProviderConnection[]
  const serializedAwsCred = dump(allCredentials.find((credential) => credential.metadata.name === credentialName))
  cy.task('createFile', { path: `${credentialName}.yaml`, data: serializedAwsCred }).then(() => {
    cy.exec(`oc apply -f ${credentialName}.yaml`)
    cy.exec(`rm ${credentialName}.yaml`)
  })
}

describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    beforeEach(() => {
      cy.readFile('cypress/fixtures/credentials/credentials.yaml').as('credentials')
      cy.visit('/multicloud/credentials')
    })
    after(() => {
      cy.clearAllCredentials()
    })

    it(
      `CLC: Credentials - Delete the AWS provider credential with row action kebab menu`,
      { tags: [, 'credentials'] },
      function () {
        createCredential.call(this, 'aws-connection')
        cy.get('tr > td a').contains('aws-connection').should('exist')

        cy.get('#aws-connection-actions').click()
        cy.get('li').contains('Delete credential').should('have.attr', 'aria-disabled', 'false').click()

        cy.get('button').contains('Delete').click()
        cy.get('#aws-connection-actions').should('not.exist')
      }
    )

    it(
      `CLC: Credentials - Delete the AWS provider credential with bulk action menu`,
      { tags: [, 'credentials'] },
      function () {
        createCredential.call(this, 'aws-connection')
        cy.get('tr > td a').contains('aws-connection').should('exist')

        cy.get('tr > td a')
          .contains('aws-connection')
          .parent()
          .parent()
          .prev()
          .find('input')
          .check()
          .should('be.checked')

        cy.get('#toggle-id').click()
        cy.get('li').contains('Delete credentials').should('have.attr', 'aria-disabled', 'false').click()
        cy.get('button').contains('Delete').click()
        cy.get('#aws-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-7901: CLC: Credentials - Delete the AWS provider credentials`,
      { tags: ['aws', 'credentials', '@post-release'] },
      function () {
        createCredential.call(this, 'aws-connection')
        cy.get('tr > td a').contains('aws-connection').should('exist')

        cy.get('#aws-connection-actions').click()
        cy.get('li').contains('Delete credential').should('have.attr', 'aria-disabled', 'false').click()

        cy.get('button').contains('Delete').click()
        cy.get('#aws-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-7902: CLC: Credentials - Delete the GCP provider credentials`,
      { tags: ['gcp', 'credentials', '@post-release', '@ocpInterop'] },
      function () {
        createCredential.call(this, 'gcp-connection')

        cy.get('tr > td a').contains('gcp-connection').should('exist')

        cy.get('tr > td a')
          .contains('gcp-connection')
          .parent()
          .parent()
          .prev()
          .find('input')
          .check()
          .should('be.checked')

        cy.get('#toggle-id').click()
        cy.get('li').contains('Delete credentials').should('have.attr', 'aria-disabled', 'false').click()
        cy.get('button').contains('Delete').click()
        cy.get('#gcp-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-7900: CLC: Credentials - Delete the Azure provider credentials`,
      { tags: ['azure', 'credentials', '@post-release'] },
      function () {
        createCredential.call(this, 'azure-connection')
        cy.get('tr > td a').contains('azure-connection').should('exist')

        cy.get('#azure-connection-actions').click()
        cy.get('li').contains('Delete credential').should('have.attr', 'aria-disabled', 'false').click()

        cy.get('button').contains('Delete').click()
        cy.get('#azure-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-7899: CLC: Credentials - Delete the VMware provider credentials`,
      { tags: ['vmware', 'credentials'] },
      function () {
        createCredential.call(this, 'vsphere-connection')

        cy.get('tr > td a').contains('vsphere-connection').should('exist')

        cy.get('tr > td a')
          .contains('vsphere-connection')
          .parent()
          .parent()
          .prev()
          .find('input')
          .check()
          .should('be.checked')

        cy.get('#toggle-id').click()
        cy.get('li').contains('Delete credentials').should('have.attr', 'aria-disabled', 'false').click()
        cy.get('button').contains('Delete').click()
        cy.get('#vsphere-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-7903: CLC: Credentials - Delete the ansible provider credentials`,
      { tags: ['ansible', 'credentials'] },
      function () {
        createCredential.call(this, 'ansible-connection')
        cy.get('tr > td a').contains('ansible-connection').should('exist')

        cy.get('#ansible-connection-actions').click()
        cy.get('li').contains('Delete credential').should('have.attr', 'aria-disabled', 'false').click()

        cy.get('button').contains('Delete').click()
        cy.get('#ansible-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-8107: CLC: Credentials - Delete the Azure Government provider credentials`,
      { tags: ['azgov', 'credentials'] },
      function () {
        createCredential.call(this, 'azure-gov-connection')

        cy.get('tr > td a').contains('azure-gov-connection').should('exist')

        cy.get('tr > td a')
          .contains('azure-gov-connection')
          .parent()
          .parent()
          .prev()
          .find('input')
          .check()
          .should('be.checked')

        cy.get('#toggle-id').click()
        cy.get('li').contains('Delete credentials').should('have.attr', 'aria-disabled', 'false').click()
        cy.get('button').contains('Delete').click()
        cy.get('#azure-gov-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-8127: CLC: Credentials - Delete the Red Hat OpenStack Platform provider credentials`,
      { tags: ['openstack', 'credentials'] },
      function () {
        createCredential.call(this, 'open-stack-connection')
        cy.get('tr > td a').contains('open-stack-connection').should('exist')

        cy.get('#open-stack-connection-actions').click()
        cy.get('li').contains('Delete credential').should('have.attr', 'aria-disabled', 'false').click()

        cy.get('button').contains('Delete').click()
        cy.get('#open-stack-connection-actions').should('not.exist')
      }
    )

    it(
      `RHACM4K-13214: CLC: Credentials - Delete a Red Hat Virtualization credential`,
      { tags: ['rhv', 'credentials'] },
      function () {
        createCredential.call(this, 'rhv-connection')

        cy.get('tr > td a').contains('rhv-connection').should('exist')

        cy.get('tr > td a')
          .contains('rhv-connection')
          .parent()
          .parent()
          .prev()
          .find('input')
          .check()
          .should('be.checked')

        cy.get('#toggle-id').click()
        cy.get('li').contains('Delete credentials').should('have.attr', 'aria-disabled', 'false').click()
        cy.get('button').contains('Delete').click()
        cy.get('#rhv-connection-actions').should('not.exist')
      }
    )
  }
)
