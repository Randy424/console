/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import * as cluster from '../api-utils/cluster-api'
import * as hive from '../api-utils/hive'
import * as metrics from '../api-utils/metrics'
import * as kube from '../api-utils/kube'

export const clusterActions = {
  /**
   * Generate the kubeconfig and persisten into the assets path
   * @param {E} clusterName
   */
  extractClusterKubeconfig: (clusterName) => {
    clusterDeploymentActions.getKubeConfigFromClusterDeployment(clusterName).then((kubeObj) => {
      cy.writeFile(`cypress/assets/${clusterName}.kubeconfig`, kubeObj)
    })
  },

  /**
   * Create the managedcluster.
   * @param {string} clusterName
   */
  shouldHaveManagedClusterForUser: (clusterName) => {
    cluster.getManagedCluster(clusterName).then((resp) => {
      if (!resp.isOkStatusCode) {
        let request_body = `
{
"kind": "ManagedCluster",
"apiVersion": "cluster.open-cluster-management.io/v1",
"metadata": {
    "name": "${clusterName}",
    "labels": {
        "cloud": "AWS",
        "name": "${clusterName}"
    }
},
"spec": {
    "hubAcceptsClient": true,
    "leaseDurationSeconds": 60
}
}`
        cluster.createManagedCluster(request_body)
      }
    })
  },

  /**
   * Create the managedcluster and assign the managedcluster to the clusterSet.
   * @param {string} clusterName
   * @param {string} clusterSet
   */
  shouldHaveManagedClusterWithClusterSetForUser: (clusterName, clusterSet) => {
    cluster.getManagedCluster(clusterName).then((resp) => {
      if (resp.status == 200) {
        // the cluster exists, need to remove first
        clusterActions.deleteManagedClusterForUser(clusterName)
      }
      let request_body = `
{
"kind": "ManagedCluster",
"apiVersion": "cluster.open-cluster-management.io/v1",
"metadata": {
    "name": "${clusterName}",
    "labels": {
        "cloud": "AWS",
        "name": "${clusterName}",
        "cluster.open-cluster-management.io/clusterset": "${clusterSet}"
    }
},
"spec": {
    "hubAcceptsClient": true,
    "leaseDurationSeconds": 60
}
}`
      cluster.createManagedCluster(request_body)
    })
  },

  /**
   * Delete the managedcluster.
   * @param {string} clusterName
   */
  deleteManagedClusterForUser: (clusterName) => {
    cluster.deleteManagedCluster(clusterName).then((resp) => expect(resp.isOkStatusCode))
    clusterActions.waitManagedClusterRemoved(clusterName)
  },

  /**
   * wait for managed cluster CR deleted in 300s
   * @param {*} clusterName
   */
  waitManagedClusterRemoved: (clusterName) => {
    cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          return resp.status === 404
        })
      },
      {
        errorMsg: 'The managed cluster ' + clusterName + ' was under deleting',
        interval: 10 * 1000,
        timeout: 300 * 1000,
      }
    )
  },

  /**
   * Check if the lables exists on the managedcluster
   * @param {string} clusterName
   * @param {string} labels
   */
  checkClusterLabels: (clusterName, labels) => {
    cy.log('Check the managed cluster labels')
    cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          var exist = false
          if (resp.body['metadata']['labels'].hasOwnProperty(labels.split('=')[0])) {
            if (resp.body['metadata']['labels'][`${labels.split('=')[0]}`] === labels.split('=')[1]) {
              exist = true
            }
          }
          return exist
        })
      },
      {
        errorMsg: 'Can not find the labels ' + labels + ' in managed cluster ' + clusterName,
        interval: 2 * 1000,
        timeout: 10 * 1000,
      }
    )
  },
  checkClusterStatus: (clusterName) => {
    cy.log('checking cluster status')

    return cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          for (let i = 0; i < resp.body['status']['conditions'].length; i++) {
            var condition = resp.body['status']['conditions'][i]
            if (condition.type === 'ManagedClusterJoined') {
              if (condition.status == 'True') {
                return true
              }
            }
          }
          return false
        })
      },
      {
        errorMsg: 'Cluster ' + clusterName + ' did not finish in given time',
        interval: 600 * 1000, // check every 10 minutes
        timeout: 3600 * 1000, // wait an hour
      }
    )
  },
  checkManagedCluster: (clusterName) => {
    cy.log('checking managedCluster CR created')
    cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          return resp.isOkStatusCode
        })
      },
      {
        errorMsg: 'ManagedCluster ' + clusterName + ' did not created',
        interval: 10 * 1000, // check every 10 seconds
        timeout: 3600 * 1000, // wait an hour
      }
    )
  },
  checkManagedClusterClaim: (clusterName, claim) => {
    cy.log('checking clusterclaim info from managedcluster CR')
    cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          if (resp.isOkStatusCode) {
            for (let i = 0; i < resp.body['status']['clusterClaims'].length; i++) {
              var clusterclaim = resp.body['status']['clusterClaims'][i]
              if (clusterclaim.name === claim.split('=')[0]) {
                return clusterclaim.value === claim.split('=')[1]
              }
            }
          }
          return false
        })
      },
      {
        errorMsg: 'Waiting for cluster ' + clusterName + ' claim ' + claim + ' created',
        interval: 10 * 1000, // check every 10 seconds
        timeout: 1800 * 1000, // wait 30 minutes
      }
    )
  },
  checkHiveCluster: (clusterName) => {
    cy.log('check hive clusters')
    return cluster.getManagedCluster(clusterName).then((resp) => {
      return resp.isOkStatusCode && resp.body.metadata.annotations['open-cluster-management/created-via'] == 'hive'
    })
  },
  checkOCPCluster: (clusterName) => {
    cy.log('check OCP clusters')
    return cluster.getManagedCluster(clusterName).then((resp) => {
      return resp.isOkStatusCode && resp.body.metadata.labels.vendor == 'OpenShift'
    })
  },

  checkHibernatableCluster: (clusterName) => {
    cy.log('check if the cluster can be hibernated')
    return cluster.getManagedCluster(clusterName).then((resp) => {
      return (
        resp.isOkStatusCode &&
        resp.body.metadata.annotations['open-cluster-management/created-via'] == 'hive' &&
        resp.body.metadata.labels.cloud != 'OpenStack' &&
        resp.body.metadata.labels.cloud != 'RHV' &&
        resp.body.metadata.labels.cloud != 'VSphere'
      )
    })
  },
  updateClusterAddon: (clusterName, addon, status) => {
    let request_body = `{"spec":{"${addon}":{"enabled":${status}}}}`
    cluster.updateKlusterletAddonConfig(clusterName, request_body).then((resp) => expect(resp.isOkStatusCode))
  },
  addonShouldNotExists: (clusterName, addon) => {
    cy.log('Make sure the managedcluster addon not exists')
    cy.waitUntil(
      () => {
        return cluster.getManagedClusterAddon(clusterName, addon).then((resp) => {
          return resp.status === 404
        })
      },
      {
        interval: 5 * 1000, // check every 5s
        timeout: 1800 * 1000, // wait for 5m
      }
    )
  },
  addonShouldExists: (clusterName, addon) => {
    cy.log('Make sure the managedcluster addon exists')
    cy.waitUntil(
      () => {
        return cluster.getManagedClusterAddon(clusterName, addon).then((resp) => {
          return resp.status === 200
        })
      },
      {
        interval: 5 * 1000, // check every 5s
        timeout: 1800 * 1000, // wait for 5m
      }
    )
  },
  getClusterLabels: (clusterName) => {
    cy.log('check the managedcluster labels')
    return cluster.getManagedCluster(clusterName).then((resp) => {
      if (resp.isOkStatusCode) {
        return resp.body.metadata.labels
      }
    })
  },
  assertCloudSecrets: (clusterName, namespace, clusterType) => {
    cy.log('check the managedcluster secrets should have labels')
    kube.getSecret(clusterName + '-' + clusterType + '-creds', namespace).then((resp) => {
      return (
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromNamespace') &&
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromSecretName')
      )
    })
  },
  assertPullSecrets: (clusterName, namespace) => {
    cy.log('check the managedcluster pull secrets should have labels')
    kube.getSecret(clusterName + '-pull-secret', namespace).then((resp) => {
      return (
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromNamespace') &&
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromSecretName')
      )
    })
  },
  assertSSHKeySecrets: (clusterName, namespace) => {
    cy.log('check the managedcluster ssh key secrets should have labels')
    kube.getSecret(clusterName + '-ssh-private-key', namespace).then((resp) => {
      return (
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromNamespace') &&
        resp.body.metadata.labels.hasOwnProperty('cluster.open-cluster-management.io/copiedFromSecretName')
      )
    })
  },
}

