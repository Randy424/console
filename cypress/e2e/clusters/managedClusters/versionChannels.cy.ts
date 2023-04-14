/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { managedClusterDetailMethods } from '../../../support/action-utils/managedCluster'
import { clusterActions } from '../../../support/action-utils/clusterAction'
import * as cluster from '../../../support/api-utils/cluster-api'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')

describe(
  'version channel specific tests',
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
      `RHACM4K-4201: CLC: Version Channels - Verify only n, n+1 channel versions are available to change to`,
      { tags: ['managedclusters', 'channels'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          var hasHiveCluster = false
          clusterActions.checkHiveCluster(spoke).then((resp) => {
            if (resp && !hasHiveCluster) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              cluster.getManagedClusterInfo(spoke).then((resp) => {
                let currentVersion = resp.status.distributionInfo.ocp.channel
                let majorVer = currentVersion.split('-')[1].split('.')[0]
                let minorVer = currentVersion.split('-')[1].split('.')[1]
                let channel_list = resp.status.distributionInfo.ocp.desired.channels
                managedClusterDetailMethods.getCurrentChannel().should('equal', currentVersion)
                if (Array.isArray(channel_list) && channel_list.length) {
                  let newVer = Number(minorVer) + 1
                  managedClusterDetailMethods.clickEditChannels()
                  managedClusterDetailMethods.getNewChannelButton().click()
                  managedClusterDetailMethods.getNewChannelDropdownButton(spoke).each(($availableChannel) => {
                    var re = new RegExp('^stable-|fast-|candidate-|eus-' + majorVer + '|' + newVer)
                    if (!re.test($availableChannel.text()))
                      throw new Error(
                        'unexpected available channel found: ' +
                          $availableChannel.text() +
                          ' for OCP version ' +
                          currentVersion
                      )
                  })
                }
              })
            }
            hasHiveCluster = true
          })
        }
      }
    )

    it(
      `RHACM4K-4171: CLC: Version Channels - Edit Channel Version from Managed Cluster Page`,
      { tags: ['managedclusters', 'channels'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          var hasHiveCluster = false
          clusterActions.checkHiveCluster(spoke).then((resp) => {
            if (resp && !hasHiveCluster) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              cluster.getManagedClusterInfo(spoke).then((resp) => {
                let currentVersion = resp.status.distributionInfo.ocp.channel
                let channel_list = resp.status.distributionInfo.ocp.desired.channels
                if (Array.isArray(channel_list) && channel_list.length) {
                  managedClusterDetailMethods.clickEditChannels()
                  managedClusterDetailMethods.getNewChannelButton().click()
                  managedClusterDetailMethods.getNewChannelDropdownButton(spoke).then(($newChannels) => {
                    let newChannel
                    if (
                      $newChannels.eq(0).text() === currentVersion &&
                      $newChannels.eq(0).text() != $newChannels.eq(1).text()
                    ) {
                      newChannel = $newChannels.eq(1)
                    } else newChannel = $newChannels.eq(2)
                    newChannel.trigger('click')
                    managedClusterDetailMethods.saveNewChannel()
                    managedClusterDetailMethods
                      .getCurrentChannel()
                      .should('be.oneOf', ['Selecting ' + newChannel.text(), newChannel.text()])
                  })
                }
              })
              hasHiveCluster = true
            }
          })
        }
      }
    )
  }
)
