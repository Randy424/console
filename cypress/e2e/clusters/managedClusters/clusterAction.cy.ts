/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import {
  managedClusterDetailMethods,
  managedClustersMethods,
} from '../../../support/action-utils/managedcluster/managedCluster'
import { clusterActions } from '../../../support/action-utils/clusterAction'
import { credentialsCreateMethods } from '../../../support/action-utils/credentials-actions'
import { acm23xheaderMethods } from '../../../support/header'

import * as cluster from '../../../support/api-utils/cluster-api'
import * as credentialsAPI from '../../../support/api-utils/credentials-api'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))
const spokeCluster = Cypress.env('SPOKE_CLUSTER')
const clusterTestData = require('../../../fixtures/clusters/managedClustersTestData')

describe(
  'cluster actions',
  {
    tags: ['@CLC', '@e2e'],
  },
  function () {
    before(function () {
      // cy.clearOCMCookies()
      cy.login()
      cy.visit('/multicloud/infrastructure/')
    })

    it(
      `RHACM4K-21205: CLC: As a user, I can visit the console of an ACM managed OCP cluster from the managed cluster overview`,
      { tags: ['managedclusters', 'clusteraction', '@ocpInterop', '@post-release'] },
      function () {
        for (const spoke of spokeCluster.split(',')) {
          clusterActions.checkOCPCluster(spoke).then((resp) => {
            if (resp) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              cluster.getManagedClusterInfo(spoke).then((resp: any) => {
                var consoleURL = resp.status.consoleURL
                cy.get(
                  ':nth-child(2) > .pf-c-description-list__description > .pf-c-description-list__text > .pf-c-button'
                )
                  .invoke('text')
                  .then((txt) => {
                    expect(txt).contain(`${consoleURL}`)
                    cy.request(txt).then((resp) => {
                      expect(resp.status).to.eq(200)
                    })
                  })
              })
            }
          })
        }
      }
    )
    it(
      `RHACM4K-1587: CLC: Cluster lifecycle - actions - search cluster`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        //TODO: refactor -> failure conditions?
        if (typeof Cypress.env('ACM_NAMESPACE') != 'undefined') {
          for (const spoke of spokeCluster.split(',')) {
            cluster.getManagedCluster(spoke).then((mc) => {
              if (mc.isOkStatusCode) managedClustersMethods.searchClusterByOptions(spoke)
            })
          }
        } else {
          this.skip()
        }
      }
    )
    it(
      `RHACM4K-1737: CLC: Cluster lifecycle - actions - check labels of managed cluster for matching cluster info`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        //TODO: refactor -> failure conditions?
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            if (mc.isOkStatusCode) {
              managedClusterDetailMethods.goToManagedClusterOverview(spoke)
              clusterActions.getClusterLabels(spoke).then((resp) => {
                for (var key of Object.keys(resp)) {
                  managedClusterDetailMethods.findLabel(key + '=' + resp[`${key}`])
                }
              })
            }
          })
        }
      }
    )
    it(
      `RHACM4K-1588: CLC: Cluster lifecycle - actions - edit labels`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        //TODO: refactor -> failure conditions?
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            if (mc.isOkStatusCode) {
              managedClustersMethods.editClusterLabelsByOptions(
                spoke,
                clusterTestData.action.testCase.RHACM4K_1588.testData.clusterlabels
              )
              clusterActions.checkClusterLabels(
                spoke,
                clusterTestData.action.testCase.RHACM4K_1588.testData.clusterlabels
              )
            }
          })
        }
      }
    )
    it(
      `RHACM4K-8321: CLC: Cluster lifecycle - actions - as admin, when I update the cluster build-in label, the build-in label should able to recovered`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        //TODO: refactor -> failure conditions?
        cy.log('executing 1')
        for (const spoke of spokeCluster.split(',')) {
          cluster.getManagedCluster(spoke).then((mc) => {
            if (mc.isOkStatusCode) {
              managedClustersMethods.removeClusterLabelsByOptions(spoke, 'name')
              clusterActions.checkClusterLabels(spoke, 'name=' + spoke)
            }
          })
        }
      }
    )
    it(
      `RHACM4K-8322: CLC: Create Cluster - When I switch the credentials during create the cluster, the cluster info should be updated based on the new credential context`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        // Not sure why, but we are removed from previous session at start of this spec
        // cy.visit('/multicloud/infrastructure/')
        // Create 2 creds with different context here
        // TODO(Hui), we current only use the AWS here to check the domain, but it's better to handle all of cloud provider here.
        // Create the first credentials

        // TODO: (Randy) we can refactor addCredentials to leverage fixtures/cy.exec commands. This will save time.
        options.connections.apiKeys.aws.name = 'aws-conn-auto-8322-1'
        options.connections.apiKeys.aws.baseDnsDomain = 'clc1.test'
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })
        // Create the second credentials
        options.connections.apiKeys.aws.name = 'aws-conn-auto-8322-2'
        options.connections.apiKeys.aws.baseDnsDomain = 'clc2.test'
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })

        // on create cluster page, check the credentials context
        cy.visit('/multicloud/infrastructure/clusters/managed')
        managedClustersMethods.clickCreate()
        // Open the Edit by Yaml
        managedClustersMethods.fillInfrastructureProviderDetails(options.connections.apiKeys.aws.provider)

        cy.get('#connection-label input').click()
        cy.get('li').contains('aws-conn-auto-8322-1').click()
        cy.get('#baseDomain').should('contain.value', 'clc1.test')
        cy.get('#connection-label input').click()
        cy.get('li').contains('aws-conn-auto-8322-2').click()
        cy.get('#baseDomain').should('contain.value', 'clc2.test')

        // Clean up
        credentialsAPI.deleteCredentials('aws-conn-auto-8322-1', options.connections.apiKeys.aws.namespace)
        credentialsAPI.deleteCredentials('aws-conn-auto-8322-2', options.connections.apiKeys.aws.namespace)
      }
    )
    it(
      `RHACM4K-10414: CLC: As an user, I can set the FIPS flags when I provision the cluster on ACM portal`,
      { tags: ['managedclusters', 'clusteraction'] },
      function () {
        //TODO: refactor -> failure conditions?
        // Enable the FIPS, the FIPS should be true in review page
        // acm23xheaderMethods.goToClusters()
        // managedClustersMethods.clickCreate()
        cy.visit('/multicloud/infrastructure/clusters/create')

        managedClustersMethods.fillInfrastructureProviderDetails(options.connections.apiKeys.aws.provider)
        managedClustersMethods.fillClusterDetails(
          '',
          'validate-fips-on-ui',
          '',
          options.clusters.aws.releaseImage,
          '',
          '',
          true
        )
        // Go to review page to check the value
        cy.get('button[id="review"]').click()
        // the value should shows true in review creation page.
        cy.get('dt:contains("FIPS")')
          .next()
          .invoke('text')
          .then((txt) => {
            expect(txt).to.be.eq('true')
          })

        // Disable the FIPS, the FIPS should be false in review page
        acm23xheaderMethods.goToClusters()
        managedClustersMethods.clickCreate()
        managedClustersMethods.fillInfrastructureProviderDetails(options.connections.apiKeys.aws.provider)
        managedClustersMethods.fillClusterDetails(
          '',
          'validate-fips-on-ui',
          '',
          options.clusters.aws.releaseImage,
          '',
          '',
          ''
        )
        // Go to review page to check the value
        cy.get('button[id="review"]').click()
        // the value should shows true in review creation page.
        cy.get('dt:contains("FIPS")')
          .next()
          .invoke('text')
          .then((txt) => {
            expect(txt).to.be.eq('false')
          })
      }
    )
  }
)
