/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import {
  managedClustersMethods,
  managedClustersUIValidations,
} from '../../../support/action-utils/managedcluster/managedCluster'
import * as cluster from '../../../support/api-utils/cluster-api'

describe(
  'local-cluster validation',
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
      `RHACM4K-8634: CLC: validate the local-cluster status after the ACM was installed with local-cluster imported`,
      { tags: ['managedclusters', 'local-cluster'] },
      function () {
        // Check if the local-cluster exists
        cluster.getManagedCluster('local-cluster').then((resp) => {
          if (resp.status == 404) this.skip()
          else {
            // Check the local-cluster status
            managedClustersMethods.checkCluster('local-cluster', 'Ready')
            // Check the local-cluster addon status
            managedClustersUIValidations.validateAddons('local-cluster')
          }
        })
      }
    )
  }
)
