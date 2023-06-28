export const credentialsPageSelectors = {
  credentialsTypeLocator: {
    // Cloud provider credentials
    aws: '#aws',
    awsStandard: '#aws-standard',
    awsBucket: '#aws-bucket',
    azr: '#azure',
    gcp: '#google',

    // Datacenter credentials
    vmw: '#vsphere',
    ost: '#openstack',
    rhv: '#rhv',
    hostInv: '#hostinventory',

    // Automation & other credentials
    ans: '#ansible',
    rhocm: '#redhatcloud',
  },
  search: 'input[aria-label="Search input"]',
  resetSearch: 'button[aria-label="Reset"]',
  elementText: {
    deleteCredentials: 'Delete credentials',
    addCredential: 'Add credential',
    deleteCredentialsConfirmation: 'Permanently delete credentials?',
  },
  tableColumnFields: {
    name: '[data-label="Name"]',
    credentialType: '[data-label="Credential type"]',
    namespace: '[data-label="Namespace"]',
    additionalActions: '[data-label="Additional actions"]',
    created: '[data-label="Created"]',
  },
  tableRowOptionsMenu: {
    editCredential: 'a[text="Edit credential"]',
    deleteCredential: 'a[text="Delete credential"]',
  },
  tableRowOptionsText: {
    editCredential: 'Edit credential',
    deleteCredential: 'Delete credential',
  },
  emptyMsg: "You don't have any credentials",
}

export const credentialCreatePageSelector = {
  credentialsName: '#credentialsName',
  namespace: '#namespaceName-form-group',
  baseDomain: '#baseDomain',
  credentialsTypesInputSelectors: {
    aws: {
      awsAccessKeyID: '#aws_access_key_id',
      awsSecretAccessKeyID: '#aws_secret_access_key',
    },
    gcp: {
      gcProjectID: '#projectID',
      gcServiceAccountKey: 'textarea', //text area element tag
    },
    azr: {
      cloudName: '#azureCloudName-form-group',
      baseDomainResourceGroupName: '#baseDomainResourceGroupName',
      clientId: '#clientId',
      clientSecret: '#clientSecret',
      subscriptionId: '#subscriptionId',
      tenantId: '#tenantId',
    },
    vmw: {
      vCenterCredentials: {
        vcenter: '#vCenter',
        username: '#username',
        password: '#password',
        cacertificate: '#cacertificate',
      },
      vSphereCredentials: {
        vmClusterName: '#cluster',
        datacenter: '#datacenter',
        datastore: '#defaultDatastore',
        vSphereDiskType: '#vsphereDiskType',
        vSphereDiskTypeToggle: '#vsphereDiskType-input-toggle-select-typeahead',
        vSphereFolder: '#vsphereFolder',
        vSphereResourcePool: '#vsphereResourcePool',
      },
    },
    ans: {
      ansibleHost: '#ansibleHost',
      ansibleToken: '#ansibleToken',
    },
    ost: {
      openstackCloudsYaml: 'textarea[placeholder="Enter the contents of the OpenStack clouds.yaml"]',
      openstackCloudName: '#os_ca_bundle',
    },
    rhv: {
      oVirtURL: '#ovirt_url',
      oVirtFQDN: '#ovirt_fqdn',
      oVirtUsername: '#ovirt_username',
      oVirtPassword: '#ovirt_password',
      oVirtCert: '#ovirt_ca_bundle',
    },
  },
  commonCredentials: {
    pullSecret: '#pullSecret',
    sshPrivatekey: '#ssh-privatekey',
    sshPublicKey: '#ssh-publickey',
  },
}