export const clusterDeploymentActions = {
  checkClusterDeploymentPowerStatus: (clusterName, finalStatus) => {
    cy.log('Check the cluster deployment power status')
    cy.waitUntil(
      () => {
        return hive.getClusterDeployment(clusterName).then((resp) => {
          if (finalStatus === 'Running') return resp['status']['powerState'] === 'Running'
          else {
            for (let i = 0; i < resp['status']['conditions'].length; i++) {
              var condition = resp['status']['conditions'][i]
              if (condition.type === 'Hibernating') return condition.reason == finalStatus
            }
          }
        })
      },
      {
        interval: 5 * 1000,
        timeout: 1800 * 1000,
      }
    )
  },

  checkClusterProvisionStatus: (clusterName) => {
    cy.log('Wait for cluster provision resource finished')
    cy.waitUntil(
      () => {
        return hive
          .getClusterProvisions(clusterName, `hive.openshift.io/cluster-deployment-name=${clusterName}`)
          .then((resp) => {
            if (!resp.isOkStatusCode || resp.body.items.length == 0) return false
            else
              return (
                resp.body.items[resp.body.items.length - 1].spec.stage === 'failed' ||
                resp.body.items[resp.body.items.length - 1].spec.stage === 'complete'
              )
          })
      },
      {
        interval: 60 * 1000, // check every 1m
        timeout: 3600 * 1000, // wait an hour
      }
    )
  },

  dumpClusterProvisionStatus: (clusterName) => {
    cy.log('Dump the cluster provision status')
    return hive
      .getClusterProvisions(clusterName, `hive.openshift.io/cluster-deployment-name=${clusterName}`)
      .then((resp) => {
        return resp.body.items[resp.body.items.length - 1].spec.stage
      })
  },

  dumpClusterInstallMsg: (clusterName) => {
    cy.log('Dump the cluster installation msg')
    return hive
      .getClusterProvisions(clusterName, `hive.openshift.io/cluster-deployment-name=${clusterName}`)
      .then((resp) => {
        return resp.body.items[resp.body.items.length - 1].spec.installLog
      })
  },

  getKubeConfigFromClusterDeployment: (clusterName) => {
    return hive.getClusterDeployment(clusterName).then((cd) => {
      if (
        cd.hasOwnProperty('spec') &&
        cd.spec.hasOwnProperty('clusterMetadata') &&
        cd.spec.clusterMetadata.hasOwnProperty('adminKubeconfigSecretRef')
      ) {
        return kube.getSecret(cd.spec.clusterMetadata.adminKubeconfigSecretRef.name, clusterName).then((secRes) => {
          if (secRes.isOkStatusCode) {
            let kubeObj = Buffer.from(secRes.body.data.kubeconfig.toString(), 'base64')
            return kubeObj.toString('utf8')
          }
        })
      }
    })
  },

  assertInstallAttempt: (clusterName, installAttempt) => {
    return hive.getClusterDeployment(clusterName).then((cd) => {
      if (cd.hasOwnProperty('spec') && cd.spec.hasOwnProperty('installAttemptsLimit')) {
        return cd.spec.installAttemptsLimit == installAttempt
      }
    })
  },
}

