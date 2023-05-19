/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />
import * as constants from '../constants'
import * as genericFunctions from '../genericFunctions'

var headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: '',
}
const apiUrl = Cypress.env('CLUSTER_API_URL')

export const getManagedCluster = (clusterName) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: apiUrl + constants.ocm_cluster_api_v1_path + '/managedclusters/' + clusterName,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getManagedClusters = (labels) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let url = apiUrl + constants.ocm_cluster_api_v1_path + '/managedclusters'
  if (labels) url = url + `?labelSelector=${labels}`
  let options = {
    method: 'GET',
    url: url,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getManagedClusterInfo = (clusterName) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url:
      apiUrl +
      '/apis/internal.open-cluster-management.io/v1beta1/namespaces/' +
      clusterName +
      '/managedclusterinfos/' +
      clusterName,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    if (resp.status != 200) return cy.wrap(resp.status)
    return cy.wrap(resp.body)
  })
}

export const createManagedCluster = (body) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  cy.log('checking bearer: ', Cypress.env('token'))
  let options = {
    method: 'POST',
    url: apiUrl + constants.ocm_cluster_api_v1_path + '/managedclusters',
    headers: headers,
    body: body,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const deleteManagedCluster = (clusterName) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'DELETE',
    url: apiUrl + constants.ocm_cluster_api_v1_path + '/managedclusters/' + clusterName,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const updateManagedCluster = (clusterName, body) => {
  let options = {
    method: 'PATCH',
    url: apiUrl + constants.ocm_agent_api_path + '/managedclusters/' + clusterName,
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Accept: 'application/json',
      Authorization: `Bearer ${Cypress.env('token')}`,
    },
    body: body,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getManagedClusterAddons = (clusterName) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: apiUrl + constants.ocm_addon_api_path + '/namespaces/' + clusterName + '/managedclusteraddons',
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getManagedClusterAddon = (clusterName, addon) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: apiUrl + constants.ocm_addon_api_path + '/namespaces/' + clusterName + '/managedclusteraddons/' + addon,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const deleteManagedClusterAddon = (clusterName, addon) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'DELETE',
    url: apiUrl + constants.ocm_addon_api_path + '/namespaces/' + clusterName + '/managedclusteraddons/' + addon,
    headers: headers,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const updateKlusterletAddonConfig = (clusterName, body) => {
  let options = {
    method: 'PATCH',
    url:
      apiUrl + constants.ocm_agent_api_path + '/namespaces/' + clusterName + '/klusterletaddonconfigs/' + clusterName,
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Accept: 'application/json',
      Authorization: `Bearer ${Cypress.env('token')}`,
    },
    body: body,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getAllSNOClusters = () => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let clusters = []
  let options = {
    method: 'GET',
    url: apiUrl + constants.ocm_cluster_api_v1_path + '/managedclusters',
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    if (resp.body.items.length < 1) {
      cy.log('No clusters found')
      return null
    } else {
      resp.body.items.forEach((item) => {
        if (item.metadata.name.includes('-sno-')) {
          clusters.push(item.metadata.name)
        }
        return cy.wrap(clusters)
      })
    }
  })
}

export const checkManagedClusterInfoStatus = (clusterName) => {
  // timeout = 15 mins, polling every 30s
  let interval = 30 * 1000
  function getClusterInfoStatus(name) {
    return getManagedClusterInfo(name).then((clusterInfo: any) => {
      let status = 'false'
      clusterInfo.status.conditions.forEach((condition) => {
        if (condition.type == 'ManagedClusterInfoSynced') {
          status = condition.status === 'True' ? condition.status : status
        }
      })
      return status
    })
  }
  genericFunctions.recurse(
    () => getClusterInfoStatus(clusterName),
    (status) => Boolean(status),
    30,
    interval
  )
}

export const checkManagedClusterWorkAddon = (clusterName) => {
  // timeout = 15 mins, polling every 30s
  let interval = 30 * 1000
  function getWorkAddonStatus(name) {
    return getManagedCluster(name).then((managedCluster) => {
      return (
        managedCluster.body.metadata.labels.hasOwnProperty('feature.open-cluster-management.io/addon-work-manager') &&
        (managedCluster.body.metadata.labels['feature.open-cluster-management.io/addon-work-manager'] = 'available')
      )
    })
  }
  genericFunctions.recurse(
    () => getWorkAddonStatus(clusterName),
    (status) => Boolean(status),
    30,
    interval
  )
}

export const checkManagedClusterInfoDeleted = (clusterName) => {
  // timeout = 15 mins, polling every 30s
  let interval = 30 * 1000
  genericFunctions.recurse(
    () => getManagedClusterInfo(clusterName),
    (status) => status == 404,
    30,
    interval
  )
}
