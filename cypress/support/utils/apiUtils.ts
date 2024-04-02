import { dump, load, loadAll } from 'js-yaml'
import { ProviderConnection } from '../../resources/provider-connection'

// createCredential
export function createCredential(credentialName: string) {
  const allCredentials = loadAll(this.credentials) as ProviderConnection[]
  const serializedAwsCred = dump(allCredentials.find((credential) => credential.metadata.name === credentialName))
  cy.task('createFile', { path: `${credentialName}.yaml`, data: serializedAwsCred }).then(() => {
    cy.exec(`oc apply -f ${credentialName}.yaml`)
    cy.exec(`rm ${credentialName}.yaml`)
  })
}