export const machinePoolActions = {
  checkMachinePool: (clusterName) => {
    cy.log('check if cluster have machinepool')
    return hive.getMachinePools(clusterName).then((resp) => {
      if (!resp.isOkStatusCode) {
        return false
      } else {
        return resp.body.items.length > 0
      }
    })
  },
  checkAutoScaling: (machinePool, namespace) => {
    cy.log('check if machinepool have autoscaling enabled')
    return hive.getMachinePool(machinePool, namespace).then((resp) => {
      if (!resp.isOkStatusCode) {
        return false
      } else {
        return resp.body.spec.hasOwnProperty('autoscaling')
      }
    })
  },
}

export const clusterPoolActions = {
  checkClusterPoolStatus: (clusterPoolName, namespace, runningCount, hibernatingCount) => {
    cy.waitUntil(
      () => {
        return hive.getClusterPool(clusterPoolName, namespace).then((resp) => {
          return (
            resp.isOkStatusCode &&
            resp.body.status.ready == runningCount &&
            resp.body.status.standby == hibernatingCount
          )
        })
      },
      {
        errorMsg: 'Cluster Pool ' + clusterPoolName + ' did not finish in given time',
        interval: 60 * 1000, // check every 1m
        timeout: 3600 * 1000, // wait an hour
      }
    )
  },
  waitForClusterPoolDelete: (clusterPoolName, namespace) => {
    cy.log('Wait for cluster pool delete')
    cy.waitUntil(
      () => {
        return hive.getClusterPool(clusterPoolName, namespace).then((resp) => {
          return resp.status === 404
        })
      },
      {
        errorMsg: 'Cluster Pool ' + clusterPoolName + ' did not delete yet',
        interval: 5 * 1000, // check every 5s
        timeout: 600 * 1000, // wait for 10m
      }
    )
  },
  waitForClusterDeploymentInPoolDelete: (clusterPoolName, namespace) => {
    cy.log('Wait for cluster deployment in clusterPool deleted')
    cy.waitUntil(
      () => {
        return hive.getClusterDeployments().then((resp) => {
          if (resp.isOkStatusCode) {
            if (resp.body.items.length === 0) return true
            else {
              var exist = true
              for (const clusterDeploy of resp.body.items) {
                if (
                  clusterDeploy.spec.hasOwnProperty('clusterPoolRef') &&
                  !clusterDeploy.spec.clusterPoolRef.hasOwnProperty('claimName') &&
                  clusterDeploy.spec.clusterPoolRef.poolName === clusterPoolName &&
                  clusterDeploy.spec.clusterPoolRef.namespace === namespace
                )
                  exist = false
              }
              return exist
            }
          }
          return false
        })
      },
      {
        errorMsg:
          'The Cluster Pool ' +
          clusterPoolName +
          ' in namespace ' +
          namespace +
          ' still have clusterdeployment pending delete',
        interval: 10 * 1000, // check every 10s
        timeout: 1200 * 1000, // wait for 20m
      }
    )
  },
}

