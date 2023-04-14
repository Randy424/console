/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import {
  managedClustersMethods,
  clusterStatus,
  clusterDeploymentPowerStatus,
} from '../../../support/action-utils/managedCluster'
import { rbacActions } from '../../../support/action-utils/rbac'
import { acm23xheaderMethods } from '../../../support/header'
import {
  clusterActions,
  clusterDeploymentActions,
  clusterMetricsActions,
} from '../../../support/action-utils/clusterAction'
import { commonPageMethods } from '../../../support/commonSelectors'

const spokeCluster = Cypress.env('SPOKE_CLUSTER')
const clcIDP = Cypress.env('CLC_OC_IDP')
const clcPass = Cypress.env('CLC_RBAC_PASS')
const clusterTestData = require('../../../fixtures/clusters/managedClustersTestData')

describe(
  'managedcluster rbac',
  {
    tags: ['@CLC', '@e2e'],
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  function () {
    before(function () {
      cy.setAPIToken()
    })

    it(
      `RHACM4K-929: CLC: As an user with cluster-wide-role-binding of open-cluster-management:cluster-manager-admin role, the user can create, read, update and delete resources displayed on "Clusters" page for all namespaces`,
      { tags: ['managedclusters', 'rbac', 'hive'] },
      function () {
        let clusterRolebinding = clusterTestData.rbac.testData.clusterRolebindingPrefix + '929'
        let managedClusterName = clusterTestData.rbac.testData.managedClusterPrefix + '929'
        rbacActions.shouldHaveClusterRolebindingForUser(
          clusterRolebinding,
          clusterTestData.rbac.testData.clusterAdminRole,
          clusterTestData.rbac.testData.clusterAdminUser
        )
        clusterActions.shouldHaveManagedClusterForUser(managedClusterName)

        cy.clearOCMCookies()
        cy.login(clusterTestData.rbac.testData.clusterAdminUser, clcPass, clcIDP)

        // Go to cluster page, the user should have permission to create cluster
        acm23xheaderMethods.goToClusters()

        // The user should have permission to hibernate cluster
        for (const spoke of spokeCluster.split(',')) {
          var hasHiveCluster = false
          clusterActions.checkHibernatableCluster(spoke).then((resp) => {
            if (resp && !hasHiveCluster) {
              managedClustersMethods.hibernateClusterByAction(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.WAIT_FOR_MACHINE_STOP
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.STOPPING)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.HIBERNATING
              )
              clusterMetricsActions.checkClusterMetrics(spoke, clusterStatus.HIBERNATING)
              managedClustersMethods.checkCluster(spoke, clusterStatus.HIBERNATING)
              // The user should have permission to resume cluster
              managedClustersMethods.resumeClusterByAction(spoke)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(
                spoke,
                clusterDeploymentPowerStatus.RESUME_OR_RUNNING
              )
              managedClustersMethods.checkCluster(spoke, clusterStatus.RESUMING)
              clusterDeploymentActions.checkClusterDeploymentPowerStatus(spoke, clusterDeploymentPowerStatus.RUNNING)
              clusterMetricsActions.checkClusterMetrics(spoke)
              managedClustersMethods.checkCluster(spoke, clusterStatus.READY)

              if (typeof Cypress.env('ACM_NAMESPACE') != 'undefined') {
                // The user should have permission to search the cluster
                managedClustersMethods.searchClusterByOptions(spoke)
              }

              // The user should have permission to edit the cluster label
              managedClustersMethods.editClusterLabelsByOptions(
                spoke,
                clusterTestData.rbac.testCase.RHACM4K_929.testData.clusterLabels
              )
              clusterActions.checkClusterLabels(spoke, clusterTestData.rbac.testCase.RHACM4K_929.testData.clusterLabels)
              hasHiveCluster = true
            }
          })
        }

        // The user should have permission to detach the cluster
        managedClustersMethods.detachCluster(managedClusterName)

        // clean up
        rbacActions.deleteClusterRolebinding(clusterRolebinding)
      }
    )

    it(
      `RHACM4K-973: CLC: As an user with cluster-wide-role-binding of "open-cluster-management:admin:managed-cluster-X" role and namespace-role-binding of "admin" role, the user can only read, update, detach, and delete managed-cluster-X on "Clusters" page`,
      { tags: ['managedclusters', 'rbac', 'hive'] },
      function () {
        let clusterRolebinding = clusterTestData.rbac.testData.clusterRolebindingPrefix + '973'
        let managedClusterName = clusterTestData.rbac.testData.managedClusterPrefix + '973'
        let roleBinding = clusterTestData.rbac.testData.rolebindingPrefix + '973'
        clusterActions.shouldHaveManagedClusterForUser(managedClusterName)

        rbacActions.shouldHaveClusterRolebindingForUser(
          clusterRolebinding,
          clusterTestData.rbac.testData.managedclusterAdminRolePrefix + managedClusterName,
          clusterTestData.rbac.testData.managedclusterAdminUser
        )
        rbacActions.shouldHaveRolebindingForUser(
          roleBinding,
          managedClusterName,
          'admin',
          clusterTestData.rbac.testData.managedclusterAdminUser
        )

        cy.clearOCMCookies()
        cy.login(clusterTestData.rbac.testData.managedclusterAdminUser, clcPass, clcIDP)

        // Go to cluster page, the user should not have permission to create cluster
        acm23xheaderMethods.goToClustersWithUser()

        // should have permission to read the cluster
        commonPageMethods.resourceTable.rowShouldExist(managedClusterName)

        // should have permission to update the cluster
        managedClustersMethods.editClusterLabelsByOptions(
          managedClusterName,
          clusterTestData.rbac.testCase.RHACM4K_973.testData.clusterLabels,
          'admin'
        )
        clusterActions.checkClusterLabels(
          managedClusterName,
          clusterTestData.rbac.testCase.RHACM4K_973.testData.clusterLabels
        )

        // should have permission to delete the cluster
        managedClustersMethods.detachCluster(managedClusterName, 'admin')

        // clean up
        rbacActions.deleteClusterRolebinding(clusterRolebinding)
        rbacActions.deleteRolebinding(roleBinding, managedClusterName)
      }
    )

    it(
      `RHACM4K-1005: CLC: As an user with cluster-wide-role-binding of "open-cluster-management:view:managed-cluster-X" role and namespace-role-binding of "view" role, the user can only read managed-cluster-X on "Clusters" page`,
      { tags: ['managedclusters', 'rbac', 'hive'] },
      function () {
        let clusterRolebinding = clusterTestData.rbac.testData.clusterRolebindingPrefix + '1005'
        let managedClusterName = clusterTestData.rbac.testData.managedClusterPrefix + '1005'
        let roleBinding = clusterTestData.rbac.testData.rolebindingPrefix + '1005'
        clusterActions.shouldHaveManagedClusterForUser(managedClusterName)

        rbacActions.shouldHaveClusterRolebindingForUser(
          clusterRolebinding,
          clusterTestData.rbac.testData.managedclusterViewRolePrefix + managedClusterName,
          clusterTestData.rbac.testData.managedclusterViewUser
        )
        rbacActions.shouldHaveRolebindingForUser(
          roleBinding,
          managedClusterName,
          'view',
          clusterTestData.rbac.testData.managedclusterViewUser
        )

        cy.clearOCMCookies()
        cy.login(clusterTestData.rbac.testData.managedclusterViewUser, clcPass, clcIDP)

        // Go to cluster page, the user should not have permission to create cluster
        acm23xheaderMethods.goToClustersWithUser()

        // should have permission to read the cluster
        commonPageMethods.resourceTable.rowShouldExist(managedClusterName)

        // should not have permission to update the cluster
        managedClustersMethods.editClusterLabelsByOptions(
          managedClusterName,
          clusterTestData.rbac.testCase.RHACM4K_973.testData.clusterLabels,
          'view'
        )

        // should not have permission to delete the cluster
        managedClustersMethods.detachCluster(managedClusterName, 'view')

        // clean up
        rbacActions.deleteClusterRolebinding(clusterRolebinding)
        rbacActions.deleteRolebinding(roleBinding, managedClusterName)
        clusterActions.deleteManagedClusterForUser(managedClusterName)
      }
    )

    it(
      'RHACM4K-16863: CLC: As a user with cluster-wide-role-binding of open-cluster-management:cluster-manager-admin role, the user can read the automation template during cluster import',
      { tags: ['managedclusters', 'rbac', 'hive'] },
      function () {
        let clusterRolebinding = clusterTestData.rbac.testData.clusterRolebindingPrefix + '16863'
        let managedClusterName = clusterTestData.rbac.testData.managedClusterPrefix + '16863'
        rbacActions.shouldHaveClusterRolebindingForUser(
          clusterRolebinding,
          clusterTestData.rbac.testData.clusterAdminRole,
          clusterTestData.rbac.testData.clusterAdminUser
        )
        clusterActions.shouldHaveManagedClusterForUser(managedClusterName)

        cy.clearOCMCookies()
        cy.login(clusterTestData.rbac.testData.clusterAdminUser, clcPass, clcIDP)

        // The user should have permission to read the automation template during cluster import
        managedClustersMethods.checkAutomationPageforImport()

        // clean up
        rbacActions.deleteClusterRolebinding(clusterRolebinding)
        clusterActions.deleteManagedClusterForUser(managedClusterName)
      }
    )
  }
)
