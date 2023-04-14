/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { managedClusterDetailMethods } from '../../../support/action-utils/managedCluster'
import { commonPageMethods } from '../../../support/commonSelectors'

import * as cluster from '../../../support/api-utils/cluster-api'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')

describe(
  'cluster node',
  {
    tags: ['@CLC', '@e2e'],
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.login()
      cy.setAPIToken()
    })

    it(
      `RHACM4K-8325: CLC: Cluster Nodes - As an admin, I was able to see the node list in cluster nodes page`,
      { tags: ['managedclusters', 'clusternode'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            // use below check to make sure the cluster was ready
            if (
              mc.isOkStatusCode &&
              mc.body.metadata.labels.hasOwnProperty('feature.open-cluster-management.io/addon-work-manager') &&
              mc.body.metadata.labels['feature.open-cluster-management.io/addon-work-manager'] == 'available'
            ) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              managedClusterDetailMethods.goToClusterNodes()
              cluster.getManagedClusterInfo(spoke).then((resp) => {
                // if the cluster status was not available, the status will not have nodeList
                if (resp.status.hasOwnProperty('nodeList')) {
                  commonPageMethods.resourceTable.rowCount().then((count) => {
                    expect(count).to.be.eq(resp.status.nodeList.length)
                  })
                  if (resp.status.kubeVendor === 'OpenShift') {
                    // handle the OCP cluster
                    for (const node of resp.status.nodeList) {
                      cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Name"] > a`).should(
                        'have.prop',
                        'href',
                        `${resp.status.consoleURL}/k8s/cluster/nodes/${node.name}`
                      )
                      if (node.conditions[0].status === 'True') {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Status"]`)
                          .contains('Ready')
                          .should('exist')
                      }
                      // TODO(Hui) will check the status if the condition was not true
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/master') &&
                        !node.labels.hasOwnProperty('node-role.kubernetes.io/worker')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('master')
                          .should('exist')
                      }
                      if (
                        !node.labels.hasOwnProperty('node-role.kubernetes.io/master') &&
                        node.labels.hasOwnProperty('node-role.kubernetes.io/worker')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('worker')
                          .should('exist')
                      }
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/master') &&
                        node.labels.hasOwnProperty('node-role.kubernetes.io/worker')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('master, worker')
                          .should('exist')
                      }
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/worker') &&
                        node.labels.hasOwnProperty('node-role.kubernetes.io=infra')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('infra, worker')
                          .should('exist')
                      }
                      if (node.labels.hasOwnProperty('failure-domain.beta.kubernetes.io/region')) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Region"]`).contains(
                          `${node.labels['failure-domain.beta.kubernetes.io/region']}`
                        )
                      }
                      if (node.labels.hasOwnProperty('failure-domain.beta.kubernetes.io/zone')) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Zone"]`).contains(
                          `${node.labels['failure-domain.beta.kubernetes.io/zone']}`
                        )
                      }
                      if (resp.metadata.labels.openshiftVersion == 3) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Instance type"]`).contains(
                          `${node.labels['beta.kubernetes.io/instance-type']}`
                        )
                      } else {
                        if (node.labels.hasOwnProperty('node.kubernetes.io/instance-type')) {
                          cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Instance type"]`).contains(
                            `${node.labels['node.kubernetes.io/instance-type']}`
                          )
                        }
                      }
                      // cy.get('data-label="CPU"')
                      // cy.get('data-label="RAM"')
                    }
                  } else {
                    // handle the *ks cluster
                    for (const node of resp.status.nodeList) {
                      if (typeof Cypress.env('ACM_NAMESPACE') != 'undefined') {
                        // Means the ACM was installed and have search enabled
                        // TODO(Hui): find other way to check if search was enabled or not.
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Name"] > a`).should(
                          'have.prop',
                          'href',
                          Cypress.config().baseUrl +
                            '/multicloud/home/search/resources?cluster=' +
                            spoke +
                            '&kind=node&apiversion=v1&name=' +
                            `${node.name}`
                        )
                      }
                      if (node.conditions[0].status === 'True') {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Status"]`)
                          .contains('Ready')
                          .should('exist')
                      }
                      // TODO(Hui) will check the status if the condition was not true
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/master') &&
                        !node.labels.hasOwnProperty('node-role.kubernetes.io/worker')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('master')
                          .should('exist')
                      }
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/worker') &&
                        !node.labels.hasOwnProperty('node-role.kubernetes.io/master')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('worker')
                          .should('exist')
                      }
                      if (
                        node.labels.hasOwnProperty('node-role.kubernetes.io/master') &&
                        node.labels.hasOwnProperty('node-role.kubernetes.io/worker')
                      ) {
                        cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Role"] > span`)
                          .contains('master,worker')
                          .should('exist')
                      }
                      cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Region"]`).contains(
                        `${node.labels['failure-domain.beta.kubernetes.io/region']}`
                      )
                      cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Zone"]`).contains(
                        `${node.labels['failure-domain.beta.kubernetes.io/zone']}`
                      )
                      cy.get(`[data-ouia-component-id="${node.name}"] > [data-label="Instance type"]`).contains(
                        `${node.labels['beta.kubernetes.io/instance-type']}`
                      )
                      // cy.get('data-label="CPU"')
                      // cy.get('data-label="RAM"')
                    }
                  }
                }
              })
            }
          })
        }
      }
    )
  }
)
