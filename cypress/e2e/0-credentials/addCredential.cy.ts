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
      cy.clearAllCredentials()
      cy.readFile('cypress/fixtures/credentials/credentials.yaml').as('credentials')
    })

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
      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const awsCred = allCredentials.find((credential) => credential.metadata.name === 'aws-connection')

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

    it('RHACM4K-568: CLC: Create Azure provider connections', { tags: ['azure', 'credentials'] }, function () {
      // move directly to creation page
      cy.visit('/multicloud/credentials/create')

      // Select credential type
      cy.get('article').contains('Microsoft Azure').click()

      // get credential fixture
      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const azureCred = allCredentials.find((credential) => credential.metadata.name === 'azure-connection')

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

    //TODO: have a discussion with David about using id attributes for selectors. Should we use role+content selectors?
    it('RHACM4K-8106: CLC: Create Azure Government credentials', { tags: ['azgov', 'credentials'] }, function () {
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('Microsoft Azure').click()

      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const azureGovCred = allCredentials.find((credential) => credential.metadata.name === 'azure-gov-connection')

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

    it(
      'RHACM4K-569: CLC: Create Google Cloud provider connections',
      { tags: ['gcp', 'credentials', '@ocpInterop'] },
      function () {
        cy.visit('/multicloud/credentials/create')

        cy.get('article').contains('Google Cloud Platform').click()

        const allCredentials = loadAll(this.credentials) as ProviderConnection[]
        const gcpCred = allCredentials.find((credential) => credential.metadata.name === 'gcp-connection')

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

    it('RHACM4K-1232: CLC: Create VMware provider connections', { tags: ['vmware', 'credentials'] }, function () {
      // move directly to creation page
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('VMware vSphere').click()

      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const vmwareCred = allCredentials.find((credential) => credential.metadata.name === 'vsphere-connection')

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

    it('RHACM4K-6917: CLC: Create Ansible credentials', { tags: ['ansible', 'credentials'] }, function () {
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('Red Hat Ansible Automation Platform').click()

      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const ansibleCred = allCredentials.find((credential) => credential.metadata.name === 'ansible-connection')

      // Basic information
      cy.typeToInputField('#credentialsName', ansibleCred.metadata.name)
      cy.selectFromSelectField('#namespaceName-input-toggle', ansibleCred.metadata.namespace)
      cy.get('button').contains('Next').click()

      // Ansible details
      cy.typeToInputField('#ansibleHost', ansibleCred.stringData.host)
      cy.typeToInputField('#ansibleToken', ansibleCred.stringData.token)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()

      // confirm credential exists in credential list
      cy.get('a').contains(ansibleCred.metadata.name)
    })

    it(
      `RHACM4K-30168: CLC: Create Red Hat OpenStack Platform credentials with CA cert`,
      { tags: ['openstack', 'credentials'] },
      function () {
        cy.visit('/multicloud/credentials/create')

        cy.get('article').contains('Red Hat OpenStack Platform').click()

        const allCredentials = loadAll(this.credentials) as ProviderConnection[]
        const openStackCred = allCredentials.find((credential) => credential.metadata.name === 'open-stack-connection')

        // Basic information
        cy.typeToInputField('#credentialsName', openStackCred.metadata.name + '-w-cert')
        cy.selectFromSelectField('#namespaceName-form-group', openStackCred.metadata.namespace)
        cy.typeToInputField('#baseDomain', openStackCred.stringData.baseDomain)

        // fillBasicInformation(openStackCred)
        cy.get('button').contains('Next').click()

        // Openstack details (and CA cert)
        cy.typeToInputField('textarea[label="OpenStack clouds.yaml"]', openStackCred.stringData['clouds.yaml'])
        // cy.typeToInputField('#cloud', openStackCred.stringData.cloud)
        cy.typeToInputField('textarea[label="Internal CA certificate"]', openStackCred.stringData.os_ca_bundle)
        cy.get('button').contains('Next').click()

        // disconnected install (skipped)
        cy.get('button').contains('Next').click()

        // proxy (skipped)
        cy.get('button').contains('Next').click()

        // Pull Secret
        fillPullSecrets(openStackCred)
        cy.get('button').contains('Next').click()

        // Summary page
        cy.get('button').contains('Add').click()

        // confirm credential exists in credential list
        cy.get('a').contains(openStackCred.metadata.name)
      }
    )

    it(
      `RHACM4K-3177: CLC: Create Red Hat OpenStack Platform credentials`,
      { tags: ['openstack', 'credentials'] },
      function () {
        cy.visit('/multicloud/credentials/create')

        cy.get('article').contains('Red Hat OpenStack Platform').click()

        const allCredentials = loadAll(this.credentials) as ProviderConnection[]
        const openStackCred = allCredentials.find((credential) => credential.metadata.name === 'open-stack-connection')

        // Basic information
        fillBasicInformation(openStackCred)
        cy.get('button').contains('Next').click()

        // Openstack details (and CA cert)
        cy.typeToInputField('textarea[label="OpenStack clouds.yaml"]', openStackCred.stringData['clouds.yaml'])
        cy.get('button').contains('Next').click()

        // disconnected install (skipped)
        cy.get('button').contains('Next').click()

        // proxy (skipped)
        cy.get('button').contains('Next').click()

        // Pull secrets
        fillPullSecrets(openStackCred)
        cy.get('button').contains('Next').click()

        // Summary page
        cy.get('button').contains('Add').click()

        // confirm credential exists in credential list
        cy.get('a').contains(openStackCred.metadata.name)
      }
    )

    it(`RHACM4K-13213: CLC: Create a Red Hat Virtualization credential`, { tags: ['rhv', 'credentials'] }, function () {
      cy.visit('/multicloud/credentials/create')

      cy.get('article').contains('Red Hat Virtualization').click()

      const allCredentials = loadAll(this.credentials) as ProviderConnection[]
      const RHVCred = allCredentials.find((credential) => credential.metadata.name === 'rhv-connection')

      // Basic information
      fillBasicInformation(RHVCred)
      cy.get('button').contains('Next').click()

      // RHV details
      cy.typeToInputField('#ovirt_url', RHVCred.stringData.ovirt_url)
      cy.typeToInputField('#ovirt_fqdn', RHVCred.stringData.ovirt_fqdn)
      cy.typeToInputField('#ovirt_username', RHVCred.stringData.ovirt_username)
      cy.typeToInputField('#ovirt_password', RHVCred.stringData.ovirt_password)
      cy.typeToInputField('textarea[label="oVirt CA Certificate"]', RHVCred.stringData.ovirt_ca_bundle)
      cy.get('button').contains('Next').click()

      // Proxy (skipped)
      cy.get('button').contains('Next').click()

      // Pull secrets
      fillPullSecrets(RHVCred)
      cy.get('button').contains('Next').click()

      // Summary page
      cy.get('button').contains('Add').click()

      // confirm credential exists in credential list
      cy.get('a').contains(RHVCred.metadata.name)
    })
  }
)
