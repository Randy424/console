/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedCluster'
import { clusterActions, clusterMetricsActions } from '../../../support/action-utils/clusterAction'
import { getManagedClusters } from '../../../support/api-utils/cluster-api'

describe(
  'reimport clusters',
  {
    tags: ['@CLC', '@e2e'],
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.setAPIToken()
      cy.login()
    })

    it(
      'RHACM4K-3042: CLC: Reimport - Verify that user is able to detach and reimport a hive created cluster',
      { tags: ['managedclusters', 'reimport'] },
      function () {
        // Reimport the hive cluster from public cloud
        getManagedClusters(
          'feature.open-cluster-management.io/addon-work-manager=available,cloud!=RHV,cloud!=OpenStack,cloud!=hypershift,cloud!=BareMetal,name!=local-cluster,owner=acmqe-clc-auto,vendor=OpenShift'
        ).then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (let cluster of resp.body.items) {
              clusterActions.checkHiveCluster(cluster.metadata.name).then((resp) => {
                if (resp) {
                  managedClustersMethods.detachCluster(cluster.metadata.name)
                  managedClustersMethods.importClusterByOption(cluster.metadata.name)
                  clusterMetricsActions.checkClusterMetrics(cluster.metadata.name)
                  managedClustersMethods.checkCluster(cluster.metadata.name, 'Ready')
                }
              })
            }
          } else {
            // skip the test cases here since no cluster found by query the managedcluster API
            cy.log('Skip the cases here since there did not have cluster found')
            this.skip()
          }
        })
      }
    )

    it(
      'RHACM4K-3302: CLC: Reimport - detach and import OCP cluster on OpenStack',
      { tags: ['openstack', 'managedclusters', 'reimport'] },
      function () {
        // Reimport the Openstack cluster
        getManagedClusters(
          'feature.open-cluster-management.io/addon-work-manager=available,cloud=OpenStack,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno'
        ).then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (let cluster of resp.body.items) {
              clusterActions.checkHiveCluster(cluster.metadata.name).then((resp) => {
                if (resp) {
                  managedClustersMethods.detachCluster(cluster.metadata.name)
                  managedClustersMethods.importClusterByOption(cluster.metadata.name)
                  clusterMetricsActions.checkClusterMetrics(cluster.metadata.name)
                  managedClustersMethods.checkCluster(cluster.metadata.name, 'Ready')
                }
              })
            }
          } else {
            // skip the test cases here since no cluster found by query the managedcluster API
            cy.log('Skip the cases here since there did not have cluster found')
            this.skip()
          }
        })
      }
    )

    it(
      'RHACM4K-11607: CLC: Reimport - Detach and re-attach a hive provisioned RHV managed cluster via the UI',
      { tags: ['rhv', 'managedclusters', 'reimport'] },
      function () {
        // Reimport the RHV cluster
        getManagedClusters(
          'feature.open-cluster-management.io/addon-work-manager=available,cloud=RHV,name!=local-cluster,owner=acmqe-clc-auto'
        ).then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (let cluster of resp.body.items) {
              clusterActions.checkHiveCluster(cluster.metadata.name).then((resp) => {
                if (resp) {
                  managedClustersMethods.detachCluster(cluster.metadata.name)
                  managedClustersMethods.importClusterByOption(cluster.metadata.name)
                  clusterMetricsActions.checkClusterMetrics(cluster.metadata.name)
                  managedClustersMethods.checkCluster(cluster.metadata.name, 'Ready')
                }
              })
            }
          } else {
            // skip the test cases here since no cluster found by query the managedcluster API
            cy.log('Skip the cases here since there did not have cluster found')
            this.skip()
          }
        })
      }
    )
  }
)
