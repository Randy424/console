/* Copyright Contributors to the Open Cluster Management project */

import { elements, elementsText } from '../../support/selectors'
import { selectOrTypeInInputDropDown, clickNext, clickAdd } from '../../support/genericFunctions'
import * as credentialAPI from '../../support/api-utils/credentials-api'
import { credentialsPageSelectors, credentialCreatePageSelector } from '../../support/selectors/credentialSelectors'
const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

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
   * @param {*} pullSecret The OCP image pull secret
   * @param {*} sshPrivatekey The ssh private key
   * @param {*} sshPublickey The ssh public key
   */
  fillPullSecretSSHKey: (pullSecret, sshPrivatekey, sshPublickey) => {
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

  // Fill the GCP Creds in create credential page
  /**
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
   * @param {*} ansibleHost The base URL of the Ansible Tower host account. A secure HTTPS protocol is required for the URL.
   * @param {*} ansibleToken
   */
  fillAnsibleCredsInfo: (ansibleHost, ansibleToken) => {
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ans.ansibleHost).click().type(ansibleHost)
    cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.ans.ansibleToken).click().type(ansibleToken)
    clickNext()
  },
}

export const credsActions = {
  /**
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

describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    beforeEach(function () {
      cy.login()
      cy.visit('/multicloud/infrastructure/')
    })

    it(
      `RHACM4K-567: CLC: Create AWS provider connections`,
      { tags: ['aws', 'credentials', '@ocpInterop'] },
      function () {
        // credentialsCreateMethods.addAWSCredential({
        //   ...options.connections.apiKeys.aws,
        //   ...options.connections.secrets,
        // })
        const { name, namespace, baseDnsDomain, awsAccessKeyID, awsSecretAccessKeyID } = options.connections.apiKeys.aws
        const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

        credentialAPI.getCredential(name, namespace).then((resp) => {
          // When the secret was not exists, create it.
          if (resp.status == 404) {
            //TODO: refactor -> test gotoCreatCluster independetly, and travel to the page using cy.visit for other uses
            // credentialsPages.goToCreateCredentialPage()
            cy.visit('multicloud/credentials/create')

            // select provider type and credential type
            cy.get(credentialsPageSelectors.credentialsTypeLocator.aws).click()
            cy.get(credentialsPageSelectors.credentialsTypeLocator.awsStandard).click()

            //
            credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)

            // aws specific fields
            cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.aws.awsAccessKeyID)
              .click()
              .type(awsAccessKeyID)
            cy.get(credentialCreatePageSelector.credentialsTypesInputSelectors.aws.awsSecretAccessKeyID)
              .should('exist')
              .click()
              .type(awsSecretAccessKeyID)
            clickNext()

            credentialsCreatePages.fillProxyInfo()
            credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
            clickAdd()

            credsActions.credShouldExist(name, namespace)
          } else {
            cy.log('verifying response status from getCredential is 200')
            expect(resp.status).to.equal(200)
          }
        })
      }
    )

    it(`RHACM4K-568: CLC: Create Azure provider connections`, { tags: ['azure', 'credentials'] }, function () {
      const {
        name,
        namespace,
        baseDnsDomain,
        baseDomainResourceGroupName,
        clientID,
        clientSecret,
        subscriptionID,
        tenantID,
        cloudName = 'AzurePublicCloud',
      } = options.connections.apiKeys.azure
      const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
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
          credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        } else {
          cy.log('verifying response status from getCredential is 200')
          expect(resp.status).to.equal(200)
        }
      })
    })

    it(`RHACM4K-569: CLC: Create Google Cloud provider connections`, { tags: ['gcp', 'credentials'] }, function () {
      const { name, namespace, baseDnsDomain, gcpProjectID, gcpServiceAccountJsonKey } = options.connections.apiKeys.gcp
      const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
          cy.get(credentialsPageSelectors.credentialsTypeLocator.gcp).click()
          credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
          credentialsCreatePages.fillGCPCredsInfo(gcpProjectID, gcpServiceAccountJsonKey)
          credentialsCreatePages.fillProxyInfo()
          credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        }
      })
    })

    it(`RHACM4K-1232: CLC: Create VMware provider connections`, { tags: ['vmware', 'credentials'] }, function () {
      const {
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
        vSphereDiskType,
        vSphereFolder,
        vSphereResourcePool,
      } = options.connections.apiKeys.vmware
      const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
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
          credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        }
      })
    })

    it(`RHACM4K-6917: CLC: Create Ansible credentials`, { tags: ['ansible', 'credentials'] }, function () {
      const { name, namespace, ansibleHost, ansibleToken } = options.connections.apiKeys.ansible
      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
          cy.get(credentialsPageSelectors.credentialsTypeLocator.ans).click()
          credentialsCreatePages.fillBasicInformation(name, namespace, '')
          credentialsCreatePages.fillAnsibleCredsInfo(ansibleHost, ansibleToken)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        }
      })
    })

    it(`RHACM4K-8106: CLC: Create Azure Government credentials`, { tags: ['azgov', 'credentials'] }, function () {
      const {
        name,
        namespace,
        baseDnsDomain,
        baseDomainResourceGroupName,
        clientID,
        clientSecret,
        subscriptionID,
        tenantID,
        cloudName = 'AzureUSGovernmentCloud',
      } = options.connections.apiKeys.azgov
      const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
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
          credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        } else {
          cy.log('verifying response status from getCredential is 200')
          expect(resp.status).to.equal(200)
        }
      })
    })

    it(
      `RHACM4K-3177: CLC: Create Red Hat OpenStack Platform credentials`,
      { tags: ['openstack', 'credentials'] },
      function () {
        const { name, namespace, baseDnsDomain, cloudsFile, cloudName } = options.connections.apiKeys.openstack
        const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

        credentialAPI.getCredential(name, namespace).then((resp) => {
          if (resp.status == 404) {
            cy.visit('multicloud/credentials/create')
            cy.get(credentialsPageSelectors.credentialsTypeLocator.ost).click()
            credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
            credentialsCreatePages.fillOpenstackCredsInfo(cloudsFile, cloudName)
            credentialsCreatePages.fillDisconnectedInstallInfo()
            credentialsCreatePages.fillProxyInfo()
            credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
            clickAdd()
            credsActions.credShouldExist(name, namespace)
          }
        })
      }
    )

    it(`RHACM4K-13213: CLC: Create a Red Hat Virtualization credential`, { tags: ['rhv', 'credentials'] }, function () {
      const { name, namespace, baseDnsDomain, oVirtUrl, oVirtFQDN, oVirtUsername, oVirtPassword, oVirtCACertifcate } =
        options.connections.apiKeys.rhv
      const { pullSecret, sshPrivatekey, sshPublickey } = options.connections.secrets

      credentialAPI.getCredential(name, namespace).then((resp) => {
        if (resp.status == 404) {
          cy.visit('multicloud/credentials/create')
          cy.get(credentialsPageSelectors.credentialsTypeLocator.rhv).click()
          credentialsCreatePages.fillBasicInformation(name, namespace, baseDnsDomain)
          credentialsCreatePages.fillRHVCredsInfo(oVirtUrl, oVirtFQDN, oVirtUsername, oVirtPassword, oVirtCACertifcate)
          credentialsCreatePages.fillProxyInfo()
          credentialsCreatePages.fillPullSecretSSHKey(pullSecret, sshPrivatekey, sshPublickey)
          clickAdd()
          credsActions.credShouldExist(name, namespace)
        }
      })
    })
  }
)
