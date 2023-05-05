/* Copyright Contributors to the Open Cluster Management project */

import * as constants from '../constants'
import { credentialType } from '../action-utils/credentials-actions'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: '',
}

export const getCredential = (name, namespace) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  const apiUrl = Cypress.env('CLUSTER_API_URL')
  let options = {
    method: 'GET',
    url: apiUrl + '/api/v1/namespaces/' + namespace + '/secrets/' + name,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return cy.wrap(resp)
  })
}

export const getCredentials = (name, type) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  const apiUrl = Cypress.env('CLUSTER_API_URL')
  let options = {
    method: 'GET',
    url: apiUrl + '/api/v1/secrets' + '?labelSelector=cluster.open-cluster-management.io/credentials',
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    let items = []
    resp.body.items.forEach((item) => {
      if (
        item.metadata.name.includes(name) &&
        item.metadata.labels['cluster.open-cluster-management.io/type'] === type
      ) {
        items.push(`${item.metadata.namespace}/${item.metadata.name}`)
      }
    })
    return cy.wrap(items)
  })
}

export const getAllCredentials = () => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  const apiUrl = Cypress.env('CLUSTER_API_URL')
  let options = {
    method: 'GET',
    url: apiUrl + '/api/v1/secrets' + '?labelSelector=cluster.open-cluster-management.io/credentials',
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return cy.wrap(resp)
  })
}

export const deleteCredentials = (name, type) => {
  getCredentials(name, type).then((creds) => {
    creds.forEach((cred) => {
      let options = {
        method: 'DELETE',
        url: constants.apiUrl + `/api/v1/namespaces/${cred.split('/').shift()}/secrets/${cred.split('/').pop()}`,
        headers: headers,
        failOnStatusCode: false,
      }
      cy.request(options).then((resp) => {
        cy.wrap(resp.status)
      })
    })
  })
}

/**
 * Creates a credential via API using an HTTP POST, based off the credential data provided
 * @param {*} credential credential object that defines
 *  @param {*} type type of cloud provider
 * @returns
 */
export const createCredential = (credential, type) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  const apiUrl = Cypress.env('CLUSTER_API_URL')
  let options = {
    method: 'POST',
    url: apiUrl + '/api/v1/namespaces/' + credential.namespace + '/secrets',
    headers: headers,
    // TODO look into templating or setting this body into some fixture to update
    body: `{
                "apiVersion": "v1",
                "kind": "Secret",
                "type": "Opaque",
                "metadata": {
                    "name": "${credential.name}",
                    "namespace": "${credential.namespace}",
                    "labels": {
                        "cluster.open-cluster-management.io/type": "${type}",
                        "cluster.open-cluster-management.io/credentials": ""
                    }
                },
                "stringData" :
                ${JSON.stringify(_generateCredentialStringData(credential, type))}
            }`,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return cy.wrap(resp)
  })
}

const _generateCredentialStringData = (credential, type) => {
  switch (type) {
    case credentialType.AWS:
      return {
        aws_access_key_id: credential.awsAccessKeyID,
        aws_secret_access_key: credential.awsSecretAccessKeyID,
        baseDomain: credential.baseDnsDomain,
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        httpProxy: credential.httpProxy ?? '',
        httpsProxy: credential.httpsProxy ?? '',
        noProxy: credential.noProxy ?? '',
        additionalTrustBundle: credential.additionalTrustBundle ?? '',
      }
    case credentialType.AZURE:
      return {
        baseDomainResourceGroupName: credential.baseDomainResourceGroupName,
        cloudName: credential.cloudName,
        'osServicePrincipal.json': `{
                    "clientId": "${credential.clientID}",
                    "clientSecret": "${credential.clientSecret}",
                    "tenantId": "${credential.tenantID}",
                    "subscriptionId": "${credential.subscriptionID}"
                }`,
        baseDomain: credential.baseDnsDomain,
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        httpProxy: credential.httpProxy ?? '',
        httpsProxy: credential.httpsProxy ?? '',
        noProxy: credential.noProxy ?? '',
        additionalTrustBundle: credential.additionalTrustBundle ?? '',
      }
    case credentialType.GCP:
      return {
        projectID: credential.gcpProjectID,
        'osServiceAccount.json': credential.gcpServiceAccountJsonKey,
        baseDomain: credential.baseDnsDomain,
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        httpProxy: credential.httpProxy ?? '',
        httpsProxy: credential.httpsProxy ?? '',
        noProxy: credential.noProxy ?? '',
        additionalTrustBundle: credential.additionalTrustBundle ?? '',
      }
    case credentialType.ANSIBLE:
      return {
        host: credential.ansibleHost,
        token: credential.ansibleToken,
      }
    case credentialType.VMWARE:
      return {
        vCenter: credential.vcenterServer,
        username: credential.username,
        password: credential.password,
        cacertificate: credential.cacertificate,
        cluster: credential.vmClusterName,
        datacenter: credential.datacenter,
        defaultDatastore: credential.datastore,
        baseDomain: credential.baseDnsDomain,
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        imageContentSources: credential.imageContentSources ?? '',
      }
    case credentialType.RHV:
      return {
        ovirt_url: credential.oVirtUrl,
        ovirt_fqdn: credential.oVirtFQDN,
        ovirt_username: credential.oVirtUsername,
        ovirt_password: credential.oVirtPassword,
        ovirt_ca_bundle: credential.oVirtCACertifcate,
        baseDomain: credential.baseDomain,
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        httpProxy: credential.httpProxy ?? '',
        httpsProxy: credential.httpsProxy ?? '',
        noProxy: credential.noProxy ?? '',
        additionalTrustBundle: credential.additionalTrustBundle ?? '',
      }
    case credentialType.OPENSTACK:
      return {
        'clouds.yaml': credential.cloudsFile,
        cloud: credential.cloudName,
        baseDomain: credential.baseDomain,
        clusterOSImage: credential.clusterOSImage ?? '',
        imageContentSources: credential.imageContentSources ?? '',
        pullSecret: credential.pullSecret,
        'ssh-privatekey': credential.sshPrivatekey,
        'ssh-publickey': credential.sshPublickey,
        httpProxy: credential.httpProxy ?? '',
        httpsProxy: credential.httpsProxy ?? '',
        noProxy: credential.noProxy ?? '',
        additionalTrustBundle: credential.additionalTrustBundle ?? '',
      }
    case credentialType.BMC: // TODO
      return
    case credentialType.ON_PREMISE: // TODO
      return
    case credentialType.RHOCM: // TODO
      return
    default:
      cy.log('Nothing going on here!')
  }
}
