/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />
import * as constants from "../support/constants";
import { genericFunctions } from '../support/genericFunctions'

var headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
}

export const getClusterClaim = (clusterClaimName, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            '/namespaces/' +
            namespace +
            constants.clusterclaims_path +
            '/' + clusterClaimName,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

export const getClusterClaims = () => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            constants.clusterclaims_path,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return cy.wrap(resp)
        });
}

export const deleteClusterClaim = (clusterClaimName, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "DELETE",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            '/namespaces/' +
            namespace +
            constants.clusterclaims_path +
            '/' + clusterClaimName,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

export const getClusterDeployment = (clusterName) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_namespaced_api_path +
            clusterName +
            "/clusterdeployments/" +
            clusterName,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            if (resp.status != 200)
                return cy.wrap(resp.status)
            return cy.wrap(resp.body)
        });
}

export const getClusterDeployments = () => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            "/clusterdeployments",
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return cy.wrap(resp)
        });
}

export const getClusterPool = (clusterPoolName, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            '/namespaces/' +
            namespace +
            constants.clusterpools_path +
            '/' + clusterPoolName,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

export const getClusterPools = () => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            constants.clusterpools_path,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

export const getClusterProvisions = (namespace, labels) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let url = constants.apiUrl + constants.hive_api_path + '/namespaces/' + namespace + '/clusterprovisions'
    if (labels) url = url + `?labelSelector=${labels}`
    let options = {
        method: "GET",
        url: url,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return cy.wrap(resp)
        });
}

export const getMachinePools = (namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            '/namespaces/' +
            namespace +
            constants.machinepools_path,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

export const getMachinePool = (machinePool, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.hive_api_path +
            '/namespaces/' +
            namespace +
            constants.machinepools_path +
            '/' + machinePool,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then(resp => {
            return resp
        });
}

export const checkClusterDeployment = (clusterName) => {
    // timeout = 90 mins, polling every 1 minutes
    let interval = 60 * 1000; // 1 mins
    function getProvisionStatus(name) {
        return getClusterDeployment(name).then(cd => {
            if (cd.hasOwnProperty('status') && cd.spec.hasOwnProperty('installed')) {
                let status = cd.spec.installed
                cd.status.conditions.forEach(condition => {
                    if (condition.type === 'ProvisionFailed') {
                        status = condition.status === 'True' ? condition.status : status
                    }
                })
                return status
            } else return false
        })
    }
    genericFunctions.recurse(
        () => getProvisionStatus(clusterName),
        (status) => Boolean(status),
        90,
        interval)
}

export const checkClusterDeploymentDeleted = (clusterName) => {
    // timeout = 30 mins, polling every 60s
    let interval = 60 * 1000;
    genericFunctions.recurse(
        () => getClusterDeployment(clusterName),
        (status) => status == 404,
        30,
        interval)
}