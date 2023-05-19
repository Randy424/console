/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import * as cluster from '../../../support/api-utils/cluster-api'

const clusterOwner = 'acmqe-clc-auto'
const clusterOwnerLabel = 'owner=' + clusterOwner

describe(
  'detach clusters',
  {
    tags: ['@CLC', '@detach'],
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  function () {
    before(function () {
      cy.clearOCMCookies()

      cy.login()
    })

    it('RHACM4K-878: CLC: Detach ROKS with latest OCP version', { tags: ['roks', 'managedclusters'] }, function () {
      // detach ROKS clusters
      cluster.getManagedClusters('vendor=OpenShift,cloud=IBM,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it('RHACM4K-1485: CLC: Detach EKS with latest kube version', { tags: ['eks', 'managedclusters'] }, function () {
      // detach EKS clusters
      cluster.getManagedClusters('vendor=EKS,cloud=Amazon,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it('RHACM4K-1486: CLC: Detach AKS with latest kube version', { tags: ['aks', 'managedclusters'] }, function () {
      // detach AKS clusters
      cluster.getManagedClusters('vendor=AKS,cloud=Azure,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it('RHACM4K-1487: CLC: Detach GKE with latest kube version', { tags: ['gke', 'managedclusters'] }, function () {
      // detach GKE clusters
      cluster.getManagedClusters('vendor=GKE,cloud=Google,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it(
      'RHACM4K-1488: CLC: Detach IKS with latest kube version',
      { tags: ['iks', 'managedclusters', '@ocpInterop', '@post-release'] },
      function () {
        // detach IKS clusters
        cluster.getManagedClusters('vendor=IKS,cloud=IBM,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (const cluster of resp.body.items) {
              managedClustersMethods.detachCluster(cluster.metadata.name)
            }
          } else {
            this.skip()
          }
        })
      }
    )
    it('RHACM4K-1500: CLC: Detach OCP311 Managed Clusters', { tags: ['ocp311', 'managedclusters'] }, function () {
      cluster.getManagedClusters('vendor=OpenShift,openshiftVersion=3,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it('RHACM4K-11350: CLC: Detach ARM with latest kube version', { tags: ['arm', 'managedclusters'] }, function () {
      cluster
        .getManagedClusters('vendor=OpenShift,architecture=ARM,name!=local-cluster,' + clusterOwnerLabel)
        .then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (const cluster of resp.body.items) {
              managedClustersMethods.detachCluster(cluster.metadata.name)
            }
          } else {
            this.skip()
          }
        })
    })
    it('RHACM4K-11606: CLC: Detach RHV managed cluster via the UI', { tags: ['rhv', 'managedclusters'] }, function () {
      // detach RVH clusters
      cluster.getManagedClusters('vendor=OpenShift,cloud=RHV,name!=local-cluster,' + clusterOwnerLabel).then((resp) => {
        if (resp.isOkStatusCode && resp.body.items.length > 0) {
          for (const cluster of resp.body.items) {
            managedClustersMethods.detachCluster(cluster.metadata.name)
          }
        } else {
          this.skip()
        }
      })
    })
    it(
      'RHACM4K-12081: CLC: Detach ROSA with latest Openshift version',
      { tags: ['rosa', 'managedclusters'] },
      function () {
        // detach ROSA clusters
        cluster
          .getManagedClusters('vendor=OpenShift,cloud=Amazon,name!=local-cluster,product=ROSA,' + clusterOwnerLabel)
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (const cluster of resp.body.items) {
                managedClustersMethods.detachCluster(cluster.metadata.name)
              }
            } else {
              this.skip()
            }
          })
      }
    )
    it(
      'RHACM4K-12082: CLC: Detach ARO with latest Openshift version',
      { tags: ['aro', 'managedclusters'] },
      function () {
        // detach ARO clusters
        cluster
          .getManagedClusters('vendor=OpenShift,cloud=Azure,name!=local-cluster,product=ARO,' + clusterOwnerLabel)
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (const cluster of resp.body.items) {
                managedClustersMethods.detachCluster(cluster.metadata.name)
              }
            } else {
              this.skip()
            }
          })
      }
    )
    it(
      'RHACM4K-12084: CLC: Detach OSD with latest Openshift version',
      { tags: ['osd', 'managedclusters'] },
      function () {
        // detach OSD clusters
        cluster
          .getManagedClusters('vendor=OpenShift,product=OSD,name!=local-cluster,' + clusterOwnerLabel)
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (const cluster of resp.body.items) {
                managedClustersMethods.detachCluster(cluster.metadata.name)
              }
            } else {
              this.skip()
            }
          })
      }
    )
  }
)
