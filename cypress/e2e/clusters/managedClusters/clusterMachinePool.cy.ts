/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { managedClusterDetailMethods } from '../../../support/action-utils/managedCluster'
import { machinePoolActions } from '../../../support/action-utils/clusterAction'

import { getMachinePools } from '../../../support/api-utils/hive'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')

describe(
  'cluster machinepool',
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

    it(
      `RHACM4K-4144: CLC: Machine pools - Verify that user can scale up machine pools for a hive cluster`,
      { tags: ['managedclusters', 'machinepool'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          machinePoolActions.checkMachinePool(spoke).then((mpResp) => {
            if (mpResp) managedClusterDetailMethods.scaleMachinePool(spoke, 'up')
          })
        }
      }
    )
    it(
      `RHACM4K-4148: CLC: Machine pools - Verify that user can scale 'down' machine pools for a hive cluster`,
      { tags: ['managedclusters', 'machinepool'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          machinePoolActions.checkMachinePool(spoke).then((mpResp) => {
            if (mpResp) managedClusterDetailMethods.scaleMachinePool(spoke, 'down')
          })
        }
      }
    )
    it(
      `RHACM4K-4151: CLC: Machine pools - Verify that user can enable 'autoscale' on machine pools for hive cluster`,
      { tags: ['managedclusters', 'machinepool'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          getMachinePools(spoke).then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              machinePoolActions.checkAutoScaling(resp.body.items[0].metadata.name, spoke).then((scaleResp) => {
                if (!scaleResp) managedClusterDetailMethods.autoScaleMachinePool(spoke, 'Enable')
              })
            }
          })
        }
      }
    )
    it(
      `RHACM4K-4152: CLC: Machine pools - Verify that user can edit 'autoscale' on machine pools for hive cluster`,
      { tags: ['managedclusters', 'machinepool'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          getMachinePools(spoke).then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              machinePoolActions.checkAutoScaling(resp.body.items[0].metadata.name, spoke).then((scaleResp) => {
                if (scaleResp) managedClusterDetailMethods.editAutoScaleMachinePool(spoke, 'up')
              })
            }
          })
        }
      }
    )
    it(
      `RHACM4K-4153: CLC: Machine pools - Verify that user can disable 'autoscale' on machine pools for hive cluster`,
      { tags: ['managedclusters', 'machinepool'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          getMachinePools(spoke).then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              machinePoolActions.checkAutoScaling(resp.body.items[0].metadata.name, spoke).then((scaleResp) => {
                if (scaleResp) managedClusterDetailMethods.autoScaleMachinePool(spoke, 'Disable')
              })
            }
          })
        }
      }
    )
  }
)
