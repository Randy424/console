/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { acm23xheaderMethods } from '../../../support/header'
import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import { credentialsCreateMethods } from '../../../support/action-utils/credentials-actions'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

describe(
  'cluster imageset',
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
      `RHACM4K-2576: CLC: Verify that only n, n-1, n-2 and/or n+1 ocp versions are visible in "Release Images" section on cluster details page`,
      { tags: ['managedclusters', 'clusterImage'] },
      function () {
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })
        acm23xheaderMethods.goToClusters()
        managedClustersMethods.clickCreate()
        managedClustersMethods.fillInfrastructureProviderDetails(options.connections.apiKeys.aws.provider)
        managedClustersMethods.validateSupportedReleaseImages()
      }
    )
  }
)