export const clusterMetricsActions = {
  waitForLabels: (clusterName) => {
    cy.log('Check the cluster metrics to make sure the labels added')
    cy.waitUntil(
      () => {
        return cluster.getManagedCluster(clusterName).then((resp) => {
          if (resp.isOkStatusCode) {
            if (
              resp.body.metadata.labels.vendor != '' &&
              resp.body.metadata.labels.vendor != 'auto-detect' &&
              resp.body.metadata.labels.cloud != 'auto-detect'
            ) {
              if (resp.body.metadata.labels.vendor === 'OpenShift') {
                return (
                  resp.body.metadata.labels.hasOwnProperty('clusterID') && resp.body.metadata.labels.clusterID != ''
                )
              } else {
                return true
              }
            } else {
              return false
            }
          } else {
            return false
          }
        })
      },
      {
        interval: 10 * 1000,
        timeout: 600 * 1000,
      }
    )
  },
  waitForMetrics: (clusterName) => {
    cy.log('Check the cluster mertics was generated')
    cluster.getManagedCluster(clusterName).then((resp) => {
      cy.waitUntil(
        () => {
          if (
            !resp.body.metadata.labels.hasOwnProperty('clusterID') &&
            resp.body.metadata.labels.vendor != 'OpenShift'
          ) {
            return metrics.getClusterMetrics(clusterName).then((metrics) => {
              return metrics.data.result.length > 0 && metrics.data.result[0].metric.available == 'True'
            })
          } else {
            return metrics.getClusterMetrics(resp.body.metadata.labels.clusterID).then((metrics) => {
              return metrics.data.result.length > 0 && metrics.data.result[0].metric.available == 'True'
            })
          }
        },
        {
          interval: 10 * 1000,
          timeout: 600 * 1000,
        }
      )
    })
  },
  // The checkClusterMetrics used to handle the test cases of RHACM4K-1735
  checkClusterMetrics: (clusterName?, type?) => {
    switch (type) {
      case 'Destroy': {
        cy.log('Check the cluster metrics when the cluster is destroy')
        // (TODO) need to find a way to check the metrics if the cluster was destroy
        break
      }
      case 'Detach': {
        cy.log('Check the cluster metrics when the cluster is detached')
        hive.getClusterDeployment(clusterName).then((resp) => {
          cy.waitUntil(
            () => {
              // if the resp was 404 that means the cluster was not created by hive, so we need to use clusterName do search
              if (resp === 404) {
                return metrics.getClusterMetrics(clusterName).then((metrics) => {
                  return metrics.data.result.length == 0
                })
              } else {
                return metrics.getClusterMetrics(resp.spec.clusterMetadata.clusterID).then((metrics) => {
                  return metrics.data.result.length == 0
                })
              }
            },
            {
              interval: 10 * 1000, // check every 10s
              timeout: 600 * 1000, // wait for 10m
            }
          )
        })
        break
      }
      case 'Hibernating': {
        cy.log('Check the cluster metrics when the cluster is Hibernating')
        hive.getClusterDeployment(clusterName).then((resp) => {
          cy.waitUntil(
            () => {
              return metrics.getClusterMetrics(resp.spec.clusterMetadata.clusterID).then((metrics) => {
                return metrics.data.result.length > 0 && metrics.data.result[0].metric.available == 'Unknown'
              })
            },
            {
              interval: 10 * 1000, // check every 10s
              timeout: 600 * 1000, // wait for 10m
            }
          )
        })
        break
      }
      default: {
        clusterMetricsActions.waitForLabels(clusterName)
        clusterMetricsActions.waitForMetrics(clusterName)
        cy.log('Check the cluster metrics')
        cluster.getManagedCluster(clusterName).then((resp) => {
          if (resp.isOkStatusCode) {
            if (
              !resp.body.metadata.labels.hasOwnProperty('clusterID') &&
              resp.body.metadata.labels.vendor != 'OpenShift'
            ) {
              // The cluster was not the OCP cluster
              metrics.getClusterMetrics(clusterName).then((metrics) => {
                expect(metrics.status).to.be.eq('success')
                expect(metrics.data.result[0].metric.cloud).to.be.eq(resp.body.metadata.labels.cloud)
                expect(metrics.data.result[0].metric.created_via.toLowerCase()).to.be.eq(
                  resp.body.metadata.annotations['open-cluster-management/created-via']
                )
                expect(metrics.data.result[0].metric.managed_cluster_id).to.be.eq(clusterName)
                expect(metrics.data.result[0].metric.vendor).to.be.eq(resp.body.metadata.labels.vendor)
                expect(metrics.data.result[0].metric.version).to.be.eq(resp.body.status.version.kubernetes)
                expect(metrics.data.result[0].metric.service_name).to.be.eq('Other')
                expect(metrics.data.result[0].metric.core_worker).to.be.eq(resp.body.status.capacity.core_worker)
                expect(metrics.data.result[0].metric.socker_worker).to.be.eq(resp.body.status.capacity.socket_worker)
              })
            } else {
              // The cluster was OCP cluster
              metrics.getClusterMetrics(resp.body.metadata.labels.clusterID).then((metrics) => {
                expect(metrics.status).to.be.eq('success')
                expect(metrics.data.result[0].metric.cloud).to.be.eq(resp.body.metadata.labels.cloud)
                expect(metrics.data.result[0].metric.created_via.toLowerCase()).to.be.eq(
                  resp.body.metadata.annotations['open-cluster-management/created-via']
                )
                expect(metrics.data.result[0].metric.managed_cluster_id).to.be.eq(resp.body.metadata.labels.clusterID)
                expect(metrics.data.result[0].metric.vendor).to.be.eq(resp.body.metadata.labels.vendor)
                expect(metrics.data.result[0].metric.version).to.be.eq(resp.body.metadata.labels.openshiftVersion)
                expect(metrics.data.result[0].metric.service_name).to.be.eq('Other')
                expect(metrics.data.result[0].metric.core_worker).to.be.eq(resp.body.status.capacity.core_worker)
                expect(metrics.data.result[0].metric.socker_worker).to.be.eq(resp.body.status.capacity.socket_worker)
              })
            }
          }
        })
        break
      }
    }
  },
}
