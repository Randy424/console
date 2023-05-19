/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { managedClustersMethods } from '../../../support/action-utils/managedcluster/managedCluster'
import { clusterActions } from '../../../support/action-utils/clusterAction'
import * as cluster from '../../../support/api-utils/cluster-api'
import * as kube from '../../../support/api-utils/kube'

describe(
  'destroy clusters ',
  {
    tags: ['@CLC', '@destroy'],
  },
  function () {
    before(function () {
      cy.clearOCMCookies()
      cy.login()
    })

    // destroy AWS cluster
    it(
      `RHACM4K-7477: CLC: Destroy an AWS managed cluster via the UI`,
      { tags: ['aws', 'managedclusters', '@ocpInterop', '@post-release'] },
      function () {
        cluster
          .getManagedClusters('cloud=Amazon,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )

    // destroy GCP cluster
    it(
      `RHACM4K-7478: CLC: Destroy a GCP managed cluster via the UI`,
      { tags: ['gcp', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('cloud=Google,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )

    // destroy AZURE cluster
    it(
      `RHACM4K-7479: CLC: Destroy an Azure managed cluster via the UI`,
      { tags: ['azure', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters(
            'cloud=Azure,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno,clc-cluster-type!=qe-government'
          )
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )

    // destroy AZURE Government cluster
    it(
      `RHACM4K-8109: CLC: Destroy an Azure Government managed cluster via the UI`,
      { tags: ['azgov', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('cloud=Azure,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type=qe-government')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )

    // destroy VMware cluster
    it(
      `RHACM4K-7821: CLC: Destroy a VMWare managed cluster via the UI`,
      { tags: ['vmware', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('cloud=VMware,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )

    // destroy Openstack cluster
    it(
      `RHACM4K-3304: CLC: Destroy an Openstack managed cluster via the UI`,
      { tags: ['openstack', 'managedclusters'] },
      function () {
        cluster
          .getManagedClusters('cloud=OpenStack,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno')
          .then((resp) => {
            if (resp.isOkStatusCode && resp.body.items.length > 0) {
              for (let cluster of resp.body.items) {
                clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                  if (isHive) {
                    managedClustersMethods.destroyCluster(cluster.metadata.name)
                    kube.checkNamespaceDeleted(cluster.metadata.name)
                  }
                })
              }
            }
          })
      }
    )
    // destroy RHV cluster
    it(`RHACM4K-11154 - Destroy a RHV managed cluster via the UI`, { tags: ['rhv', 'managedclusters'] }, function () {
      cluster
        .getManagedClusters('cloud=RHV,name!=local-cluster,owner=acmqe-clc-auto,clc-cluster-type!=qe-sno')
        .then((resp) => {
          if (resp.isOkStatusCode && resp.body.items.length > 0) {
            for (let cluster of resp.body.items) {
              clusterActions.checkHiveCluster(cluster.metadata.name).then((isHive) => {
                if (isHive) {
                  managedClustersMethods.destroyCluster(cluster.metadata.name)
                  kube.checkNamespaceDeleted(cluster.metadata.name)
                }
              })
            }
          }
        })
    })
  }
)
