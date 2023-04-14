/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import {
  managedClustersMethods,
  managedClustersSelectors,
  clusterStatus,
  clusterDeploymentPowerStatus,
} from '../../../support/action-utils/managedCluster'
import {
  clusterDeploymentActions,
  clusterMetricsActions,
  clusterActions,
} from '../../../support/action-utils/clusterAction'
import { getManagedClusters } from '../../../support/api-utils/cluster-api'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')

describe(
  'hibernate clusters',
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
      cy.login()
      cy.setAPIToken()
    })

    // Hibernate hive cluster
    it(
      `RHACM4K-3460: CLC: Hibernate Clusters - Verify that user is able to Hibernate cluster using ellipsis/options`,
      { tags: ['managedclusters', 'hibernate', 'hive'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              managedClustersMethods.hibernateClusterByOptions(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.WAIT_FOR_MACHINE_STOP
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.STOPPING)
            }
          })
        }
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.HIBERNATING
              )
              clusterMetricsActions.checkClusterMetrics(spoke, clusterStatus.HIBERNATING)
              managedClustersMethods.checkCluster(spoke, clusterStatus.HIBERNATING)
            }
          })
        }
      }
    )
    // Resume hive cluster
    it(
      `RHACM4K-3461: CLC: Resume Clusters - Verify that user is able to Resume cluster using ellipsis/options`,
      { tags: ['managedclusters', 'hibernate', 'hive'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              managedClustersMethods.resumeClusterByOptions(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.RESUME_OR_RUNNING
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.RESUMING)
            }
          })
        }
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(spoke, clusterDeploymentPowerStatus.RUNNING)
              clusterMetricsActions.checkClusterMetrics(spoke)
              managedClustersMethods.checkCluster(spoke, clusterStatus.READY)
            }
          })
        }
      }
    )
    // Hibernate hive cluster
    it(
      `RHACM4K-3440: CLC: Hibernate Clusters - Verify that user can Hibernate a cluster using bulk Actions`,
      { tags: ['managedclusters', 'hibernate', 'hive'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              managedClustersMethods.hibernateClusterByAction(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.WAIT_FOR_MACHINE_STOP
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.STOPPING)
            }
          })
        }
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.HIBERNATING
              )
              clusterMetricsActions.checkClusterMetrics(spoke, clusterStatus.HIBERNATING)
              managedClustersMethods.checkCluster(spoke, clusterStatus.HIBERNATING)
            }
          })
        }
      }
    )
    // Resume hive cluster
    it(
      `RHACM4K-3441: CLC: Resume Clusters - Verify that user can Resume a Hibernating cluster using bulk Actions`,
      { tags: ['managedclusters', 'hibernate', 'hive'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              managedClustersMethods.resumeClusterByAction(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.RESUME_OR_RUNNING
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.RESUMING)
            }
          })
        }
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp) {
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(spoke, clusterDeploymentPowerStatus.RUNNING)
              clusterMetricsActions.checkClusterMetrics(spoke)
              managedClustersMethods.checkCluster(spoke, clusterStatus.READY)
            }
          })
        }
      }
    )

    it(
      `RHACM4K-11608: CLC: Hibernate/Resume cluster operations are not available for RHV clusters`,
      { tags: ['managedclusters', 'hibernate', 'hive', 'rhv'] },
      function () {
        getManagedClusters('cloud=RHV,name!=local-cluster,owner=acmqe-clc-auto').then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (let cluster of resp.body.items) {
              clusterActions.checkHiveCluster(cluster.metadata.name).then((resp) => {
                if (resp) {
                  // No Hibernate action exists in the options action list
                  managedClustersMethods.actionNotExistByOptions(
                    cluster.metadata.name,
                    managedClustersSelectors.clusterTableRowOptionsMenu.hibernateCluster
                  )
                  // No Resmue action exists in the options action list
                  managedClustersMethods.actionNotExistByOptions(
                    cluster.metadata.name,
                    managedClustersSelectors.clusterTableRowOptionsMenu.resumeCluster
                  )
                  // Check the hibernate action in action dropdown list
                  managedClustersMethods.actionNotAllowedByActionDropdown(
                    cluster.metadata.name,
                    managedClustersSelectors.clusterTableActionsMenu.hibernateClusters
                  )
                  managedClustersMethods.actionNotAllowedByActionDropdown(
                    cluster.metadata.name,
                    managedClustersSelectors.clusterTableActionsMenu.resumeClusters
                  )
                } else this.skip()
              })
            }
          } else this.skip()
        })
      }
    )
  }
)
