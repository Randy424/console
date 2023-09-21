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
describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    beforeEach(() => {
      // TODO: convert to monolith credential file
      cy.clearAllCredentials()
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

    before(() => {
      cy.readFile('cypress/fixtures/credentials/aws-credential.yaml').as('awsCredential')
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

      // confirm credential exists in credential list
      cy.get('a').contains(awsCred.metadata.name)
    })

    before(() => {
      cy.readFile('cypress/fixtures/credentials/azure-credential.yaml').as('azureCredential')
    })
    //TODO: have a discussion with David about using id attributes for selectors. Should we use role+content selectors?
    it('RHACM4K-568: CLC: Create Azure provider connections', { tags: ['azure', 'credentials'] }, function () {
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

      // confirm credential exists in credential list
      cy.get('a').contains(azureCred.metadata.name)
    })

    before(() => {
      cy.readFile('cypress/fixtures/credentials/azure-gov-credential.yaml').as('azureGovCredential')
    })
    //TODO: have a discussion with David about using id attributes for selectors. Should we use role+content selectors?
    it('RHACM4K-8106: CLC: Create Azure Government credentials', { tags: ['azgov', 'credentials'] }, function () {
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('Microsoft Azure').click()

      const azureGovCred = load(this.azureGovCredential) as ProviderConnection

      fillBasicInformation(azureGovCred)

      cy.selectFromSelectField('#azureCloudName-input-toggle-select-typeahead', azureGovCred.stringData.cloudName)
      cy.get('button').contains('Next').click()

      cy.typeToInputField('#baseDomainResourceGroupName', azureGovCred.stringData.baseDomainResourceGroupName)

      // parse servicePrinciple string to object
      const servicePrinciple: ServicePrinciple = JSON.parse(azureGovCred.stringData['osServicePrincipal.json'])
      cy.typeToInputField('#clientId', servicePrinciple.clientId)
      cy.typeToInputField('#clientSecret', servicePrinciple.clientSecret)
      cy.typeToInputField('#subscriptionId', servicePrinciple.subscriptionId)
      cy.typeToInputField('#tenantId', servicePrinciple.tenantId)
      cy.get('button').contains('Next').click()

      // Proxy (skip proxy)
      cy.get('button').contains('Next').click()

      // Pull Secret
      fillPullSecrets(azureGovCred)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()

      // confirm credential exists in credential list
      cy.get('a').contains(azureGovCred.metadata.name)
    })

    before(() => {
      cy.readFile('cypress/fixtures/credentials/gcp-credential.yaml').as('gcpCredential')
    })

    it(
      'RHACM4K-569: CLC: Create Google Cloud provider connections',
      { tags: ['gcp', 'credentials', '@ocpInterop'] },
      function () {
        cy.visit('/multicloud/credentials/create')

        cy.get('article').contains('Google Cloud Platform').click()

        const gcpCred = load(this.gcpCredential) as ProviderConnection

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

        // confirm credential exists in credential list
        cy.get('a').contains(gcpCred.metadata.name)
      }
    )

    before(() => {
      cy.readFile('cypress/fixtures/credentials/vmware-credential.yaml').as('vmwareCredential')
    })

    it('RHACM4K-1232: CLC: Create VMware provider connections', { tags: ['vmware', 'credentials'] }, function () {
      // move directly to creation page
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('VMware vSphere').click()

      const vmwareCred = load(this.vmwareCredential) as ProviderConnection

      fillBasicInformation(vmwareCred)
      cy.get('button').contains('Next').click()

      // vmWare details
      cy.typeToInputField('#vCenter', vmwareCred.stringData.vCenter)
      cy.typeToInputField('#username', vmwareCred.stringData.username)
      cy.typeToInputField('#password', vmwareCred.stringData.password)
      cy.typeToInputField('textarea[label="vCenter root CA certificate"]', vmwareCred.stringData.cacertificate)
      cy.typeToInputField('#datacenter', vmwareCred.stringData.datacenter)
      cy.typeToInputField('#cluster', vmwareCred.stringData.cluster)
      cy.typeToInputField('#defaultDatastore', vmwareCred.stringData.defaultDatastore)
      cy.typeToInputField('#vsphereDiskType-input-toggle-select-typeahead', vmwareCred.stringData.vsphereDiskType)
      cy.typeToInputField('#vsphereFolder', vmwareCred.stringData.vsphereFolder)
      cy.typeToInputField('#vsphereResourcePool', vmwareCred.stringData.vsphereResourcePool)
      cy.get('button').contains('Next').click()

      // Disconnected setup (skip)
      cy.get('button').contains('Next').click()

      // Proxy (skip proxy)
      cy.get('button').contains('Next').click()

      // Pull Secret
      fillPullSecrets(vmwareCred)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()

      // confirm credential exists in credential list
      cy.get('a').contains(vmwareCred.metadata.name)
    })

    before(() => {
      cy.readFile('cypress/fixtures/credentials/ansible-credential.yaml').as('ansibleCredential')
    })

    it('RHACM4K-6917: CLC: Create Ansible credentials', { tags: ['ansible', 'credentials'] }, function () {
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('Red Hat Ansible Automation Platform').click()

      const ansibleCred = load(this.ansibleCredential) as ProviderConnection

      // Basic information
      cy.typeToInputField('#credentialsName', ansibleCred.metadata.name)
      cy.selectFromSelectField('#namespaceName-input-toggle', ansibleCred.metadata.namespace)
      cy.get('button').contains('Next').click()

      // ansible details
      cy.typeToInputField('#ansibleHost', ansibleCred.stringData.host)
      cy.typeToInputField('#ansibleToken', ansibleCred.stringData.token)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()

      // confirm credential exists in credential list
      cy.get('a').contains(ansibleCred.metadata.name)
    })

    // TODO: finish these...
    // it(`RHACM4K-30168: CLC: Create Red Hat OpenStack Platform credentials with CA cert`, {tags: ['openstack', 'credentials']}, function () {
    // })

    // it(`RHACM4K-3177: CLC: Create Red Hat OpenStack Platform credentials`, { tags: ['openstack', 'credentials'] }, function () {
    // })

    // it(`RHACM4K-13213: CLC: Create a Red Hat Virtualization credential`, { tags: ['rhv', 'credentials'] }, function () {
    // });

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
