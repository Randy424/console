/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import * as constants from "../support/constants"

var headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
}

/**
* Get the clusterset info
* @param {string} clusterSet
* @returns {resp}
*/
export const getClusterSet = (clusterSet) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta2_path +
            constants.managedclustersets_path +
            '/' + clusterSet,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Get the clusterset info using v1beta1 version, this was only available in 2.7 version
* @param {string} clusterSet
* @returns {resp}
*/
export const getClusterSetv1beta1 = (clusterSet) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta1_path +
            constants.managedclustersets_path +
            '/' + clusterSet,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Get the clusterset list
* @returns {resp}
*/
export const getClusterSets = () => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta2_path +
            constants.managedclustersets_path,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Create the clusterset
* @param {string} clusterSet
* @returns {resp}
*/
export const createClusterSet = (clusterSet) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "POST",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta2_path +
            constants.managedclustersets_path +
            '/',
        headers: headers,
        body: `{
            "apiVersion": "cluster.open-cluster-management.io/v1beta2",
            "kind": "ManagedClusterSet",
            "metadata": {
              "name": "${clusterSet}"
            },
            "spec": {
              "clusterSelector": {
                "selectorType": "ExclusiveClusterSetLabel"
              }
            }
          }`,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Create the clusterset with v1beta1 version, this was only available in 2.7 version.
* @param {string} clusterSet
* @returns {resp}
*/
export const createClusterSetv1beta1 = (clusterSet) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "POST",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta1_path +
            constants.managedclustersets_path +
            '/',
        headers: headers,
        body: `{
            "apiVersion": "cluster.open-cluster-management.io/v1beta1",
            "kind": "ManagedClusterSet",
            "metadata": {
              "name": "${clusterSet}"
            },
            "spec": {
                "clusterSelector": {
                  "selectorType": "LegacyClusterSetLabel"
                }
              }
          }`,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Delete the clusterset
* @param {string} clusterSet
* @returns {resp}
*/
export const deleteClusterSet = (clusterSet) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "DELETE",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta2_path +
            constants.managedclustersets_path +
            '/' + clusterSet,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
* Get the namespacebinding
* @param {string} clusterSet
* @param {string} namespace
* @returns {resp}
*/
export const getNamespaceBinding = (clusterSet, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta2_path +
            '/namespaces/' + namespace +
            '/managedclustersetbindings/' + clusterSet,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return cy.wrap(resp)
        })
}

/**
 * Create the namespacebinding with v1beta1 API, this was only available in 2.7 version
 * @param {*} clusterSet
 * @param {*} namespace
 */
export const createNamespaceBindingv1beta1 = (clusterSet, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "POST",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta1_path +
            '/namespaces/' + namespace +
            '/managedclustersetbindings',
        headers: headers,
        body: `{
            "apiVersion": "cluster.open-cluster-management.io/v1beta1",
            "kind": "ManagedClusterSetBinding",
            "metadata": {
              "name": "${clusterSet}",
              "namespace": "${namespace}"
            },
            "spec": {
              "clusterSet": "${clusterSet}"
            }
          }`,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}