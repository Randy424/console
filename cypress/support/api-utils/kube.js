/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2022 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import * as constants from "../support/constants"
import { genericFunctions } from '../support/genericFunctions'

var headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
}

export const getNamespace = (namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            '/api/v1/namespaces/' + namespace,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

export const createNamespace = (namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: 'POST',
        url:
            constants.apiUrl +
            '/api/v1/namespaces',
        body: `{
            "apiVersion": "v1",
            "kind": "Namespace",
            "metadata": {
                "name": "${namespace}"
            },
            "spec": {}
        }`,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options).then(resp => {
        return resp
    })
}

export const deleteNamespace = (namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "DELETE",
        url:
            constants.apiUrl +
            '/api/v1/namespaces/' + namespace,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

export const checkNamespaceDeleted = (namespace) => {
    // timeout = 15 mins, polling every 30s
    let interval = 30 * 1000

    genericFunctions.recurse(
        () => getNamespace(namespace),
        (resp) => resp.status == 404,
        30,
        interval)
}

export const getSecret = (secretName, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            '/api/v1/namespaces/' +
            namespace +
            '/secrets/' + secretName,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

/**
 * 
 * @param {*} secretName the name of secret
 * @param {*} namespace the namespace of secret
 * @param {*} type the type of secret, should support 'aws','azr','gcp','ost','redhatvirtualization','vmw','hostinventory','ans' and 'rhocm'
 * @param {*} data the body is the secret data we want to created
 */
export const createSecret = (secretName, namespace, type, data) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`

    let options = {
        method: "POST",
        url:
            constants.apiUrl +
            '/api/v1/namespaces/' +
            namespace +
            "/secrets",
        headers: headers,
        body: `{
            "apiVersion": "v1",
            "kind": "Secret",
            "type": "Opaque",
            "metadata": {
                "name": "${secretName}",
                "labels": {
                    "cluster.open-cluster-management.io/type": "${type}",
                    "cluster.open-cluster-management.io/credentials": ""
                }
            },
            "stringData": ${data}
            }`,
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}