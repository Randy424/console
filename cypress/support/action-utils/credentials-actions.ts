/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2023 Red Hat, Inc.
 ****************************************************************************** */

import { elements, elementsText } from '../selectors'
import { resourceTable, modal } from './component-methods/ResourceTable'
import { selectOrTypeInInputDropDown, clickNext, clickAdd } from '../genericFunctions'
import { acm23xheaderMethods, acmHeaderSelectors } from '../header'

// import { credsActions } from '../../action-utils/credentials/credentials-actions'
import * as credentialAPI from '../api-utils/credentials-api'

export const credentialType = {
  AWS: 'aws',
  AZURE: 'azr',
  GCP: 'gcp',
  VMWARE: 'vmw',
  ANSIBLE: 'ans',
  OPENSTACK: 'ost',
  RHV: 'redhatvirtualization',
  BMC: 'bmc',
  RHOCM: 'rhocm',
  ON_PREMISE: 'hybrid',
  HOST_INVENTORY: 'hostinventory',
}

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

export const credsActions = {
  /**
   *
   * @param {*} name credential name
   * @param {*} namespace credential namespace
   */
  credShouldExist: (name, namespace) => {
    cy.log('Make sure the credentials exists')
    cy.waitUntil(
      () => {
        return credentialAPI.getCredential(name, namespace).then((resp) => {
          return resp.status == 200
        })
      },
      {
        interval: 5 * 1000,
        timeout: 300 * 1000,
      }
    )
  },

  /**
   *
   * @param {*} name credential name
   * @param {*} namespace credential namespace
   */
  credShouldNotExist: (name, namespace) => {
    cy.log('Make sure the credentials not exists')
    cy.waitUntil(
      () => {
        return credentialAPI.getCredential(name, namespace).then((resp) => {
          return resp.status == 404
        })
      },
      {
        interval: 5 * 1000,
        timeout: 300 * 1000,
      }
    )
  },
}

/**
 * This object contais the group of pages that are part of credentials
 */
export const credentialsPages = {
  shouldLoad: () => {
    cy.get(elements.pageClassKey, { timeout: 10000 }).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.credentials
    )
    cy.url().should('include', '/credentials', { timeout: 10000 })
    cy.get('.pf-c-spinner', { timeout: 20000 }).should('not.exist')
  },

  goToCreateCredentialPage: () => {
    acm23xheaderMethods.goToCredentials()
    credentialAPI.getAllCredentials().then((creds) => {
      if (Array.isArray(creds.body.items) && !creds.body.items.length) {
        cy.log('There are no credentials yet. Click a element for adding new credential')
        cy.get(elements.mainSection)
          .contains(elements.a, credentialsPageSelectors.elementText.addCredential, {
            timeout: 200000,
          })
          .should('have.attr', 'aria-disabled', 'false')
          .click()
      } else {
        cy.log('There are credentials present. Click button element for adding new credential')
        cy.get(elements.mainSection)
          .contains(elements.button, credentialsPageSelectors.elementText.addCredential, {
            timeout: 200000,
          })
          .should('have.attr', 'aria-disabled', 'false')
          .click()
      }
    })
    cy.url().should('include', '/credentials/create', { timeout: 10000 })
  },

  goToEditCredentialPage: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credRowExist(name, namespace)
    resourceTable.openRowMenu(name)
    resourceTable.buttonShouldClickable(credentialsPageSelectors.tableRowOptionsMenu.editCredential)
    cy.get(credentialsPageSelectors.tableRowOptionsMenu.editCredential).click()
    modal.shouldBeOpen()
  },

  goToCredentialDetail: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credRowExist(name, namespace)
    cy.get(credentialsPageSelectors.tableColumnFields.name).contains(elements.a, name).click()
  },

  goToDeleteCredentialByOption: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credRowExist(name, namespace)
    resourceTable.openRowMenu(name)
    resourceTable.buttonShouldClickable(credentialsPageSelectors.tableRowOptionsMenu.deleteCredential)
    cy.get(credentialsPageSelectors.tableRowOptionsMenu.deleteCredential).click()
    modal.shouldBeOpen()
  },

  goToDeleteCredentialByAction: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credRowExist(name, namespace)
    cy.get(credentialsPageSelectors.tableColumnFields.name)
      .contains(elements.a, name)
      .parent()
      .parent()
      .prev()
      .find(elements.input)
      .check()
      .should('be.checked')
    cy.get(elements.toolbarContentSection).within(() => cy.get(elements.actionsButton).should('exist').click())
    cy.wait(500)
    cy.get(elements.a).contains(credentialsPageSelectors.elementText.deleteCredentials).should('exist').click()
    modal.shouldBeOpen()
  },
}

/**
 * This object contais the group of methods that are part of credentials create page
 */
