/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import * as cluster from '../../../support/api-utils/cluster-api'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

describe(
  'Destroy SNO clusters',
  {
    tags: ['@CLC', '@destroy', '@sno', '@dev-preview'],
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.login()
    })

    it(
      `RHACM4K-4081: CLC: Destroy Cluster - Verify Single Node Openshift(SNO) cluster 'Destroy' on AWS`,
      { tags: ['sno', 'aws', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('name!=local-cluster,cloud=Amazon,owner=acmqe-clc-auto,clc-cluster-type=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                managedClustersMethods.destroyCluster(cluster.metadata.name)
              }
            }
          })
      }
    )
    it(
      `RHACM4K-4082: CLC: Destroy Cluster - Verify Single Node Openshift(SNO) 'Azure' cluster 'Destroy'`,
      { tags: ['sno', 'azure', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('name!=local-cluster,cloud=Azure,owner=acmqe-clc-auto,clc-cluster-type=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                managedClustersMethods.destroyCluster(cluster.metadata.name)
              }
            }
          })
      }
    )
    it(
      `RHACM4K-4083: CLC: Destroy Cluster - Verify Single Node Openshift(SNO) 'GCP' cluster 'Destroy'`,
      { tags: ['sno', 'gcp', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('name!=local-cluster,cloud=Google,owner=acmqe-clc-auto,clc-cluster-type=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                managedClustersMethods.destroyCluster(cluster.metadata.name)
              }
            }
          })
      }
    )
    it(
      `RHACM4K-4085: CLC: Destroy Cluster - Verify Single Node Openshift(SNO) 'Openstack' cluster destroy`,
      { tags: ['sno', 'openstack', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('name!=local-cluster,cloud=OpenStack,owner=acmqe-clc-auto,clc-cluster-type=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                managedClustersMethods.destroyCluster(cluster.metadata.name)
              }
            }
          })
      }
    )
  }
)
