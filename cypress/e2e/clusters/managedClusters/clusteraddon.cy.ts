/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { managedClusterDetailMethods, managedClustersUIValidations } from '../../../support/action-utils/managedCluster'
import { clusterActions } from '../../../support/action-utils/clusterAction'

import * as cluster from '../../../support/api-utils/cluster-api'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')
const clusterTestData = require('../../../fixtures/clusters/managedClustersTestData')

describe(
  'clusteraddon clusters',
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
      `RHACM4K-1584: CLC: Cluster Addons - Verify klusterlet addons on the UI`,
      { tags: ['managedclusters', 'clusteraddon'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            // only run this case when the cluster was available and work-manager addon started.
            if (
              mc.isOkStatusCode &&
              mc.body.metadata.labels.hasOwnProperty('feature.open-cluster-management.io/addon-work-manager') &&
              mc.body.metadata.labels['feature.open-cluster-management.io/addon-work-manager'] == 'available'
            ) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              managedClusterDetailMethods.goToClusterAddons()
              managedClustersUIValidations.validateAddons(spoke)
            }
          })
        }
      }
    )
    it(
      `RHACM4K-1401: CLC: Cluster Addons - Verify ManagedClusterAddon remains in original state`,
      { tags: ['managedclusters', 'clusteraddon'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            // only run this case when the cluster was available and work-manager addon started.
            if (
              mc.isOkStatusCode &&
              mc.body.metadata.labels.hasOwnProperty('feature.open-cluster-management.io/addon-work-manager') &&
              mc.body.metadata.labels['feature.open-cluster-management.io/addon-work-manager'] == 'available'
            ) {
              // delete the work-manager addon.
              cluster.deleteManagedClusterAddon(spoke, 'work-manager').then((resp) => expect(resp.isOkStatusCode))
              // check the addon, it should be recovered
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              managedClusterDetailMethods.goToClusterAddons()
              managedClustersUIValidations.validateAddon(spoke, 'work-manager')
            }
          })
        }
      }
    )
    it(
      `RHACM4K-1561: CLC: Cluster Addons - Disable and Re-Enable Cluster Addons`,
      { tags: ['managedclusters', 'clusteraddon'] },
      function () {
        if (typeof Cypress.env('ACM_NAMESPACE') != 'undefined') {
          // select one spoke cluster with addon enabled
          cluster
            .getManagedClusters(
              'owner=acmqe-clc-auto,name!=local-cluster,feature.open-cluster-management.io/addon-application-manager=available'
            )
            .then((resp) => {
              if (resp.isOkStatusCode) {
                if (resp.body.items.length > 0) {
                  let spoke = resp.body.items[0].metadata.name
                  // disable the application Manager addon
                  clusterActions.updateClusterAddon(spoke, 'applicationManager', 'false')
                  // addon should not exists any more
                  clusterActions.addonShouldNotExists(spoke, 'application-manager')
                  // enable the application manager addon
                  clusterActions.updateClusterAddon(spoke, 'applicationManager', 'true')
                  // addon should be created then
                  clusterActions.addonShouldExists(spoke, 'application-manager')
                  // check the addon
                  managedClusterDetailMethods.goToManagedClusterOverview(spoke)
                  managedClusterDetailMethods.goToClusterAddons()
                  managedClustersUIValidations.validateAddon(spoke, 'application-manager')
                }
              }
            })
        } else {
          this.skip()
        }
      }
    )
    it(
      `RHACM4K-1585: CLC: Cluster Addons - Verify managedcluster addons on the UI with offline clusters`,
      { tags: ['managedclusters', 'clusteraddon'] },
      function () {
        let spoke = clusterTestData.addon.testCase.RHACM4K_1585.testData.clusterName
        clusterActions.shouldHaveManagedClusterForUser(spoke)
        clusterActions.addonShouldExists(spoke, 'work-manager')
        // The Addon status should be Unknown
        managedClusterDetailMethods.goToManagedClusterOverview(spoke)
        managedClusterDetailMethods.goToClusterAddons()
        managedClustersUIValidations.validateAddon(spoke, 'work-manager', 'Unknown')

        // clean up
        clusterActions.deleteManagedClusterForUser(spoke)
      }
    )
  }
)