export const credentialsCreatePages = {
  // Fill the basic infomation in create credential page
  fillBasicInformation: (name, namespace, baseDomain, cloudName?) => {
    cy.get(credentialCreatePageSelector.credentialsName).should('exist').click().type(name)
    selectOrTypeInInputDropDown(credentialCreatePageSelector.namespace, namespace)
    if (baseDomain) cy.get(credentialCreatePageSelector.baseDomain).should('exist').click().type(baseDomain)
    if (cloudName)
      selectOrTypeInInputDropDown(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.cloudName, cloudName)
    clickNext()
  },

  // Fill the proxy info in create credential page
  fillProxyInfo: () => {
    // TODO: Add the http proxy configuration later.
    clickNext()
  },

  // Fill the disconnected info in create credential page
  fillDisconnectedInstallInfo: () => {
    // TODO: Add the disconnected info later.
    clickNext()
  },

  // Fill the ssh key and pull secret in create credential page
  /**
   *
   * @param {*} pullSecret The OCP image pull secret
   * @param {*} sshPrivatekey The ssh private key
   * @param {*} sshPublickey The ssh public key
   */
  fillCommonCredentials: (pullSecret, sshPrivatekey, sshPublickey) => {
    cy.contains(elements.button, elementsText.next).click({ force: true })
    cy.get(credentialCreatePageSelector.commonCredentials.pullSecret).should('exist').paste(pullSecret)
    cy.get(credentialCreatePageSelector.commonCredentials.sshPrivatekey)
      .scrollIntoView()
      .should('exist')
      .paste(sshPrivatekey)
    cy.get(credentialCreatePageSelector.commonCredentials.sshPublicKey)
      .scrollIntoView()
      .should('exist')
      .paste(sshPublickey)
    clickNext()
  },

  // Fill the AWS Creds in create credential page
  /**
   *
   * @param {*} awsAccessKeyID the AWS access key ID
   * @param {*} awsSecretAccessKeyID the AWS access key secret
   */
  fillAWSCredsInfo: (awsAccessKeyID, awsSecretAccessKeyID) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.aws.awsAccessKeyID).click().type(awsAccessKeyID)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.aws.awsSecretAccessKeyID)
      .should('exist')
      .click()
      .type(awsSecretAccessKeyID)
    clickNext()
  },

  // Fill the GCP Creds in create credential page
  /**
   *
   * @param {*} gcpProjectID the GPC Cloud Project ID
   * @param {*} gcpServiceAccountJsonKey the GCP server account file
   */
  fillGCPCredsInfo: (gcpProjectID, gcpServiceAccountJsonKey) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.gcp.gcProjectID).click().type(gcpProjectID)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.gcp.gcServiceAccountKey)
      .should('exist')
      .paste(gcpServiceAccountJsonKey)
    clickNext()
  },

  // Fill the Azure Creds in create credential page
  /**
   *
   * @param {*} baseDomainResourceGroupName The azure base domain resource group
   * @param {*} clientId The azure client ID
   * @param {*} clientSecret The azure cluster secret
   * @param {*} subscriptionId The azure subscription ID
   * @param {*} tenantId The azure tanant ID
   */
  fillAzureCredsInfo: (baseDomainResourceGroupName, clientId, clientSecret, subscriptionId, tenantId) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.baseDomainResourceGroupName)
      .should('exist')
      .click()
      .type(baseDomainResourceGroupName)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.clientId).click().type(clientId)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.clientSecret).click().type(clientSecret)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.subscriptionId).click().type(subscriptionId)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.azr.tenantId).click().type(tenantId)
    clickNext()
  },

  // Fill The Azure Creds in create credential page
  /**
   *
   * @param {*} cloudsFile The OpenStack clouds.yaml file, including the password, to connect to the OpenStack server.
   * @param {*} cloudName The name of the cloud section of the clouds.yaml to use for establishing communication to the OpenStack server.
   */
  fillOpenstackCredsInfo: (cloudsFile, cloudName) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ost.openstackCloudsYaml)
      .should('exist')
      .paste(cloudsFile)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ost.openstackCloudName).click().type(cloudName)
    clickNext()
  },

  // Fill The Azure Creds in create credential page
  /**
   *
   * @param {*} url
   * @param {*} fqdn The the fully qualified domain name of the RHV environment
   * @param {*} username
   * @param {*} password
   * @param {*} cacertificate a CA certificate for the oVirt Engine account
   */
  fillRHVCredsInfo: (url, fqdn, username, password, cacertificate) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.rhv.oVirtURL).click().type(url)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.rhv.oVirtFQDN).click().type(fqdn)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.rhv.oVirtUsername).click().type(username)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.rhv.oVirtPassword).click().type(password)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.rhv.oVirtCert).paste(cacertificate)
    clickNext()
  },

  // Fill the Azure Creds in create credential page
  /**
   *
   * @param {*} vcenterServer The fully-qualified host name or IP address of the vCenter server. The value must be defined in the vCenter server root CA certificate.
   * @param {*} username The name of the user that is required to access the vCenter server. This user must have at least the roles and privileges that are required for static or dynamic persistent volume provisioning in vSphere.
   * @param {*} password The password associated with the vCenter username.
   * @param {*} cacertificate A vCenter server root CA certificate that, when added, reduces the number of web browser certificate warnings.
   * @param {*} vmClusterName The name of the vSphere cluster to use.
   * @param {*} datacenter The name of the vSphere datacenter to use.
   * @param {*} datastore The name of the default vSphere defaultDatastore to use.
   * @param {*} vSphereDiskType vSphere disk type.
   * @param {*} vSphereFolder vSphere folder.
   * @param {*} vSphereResourcePool vSphere resource pool.
   */
  fillVmwareCredsInfo: (
    vcenterServer,
    username,
    password,
    cacertificate,
    vmClusterName,
    datacenter,
    datastore,
    vSphereDiskType,
    vSphereFolder,
    vSphereResourcePool
  ) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vCenterCredentials.vcenter)
      .click()
      .type(vcenterServer)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vCenterCredentials.username)
      .click()
      .type(username)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vCenterCredentials.password)
      .click()
      .type(password)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vCenterCredentials.cacertificate).paste(
      cacertificate
    )
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.vmClusterName)
      .click()
      .type(vmClusterName)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.datacenter)
      .click()
      .type(datacenter)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.datastore)
      .click()
      .type(datastore)
    if (vSphereDiskType) {
      cy.get(
        credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.vSphereDiskTypeToggle
      ).click()
      cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.vSphereDiskType)
        .contains(vSphereDiskType)
        .click()
    }
    if (vSphereFolder)
      cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.vSphereFolder)
        .click()
        .type(vSphereFolder)
    if (vSphereResourcePool)
      cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.vmw.vSphereCredentials.vSphereResourcePool)
        .click()
        .type(vSphereResourcePool)
    clickNext()
  },

  // Fill the Ansible Creds in create credential page
  /**
   *
   * @param {*} ansibleHost The base URL of the Ansible Tower host account. A secure HTTPS protocol is required for the URL.
   * @param {*} ansibleToken
   */
  fillAnsibleCredsInfo: (ansibleHost, ansibleToken) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ans.ansibleHost).click().type(ansibleHost)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ans.ansibleToken).click().type(ansibleToken)
    clickNext()
  },
}

