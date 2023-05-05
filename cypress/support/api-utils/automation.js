/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import * as constants from '../constants'
import { genericFunctions } from '../genericFunctions'

var headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
}

export const getClusterCurator = (name, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let options = {
        method: "GET",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta1_path +
            '/namespaces/' + namespace +
            '/clustercurators/' + name,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options).then(resp => {
        return cy.wrap(resp)
    })
}

export const deleteClusterCurators = (namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let url = constants.apiUrl + constants.ocm_cluster_api_v1beta1_path + '/namespaces/' + namespace + '/clustercurators'
    let options = {
        method: "GET",
        url: url,
        headers: headers,
        failOnStatusCode: false
    };
    cy.request(options).then(resp => {
        resp.body.items.forEach(item => {
            options.method = "DELETE"
            options.url = `${url}/${item.metadata.name}`
            cy.request(options).then(resp => {
                return cy.wrap(resp.status)
            })
        })
    })
}

export const deleteClusterCurator = (name, namespace) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let url = constants.apiUrl + constants.ocm_cluster_api_v1beta1_path + '/namespaces/' + namespace + '/clustercurators/' + name
    let options = {
        method: "DELETE",
        url: url,
        headers: headers,
        failOnStatusCode: false
    }
    return cy.request(options)
        .then(resp => {
            return resp
        })
}

/**
 * 
 * @param {*} name 
 * @param {*} namespace 
 * @param {*} creds
 * @param {*} template
 * @returns 
 */
export const createClusterCurators = (name, namespace, creds, template) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`
    let options = {
        method: "POST",
        url:
            constants.apiUrl +
            constants.ocm_cluster_api_v1beta1_path +
            '/namespaces/' + namespace +
            '/clustercurators/',
        headers: headers,
        body: `{
            "apiVersion": "cluster.open-cluster-management.io/v1beta1",
            "kind": "ClusterCurator",
            "metadata": {
              "name": "${name}"
            },
            "spec": {
                "install": {
                    "posthook": [
                        {
                            "extra_vars": {},
                            "name": "${template}"
                        }
                    ],
                    "prehook": [
                        {
                            "extra_vars": {},
                            "name": "${template}"
                        }
                    ],
                    "towerAuthSecret": "${creds}"
                },
                "upgrade": {
                    "posthook": [
                        {
                            "extra_vars": {},
                            "name": "${template}"
                        }
                    ],
                    "prehook": [
                        {
                            "extra_vars": {},
                            "name": "${template}"
                        }
                    ],
                    "towerAuthSecret": "${creds}"
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

export const getAnsibleJobResult = (namespace, stage) => {
    headers.Authorization = `Bearer ${Cypress.env("token")}`;
    let url = constants.apiUrl +
        `/apis/tower.ansible.com/v1alpha1/namespaces/${namespace}/ansiblejobs`;
    let options = {
        method: "GET",
        url: url,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options).its('body').then(body => {
        let status = 'Pending'
        if (body.items.length < 1) {
            return status
        }
        else {
            body.items.forEach(item => {
                if (item.metadata.name.includes(stage)) {
                    cy.wrap(item.metadata.name)
                    status = item.status.ansibleJobResult != null ? item.status.ansibleJobResult.status : 'in progress'
                }
            })
            return cy.wrap(status)
        }
    })
}

/***
 * @param {String} ansibleHost ansible tower url
 * @param {String} ansibleToken ansible tower token
 * @param {Int} pageSize number of jobs
 */
export const getJobTemplates = (ansibleHost, ansibleToken, pageSize) => {
    headers.Authorization = `Bearer ${ansibleToken}`;
    let url = ansibleHost + constants.jobtemplate_api_path
    if (pageSize) url = url + `?page_size=${pageSize}`
    let options = {
        method: "GET",
        url: url,
        json: true,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then((resp) => {
            return cy.wrap(resp)
        });
}

/***
 * @param {String} ansibleHost ansible tower url
 * @param {String} ansibleToken ansible tower token
 * @param {String} name ansible job template name
 * @param {String} projectID ansible job template project
 * @param {String} inventoryID ansible Inventory
 * @param {String} playbook ansible playbook
*/
export const createJobTemplate = (ansibleHost, ansibleToken, name, projectID, inventoryID, playbook) => {
    headers.Authorization = `Bearer ${ansibleToken}`
    let url = ansibleHost + constants.jobtemplate_api_path
    let options = {
        method: "POST",
        url: url,
        headers: headers,
        body: `
{"name":"${name}","job_type":"run","project":${projectID},"inventory":${inventoryID},"playbook":"${playbook}"}`
    };

    return cy.request(options)
        .then((resp) => {
            return cy.wrap(resp)
        });
}

/***
 * @param {String} ansibleHost ansible tower url
 * @param {String} ansibleToken ansible tower token
 * @param {String} jobTemplateID ansible job template name
 */
export const deleteJobTemplate = (ansibleHost, ansibleToken, jobTemplateID) => {
    headers.Authorization = `Bearer ${ansibleToken}`
    let url = ansibleHost + constants.jobtemplate_api_path + jobTemplateID
    let options = {
        method: "DELETE",
        url: url,
        headers: headers
    };

    return cy.request(options)
        .then((resp) => {
            return cy.wrap(resp)
        });
}

export const getInventoryID = (ansibleHost, ansibleToken, inventoryName) => {
    headers.Authorization = `Bearer ${ansibleToken}`;
    let url = ansibleHost + constants.inventory_api_path
    let options = {
        method: "GET",
        url: url,
        json: true,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then((resp) => {
            return cy.wrap(resp)
        });
}

export const getProjectID = (ansibleHost, ansibleToken, projectName) => {
    headers.Authorization = `Bearer ${ansibleToken}`;
    let url = ansibleHost + constants.project_api_path + `?search=${projectName}`
    let options = {
        method: "GET",
        url: url,
        json: true,
        headers: headers,
        failOnStatusCode: false
    };
    return cy.request(options)
        .then((resp) => {
            return cy.wrap(resp)
        });
}

export const checkAnsibleJobResult = (namespace, stage) => {
    genericFunctions.recurse(
        () => getAnsibleJobResult(namespace, stage),
        (status) => ['failed', 'successful'].includes(status),
    )
}