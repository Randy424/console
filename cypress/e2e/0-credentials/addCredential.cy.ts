import { load, loadAll } from 'js-yaml'
import { ProviderConnection, ServicePrinciple } from '../../resources/provider-connection'

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

// TODO: leverage copy and paste buttons in creation console for faster input...
// TODO: validate credential exists after creation!
describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    beforeEach(() => {
      cy.clearAllCredentials()
      cy.readFile('cypress/fixtures/credentials/aws-credential.yaml').as('awsCredential')
      cy.readFile('cypress/fixtures/credentials/azure-credential.yaml').as('azureCredential')
      cy.readFile('cypress/fixtures/credentials/gcp-credential.yaml').as('gcpCredential')
      // for monolith files, can also use
      // cy.readFile('cypress/fixtures/credentials/allCredentials.yaml').then(function (allCredential) {
      //   this.awsCredential = loadAll(allCredential).find((resource) => resource['metadata']['name'] === 'aws-credential')
      // })
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

    it('RHACM4K-567: CLC: Create AWS provider connection', { tags: ['aws', 'credentials'] }, function () {
      // move directly to creation page
      cy.visit('/multicloud/credentials/create')

      // Select credential type
      cy.get('article').contains('Amazon Web Services').click()
      cy.get('article').contains('Red Hat OpenShift Provisioning').click()

      // get credential fixture
      const awsCred = load(this.awsCredential) as ProviderConnection

      // Basic information
      fillBasicInformation(awsCred)
      cy.get('button').contains('Next').click()

      // AWS keys
      cy.typeToInputField('#aws_access_key_id', awsCred.stringData.aws_access_key_id)
      cy.typeToInputField('#aws_secret_access_key', awsCred.stringData.aws_access_key_id)
      cy.get('button').contains('Next').click()

      // Proxy (skip proxy)
      cy.get('button').contains('Next').click()

      // Pull Secret
      fillPullSecrets(awsCred)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()
    })

    //TODO: have a discussion with David about using id attributes for selectors. Should we use role+content selectors?
    it('RHACM4K-567: CLC: Create Azure provider connection', { tags: ['azure', 'credentials'] }, function () {
      // move directly to creation page
      cy.visit('/multicloud/credentials/create')

      // Select credential type
      cy.get('article').contains('Microsoft Azure').click()

      // get credential fixture
      const azureCred = load(this.azureCredential) as ProviderConnection

      // Basic information
      fillBasicInformation(azureCred)

      // Cloud name
      cy.selectFromSelectField('#azureCloudName-input-toggle-select-typeahead', azureCred.stringData.cloudName)
      cy.get('button').contains('Next').click()

      // Azure details
      cy.typeToInputField('#baseDomainResourceGroupName', azureCred.stringData.baseDomainResourceGroupName)
      // parse servicePrinciple string to object
      const servicePrinciple: ServicePrinciple = JSON.parse(azureCred.stringData['osServicePrincipal.json'])
      cy.typeToInputField('#clientId', servicePrinciple.clientId)
      cy.typeToInputField('#clientSecret', servicePrinciple.clientSecret)
      cy.typeToInputField('#subscriptionId', servicePrinciple.subscriptionId)
      cy.typeToInputField('#tenantId', servicePrinciple.tenantId)
      cy.get('button').contains('Next').click()

      // Proxy (skip proxy)
      cy.get('button').contains('Next').click()

      // Pull Secret
      fillPullSecrets(azureCred)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()
    })

    it(
      'RHACM4K-567: CLC: Create Google Cloud provider connection',
      { tags: ['gcp', 'credentials', '@ocpInterop'] },
      function () {
        // move directly to creation page
        cy.visit('/multicloud/credentials/create')

        // Select credential type
        cy.get('article').contains('Google Cloud Platform').click()

        // get credential fixture
        const gcpCred = load(this.gcpCredential) as ProviderConnection

        // Basic information
        fillBasicInformation(gcpCred)
        cy.get('button').contains('Next').click()

        // gcp details
        cy.typeToInputField('#projectID', gcpCred.stringData.projectID)
        cy.typeToInputField('textarea[label="Service account JSON key"]', gcpCred.stringData['osServiceAccount.json'])
        cy.get('button').contains('Next').click()

        // Proxy (skip proxy)
        cy.get('button').contains('Next').click()

        // Pull Secret
        fillPullSecrets(gcpCred)
        cy.get('button').contains('Next').click()

        // Summary page
        cy.get('button').contains('Add').click()
      }
    )

    // it('CLC: Create provider connection using Editor input', { tags: ['aws', 'credentials'] }, function () {
    //   cy.visit('/multicloud/credentials/create')
    //   // Select credential type
    //   cy.get('article').contains('Amazon Web Services').click()
    //   cy.get('article').contains('Red Hat OpenShift Provisioning').click()

    //   const awsCred = load(this.awsCredential) as ProviderConnection
    //   cy.log('checking parsed cred: ', awsCred)
    //   console.log('checking parsed cred: ', awsCred.metadata)
    //   console.log('checking parsed cred type: ', typeof awsCred)
    //   cy.get('h2').contains('Enter the basic credentials information')
    //   cy.get('span').contains('YAML').click()
    //   cy.get('div.monaco-scrollable-element').click()
    //   cy.focused().clear()

    //   cy.focused().type(JSON.stringify(awsCred), { parseSpecialCharSequences: false })
    // })
  }
)