/**
 * This object contais the group of methods that are part of credentials create
 */
export const credentialsCreateMethods = {
  addAWSCredential: ({
    name,
    namespace,
    baseDnsDomain,
    awsAccessKeyID,
    awsSecretAccessKeyID,
    pullSecret,
    sshPrivatekey,
    sshPublickey,
  }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      // When the secret was not exists, create it.
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.aws).click()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.awsStandard).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
        credentialsCreatePages.fillAWSCredsInfo(awsAccessKeyID, awsSecretAccessKeyID)
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addGCPCredential: ({
    name,
    namespace,
    baseDnsDomain,
    gcpProjectID,
    gcpServiceAccountJsonKey,
    pullSecret,
    sshPrivatekey,
    sshPublickey,
  }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.gcp).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
        credentialsCreatePages.fillGCPCredsInfo(gcpProjectID, gcpServiceAccountJsonKey)
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addAzureCredential: (
    {
      name,
      namespace,
      baseDnsDomain,
      baseDomainResourceGroupName,
      clientID,
      clientSecret,
      subscriptionID,
      tenantID,
      pullSecret,
      sshPrivatekey,
      sshPublickey,
    },
    cloudName
  ) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.azr).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain, cloudName)
        credentialsCreatePages.fillAzureCredsInfo(
          baseDomainResourceGroupName,
          clientID,
          clientSecret,
          subscriptionID,
          tenantID
        )
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addOpenStackCredential: ({
    name,
    namespace,
    baseDnsDomain,
    cloudsFile,
    cloudName,
    pullSecret,
    sshPrivatekey,
    sshPublickey,
  }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.ost).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
        credentialsCreatePages.fillOpenstackCredsInfo(cloudsFile, cloudName)
        credentialsCreatePages.fillDisconnectedInstallInfo()
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addVMwareCredential: ({
    name,
    namespace,
    baseDnsDomain,
    vcenterServer,
    username,
    password,
    cacertificate,
    vmClusterName,
    datacenter,
    datastore,
    pullSecret,
    sshPrivatekey,
    sshPublickey,
    vSphereDiskType,
    vSphereFolder,
    vSphereResourcePool,
  }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.vmw).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
        credentialsCreatePages.fillVmwareCredsInfo(
          vcenterServer,
          username,
          password,
          cacertificate,
          vmClusterName,
          datacenter,
          datastore,
          vSphereDiskType,
          vSphereFolder,
          vSphereResourcePool
        )
        credentialsCreatePages.fillDisconnectedInstallInfo()
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addRHVCredential: ({
    name,
    namespace,
    baseDnsDomain,
    oVirtUrl,
    oVirtFQDN,
    oVirtUsername,
    oVirtPassword,
    oVirtCACertifcate,
    pullSecret,
    sshPrivatekey,
    sshPublickey,
  }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.rhv).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
        credentialsCreatePages.fillRHVCredsInfo(oVirtUrl, oVirtFQDN, oVirtUsername, oVirtPassword, oVirtCACertifcate)
        credentialsCreatePages.fillProxyInfo()
        credentialsCreatePages.fillCommonCredentials(pullSecret, sshPrivatekey, sshPublickey)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },

  addAnsibleTowerCredential: ({ name, namespace, ansibleHost, ansibleToken }) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status == 404) {
        credentialsPages.goToCreateCredentialPage()
        cy.get(credentialsPageSelectors.credentialsTypeLocator.ans).click()
        credentialsCreatePages.fillBasicInformation(name, namespace, '')
        credentialsCreatePages.fillAnsibleCredsInfo(ansibleHost, ansibleToken)
        clickAdd()
        credsActions.credShouldExist(name, namespace)
      }
    })
  },
}

