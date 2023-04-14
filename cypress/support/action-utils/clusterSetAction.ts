/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import {
  getClusterSet,
  deleteClusterSet,
  createClusterSet,
  getNamespaceBinding,
  createClusterSetv1beta1,
  getClusterSetv1beta1,
} from '../api-utils/clusterSet'
import { getManagedCluster, updateManagedCluster } from '../api-utils/cluster-api'

export const clusterSetActions = {
  /**
   * Create the clusterset
   * @param {string} clusterSet
   * @param {string} version
   */
  createClusterSet: (clusterSet, version) => {
    if (version && version == 'v1beta1') {
      getClusterSetv1beta1(clusterSet).then((resp) => {
        if (resp.status == 404) {
          createClusterSetv1beta1(clusterSet).then((resp) => {
            cy.failOnErrorResponseStatus(resp, 'Failed to create ClusterSet via v1beta1 API')
          })
        } else cy.log('ClusterSet already exists, Skipping ClusterSet creation.')
      })
    } else {
      getClusterSet(clusterSet).then((resp) => {
        if (resp.status == 404) {
          createClusterSet(clusterSet).then((resp) => {
            cy.failOnErrorResponseStatus(resp, 'Failed to create ClusterSet via API')
          })
        } else cy.log('ClusterSet already exists, Skipping ClusterSet creation.')
      })
    }
  },

  /**
   * Delete the clusterset
   * @param {string} clusterSet
   */
  deleteClusterSet: (clusterSet) => {
    getClusterSet(clusterSet).then((resp) => {
      if (resp.status == 200) {
        deleteClusterSet(clusterSet).then((resp) => {
          cy.failOnErrorResponseStatus(resp, 'Failed to delete ClusterSet via API')
        })
      } else cy.log('ClusterSet not exists, Skipping deleting ClusterSet.')
    })
  },

  /**
   * Reset the clusterset used to reset the clusterset in managedcluster to specify clusterset
   * @param {string} clusterName
   * @param {string} clusterSet
   */
  resetClusterset: (clusterName, clusterSet) => {
    getManagedCluster(clusterName).then((mcResp) => {
      if (mcResp.isOkStatusCode) {
        let requestBody = `{"metadata":{"labels":{"cluster.open-cluster-management.io/clusterset":${clusterSet}}}}}`
        updateManagedCluster(clusterName, requestBody).then((resp) => expect(resp.isOkStatusCode))
      }
    })
  },

  /**
   * Used to make sure the cluster was exists in 30s
   * @param {string} clusterSet
   */
  clusterSetShouldExist: (clusterSet) => {
    cy.log('Make sure the clusterset exist')
    cy.waitUntil(
      () => {
        return getClusterSet(clusterSet).then((resp) => {
          return resp.status == 200
        })
      },
      {
        interval: 5 * 1000,
        timeout: 300 * 1000,
      }
    )
  },
}

export const namespaceBindingActions = {
  /**
   * Check the namespace binding in namespace
   * @param {string} clusterSet
   * @param {string} namespace
   * @param {boolean} exist
   */
  checkNamespaceBinding: (clusterSet, namespace, exist) => {
    if (exist) {
      getNamespaceBinding(clusterSet, namespace).then((resp) => {
        expect(resp.status).to.be.eq(200)
        expect(resp.body.metadata.name).to.be.eq(clusterSet)
      })
    } else {
      getNamespaceBinding(clusterSet, namespace).then((resp) => {
        expect(resp.status).to.be.eq(404)
      })
    }
  },
}
