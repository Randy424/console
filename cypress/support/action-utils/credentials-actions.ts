/* Copyright Contributors to the Open Cluster Management project */

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
    //  TODO: refactor goTo methods, visit components with redirect unless testing the manual flow
    // acm23xheaderMethods.goToCredentials()
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