/**
 * This object contais the group of methods that are part of credentials page
 */
export const credentialsPageMethods = {
  deleteCredentialByOption: (name, namespace) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status === 200) {
        credentialsPages.goToDeleteCredentialByOption(name, namespace)
        cy.get('div').should('be.visible').contains(credentialsPageSelectors.elementText.deleteCredentialsConfirmation)
        cy.get('div').should('be.visible').contains(elements.button, elementsText.delete).click()
      }
    })
    credsActions.credShouldNotExist(name, namespace)
  },

  deleteCredentialByAction: (name, namespace) => {
    credentialAPI.getCredential(name, namespace).then((resp) => {
      if (resp.status === 200) {
        credentialsPages.goToDeleteCredentialByAction(name, namespace)
        cy.get('div').should('be.visible').contains(credentialsPageSelectors.elementText.deleteCredentialsConfirmation)
        cy.get('div').should('be.visible').contains(elements.button, elementsText.delete).click()
      }
    })
    credsActions.credShouldNotExist(name, namespace)
  },

  credShouldExists: (name, namespace) => {
    credsActions.credShouldExist(name, namespace)
    acm23xheaderMethods.goToCredentials()
    credentialsPages.shouldLoad()
    credRowExist(name, namespace)
  },

  credShouldNotExists: (name, namespace) => {
    credsActions.credShouldNotExist(name, namespace)
    acm23xheaderMethods.goToCredentials()
    credentialsPages.shouldLoad()
    // need to check if it's empty page here before
    cy.get(elements.mainSection, { timeout: 5000 }).then(($body) => {
      if (!$body.text().includes(credentialsPageSelectors.emptyMsg)) {
        credRowNotExist(name, namespace)
      }
    })
  },

  credExistsButNotShow: (name, namespace) => {
    credsActions.credShouldExist(name, namespace)
    acm23xheaderMethods.goToCredentials()
    credentialsPages.shouldLoad()
    cy.get(elements.mainSection, { timeout: 5000 }).then(($body) => {
      if (!$body.text().includes(credentialsPageSelectors.emptyMsg)) {
        credRowNotExist(name, namespace)
      }
    })
  },

  shouldEditCred: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credentialsPages.shouldLoad()
    credRowExist(name, namespace)
    resourceTable.openRowMenu(name)
    resourceTable.buttonShouldClickable(credentialsPageSelectors.tableRowOptionsText.editCredential, elements.a)
  },

  shouldDeleteCred: (name, namespace) => {
    acm23xheaderMethods.goToCredentials()
    credentialsPages.shouldLoad()
    credRowExist(name, namespace)
    resourceTable.openRowMenu(name)
    resourceTable.buttonShouldClickable(credentialsPageSelectors.tableRowOptionsText.deleteCredential, elements.a)
  },
}

export const credRowExist = (name, namespace) => {
  resourceTable.searchTable(namespace)
  cy.get(`tr > td a`, { timeout: 30000 }).contains(name, { timeout: 30000 }).should('exist')
}

export const credRowNotExist = (name, namespace) => {
  resourceTable.searchTable(namespace)
  cy.get(elements.mainSection, { timeout: 5000 }).then(($body) => {
    if (!$body.text().includes(elementsText.noResult)) {
      cy.get(`tr > td a`, { timeout: 30000 }).contains(name, { timeout: 30000 }).should('not.exist')
    }
  })
}
