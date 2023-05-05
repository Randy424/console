/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import * as constants from '../constants'

var headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: '',
}

export const getUser = (user) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: constants.apiUrl + constants.user_api_path + '/users/' + user,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getClusterRole = (clusterRole) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: constants.apiUrl + constants.rbac_api_path + '/clusterroles/' + clusterRole,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const getClusterRolebinding = (clusterRoleBinding) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: constants.apiUrl + constants.rbac_api_path + '/clusterrolebindings/' + clusterRoleBinding,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const createClusterRolebinding = (body) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'POST',
    url: constants.apiUrl + constants.rbac_api_path + '/clusterrolebindings',
    headers: headers,
    body: body,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

export const deleteClusterRolebinding = (clusterRoleBinding) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'DELETE',
    url: constants.apiUrl + constants.rbac_api_path + '/clusterrolebindings/' + clusterRoleBinding,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

/**
 * Get the rolebinding from the
 * @param {string} roleBinding
 * @param {string} namespace
 * @returns {resp}
 */
export const getRolebinding = (roleBinding, namespace) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: constants.apiUrl + constants.rbac_api_path + '/namespaces/' + namespace + '/rolebindings/' + roleBinding,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

/**
 * Create the rolebinding from the namespace
 * @param {string} roleBinding
 * @param {string} namespace
 * @returns {resp}
 */
export const createRolebinding = (body, namespace) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'POST',
    url: constants.apiUrl + constants.rbac_api_path + '/namespaces/' + namespace + '/rolebindings',
    headers: headers,
    body: body,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}

/**
 * Delete the rolebinding from the namespace
 * @param {string} roleBinding
 * @param {string} namespace
 * @returns {resp}
 */
export const deleteRolebinding = (roleBinding, namespace) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'DELETE',
    url: constants.apiUrl + constants.rbac_api_path + '/namespaces/' + namespace + '/rolebindings/' + roleBinding,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy.request(options).then((resp) => {
    return resp
  })
}
