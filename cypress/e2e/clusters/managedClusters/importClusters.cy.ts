/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import {
  managedClustersMethods,
  clusterStatus,
  clusterType,
  cloudType,
  addonLabel,
  addonLabelStatus,
} from '../../../support/action-utils/managedCluster'
import { clusterSetActions } from '../../../support/action-utils/clusterSetAction'
import { clusterMetricsActions } from '../../../support/action-utils/clusterAction'
import { YAML } from 'yamljs'

const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))
const fixturesDirectory = 'importClusters/'
const clusterOwner = 'acmqe-clc-auto'
const clusterOwnerLabel = 'owner=' + clusterOwner
const clusterSetImports = 'clc-automation-imports'

var fs = require('fs')

describe(
  'import clusters',
  {
    tags: ['@CLC', '@import'],
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.login() // login through api instead
      cy.setAPIToken().then(() => clusterSetActions.createClusterSet(clusterSetImports))
      // set cluster name if requested in options? solo import
    })

    // import eks cluster with kubeconfig
    it(
      'RHACM4K-4053: CLC: Import - Verify that user can import EKS cluster with latst k8s version by kubeconfig',
      { tags: ['eks', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-eks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-eks.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.EKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AWS)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import eks cluster with server token/api
    it(
      'RHACM4K-4060: CLC: Import - Verify that user can import EKS cluster with latest k8s version by API Token',
      { tags: ['eks', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-eks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-eks.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.EKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AWS)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import gke cluster with kubeconfig
    it(
      'RHACM4K-4055: CLC: Import - Verify that user can import GKE cluster with latst k8s version by kubeconfig',
      { tags: ['gke', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-gcp.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-gcp.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.GKE)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.GCP)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import gke cluster with server token/api
    it(
      'RHACM4K-4062: CLC: Import - Verify that user can import GKE cluster with latest k8s version by API Token',
      { tags: ['gke', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-gcp.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-gcp.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.GKE)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.GCP)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import aks cluster with kubeconfig
    it(
      'RHACM4K-4054: CLC: Import - Verify that user can import AKS cluster with latst k8s version by kubeconfig',
      { tags: ['aks', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-aks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-aks.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.AKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AZURE)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import aks cluster with server token/api
    it(
      'RHACM4K-4061: CLC: Import - Verify that user can import AKS cluster with latest k8s version by API Token',
      { tags: ['aks', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-aks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-aks.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.AKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AZURE)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import iks cluster with kubeconfig
    it(
      'RHACM4K-4052: CLC: Import - Verify that user can import IKS cluster with latst k8s version by kubeconfig',
      { tags: ['iks', 'managedclusters', 'kubeconfig', '@ocpInterop', '@post-release'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-iks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-iks.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.IKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.IBM)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import IKS cluster with token/api
    it(
      'RHACM4K-4051: CLC: Import - Verify that user can import IKS cluster with latest k8s version using URL and API token',
      { tags: ['iks', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-iks-ibmapi.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-iks-ibmapi.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.IKS)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.IBM)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ROKS cluster with kubeconfig
    it(
      'RHACM4K-4056: CLC: Import - Verify that user can import ROKS cluster with latst k8s version by kubeconfig',
      { tags: ['roks', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-roks.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-roks.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.IBM)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ROKS cluster with token/api
    it(
      'RHACM4K-4063: CLC: Import - Verify that user can import ROKS cluster with latest k8s version by API Token',
      { tags: ['roks', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-roks-ibmapi.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-roks-ibmapi.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.IBM)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ROSA cluster with kubeconfig
    it(
      'RHACM4K-4057: CLC: Import - Verify that user can import ROSA cluster with latst k8s version by kubeconfig',
      { tags: ['rosa', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-rosa.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-rosa.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',product=ROSA',
              importData
            )
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AWS)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.clusterclaimExists(clusterName, 'product.open-cluster-management.io=ROSA')
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ROSA cluster with server token/api
    it(
      'RHACM4K-4064: CLC: Import - Verify that user can import ROSA cluster with latest k8s version by API Token',
      { tags: ['rosa', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-rosa.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-rosa.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',product=ROSA',
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AWS)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.clusterclaimExists(clusterName, 'product.open-cluster-management.io=ROSA')
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ARO cluster with kubeconfig
    it(
      'RHACM4K-14159: CLC: Import - Verify that user can import ARO cluster with latest k8s version by kubeconfig',
      { tags: ['aro', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-aro.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-aro.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',product=ARO',
              importData
            )
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AZURE)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.clusterclaimExists(clusterName, 'product.open-cluster-management.io=ARO')
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ARO cluster with server token/api
    it(
      'RHACM4K-4066: CLC: Import - Verify that user can import ARO cluster with latest k8s version using URL and API token',
      { tags: ['aro', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-aro.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-aro.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',product=ARO',
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'cloud', cloudType.AZURE)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.clusterclaimExists(clusterName, 'product.open-cluster-management.io=ARO')
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import RHV cluster with kubeconfig
    it(
      'RHACM4K-7001: CLC: Import - Verify that user can import RHV cluster, by uploading kubeconfig file of the existing cluster',
      { tags: ['rhv', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /^rhv-kubeconfig/.test(value))
          let clusterName = options.clusters.clusterNamePrefix + '-rhv-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.RHV)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import RHV cluster with kubeconfig
    it(
      'RHACM4K-7000: CLC: Import - Verify that user can import RHV cluster using URL and API token',
      { tags: ['rhv', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /^rhv-kubeconfig/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /^rhv-kubeconfig/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.RHV)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import OCP311 cluster with kubeconfig
    it(
      'RHACM4K-4059: CLC: Import - Verify that user can import OCP311 cluster by kubeconfig',
      { tags: ['ocp311', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-ocp311.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-ocp311.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(clusterName, clusterSetImports, clusterOwnerLabel, importData)
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'openshiftVersion', '3')
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import OCP311 cluster with api&token
    it(
      'RHACM4K-4302: CLC: Import - Verify that user can import OCP311 cluster using URL and API token',
      { tags: ['ocp311', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-ocp311.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-ocp311.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel,
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'openshiftVersion', '3')
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ARM cluster with kubeconfig
    it(
      'RHACM4K-11349: CLC: Import - Verify that user can import ARM cluster with latest k8s version by kubeconfig',
      { tags: ['arm', 'managedclusters', 'kubeconfig'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-arm.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-arm.kubeconfig$/.test(value))
              .split('.')[0] + '-kubeconfig'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            managedClustersMethods.importCluster(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',architecture=ARM',
              importData
            )
            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )

    // import ARM cluster with api&token
    it(
      'RHACM4K-11348: CLC: Import - Verify that user can import ARM cluster with latest k8s version using URL and API token',
      { tags: ['arm', 'managedclusters', 'token'] },
      function () {
        cy.exec('ls cypress/fixtures/importClusters/').then((result) => {
          let fileName = result.stdout.split('\n').find((value) => /-arm.kubeconfig$/.test(value))
          let clusterName =
            result.stdout
              .split('\n')
              .find((value) => /-arm.kubeconfig$/.test(value))
              .split('.')[0] + '-token'
          cy.fixture(fixturesDirectory + fileName).then((importData) => {
            const nativeObject = YAML.parse(importData)
            managedClustersMethods.importClusterToken(
              clusterName,
              clusterSetImports,
              clusterOwnerLabel + ',architecture=ARM',
              nativeObject.clusters[0].cluster.server,
              nativeObject.users[0].user.token
            )

            managedClustersMethods.checkClusterImportStatus(clusterName)
            managedClustersMethods.clusterLabelExists(clusterName, 'vendor', clusterType.OPENSHIFT)
            managedClustersMethods.clusterLabelExists(clusterName, 'owner', clusterOwner)
            managedClustersMethods.clusterLabelExists(clusterName, addonLabel.WORK_MANAGE, addonLabelStatus.AVAILABLE)
            managedClustersMethods.checkCluster(clusterName, clusterStatus.READY)
            clusterMetricsActions.checkClusterMetrics(clusterName)
          })
        })
      }
    )
  }
)
