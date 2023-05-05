/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />

import { commonElementSelectors, commonPageMethods } from '../../commonSelectors'
import { acm23xheaderMethods, acmHeaderSelectors } from '../../header'
import * as genericFunctions from '../../genericFunctions'

import { managedClusterDetailMethods, managedClustersMethods, clusterStatus } from '../managedcluster/managedCluster'
import { clusterPoolActions, clusterDeploymentActions } from '../../action-utils/clusterAction'
import { clusterSetPageSelector } from '../clusterset/clusterSets'

import { getClusterPool, getClusterClaim } from '../../api-utils/hive'
import * as constants from '../../constants'

export const clusterPoolsSelectors = {
  elementTab: {
    clusterPoolsTab: 'Cluster pools',
  },
  elementText: {
    createClusterPoolButton: 'Create cluster pool',
    claimCluster: 'Claim cluster',
  },
  clusterPoolScale: {
    plusButton: 'button[aria-label="Plus"]',
    minusButton: 'button[aria-label="Minus"]',
  },
  clusterPoolTableRowOptionsMenu: {
    scaleClusterPool: 'a[text="Scale cluster pool"]',
    updateReleaseImage: 'a[text="Update release image"]',
    destroyClusterPool: 'a[text="Destroy cluster pool"]',
  },
  tableColumnFields: {
    name: '[data-label="Name"]',
    namespace: '[data-label="Namespace"]',
    clusterStatus: '[data-label="Cluster status"]',
    availableCluster: '[data-label="Available clusters"]',
    infra: '[data-label="Infrastructure"]',
    distriVersion: '[data-label="Distribution version"]',
  },
  createClusterPool: {
    // the following dropdown will work for provider connection and cluster toggle
    infrastructureProvider: {
      aws: '#aws',
      gcp: '#google',
      azure: '#azure',
    },
    basicInformation: {
      credentials: '#connection-label',
      clusterPoolName: '#eman',
      clusterPoolNamespaceGroup: '#emanspace-group',
      clusterPoolNamespace: '#emanspace',
      clusterSetPlaceHolderText: 'Select a cluster set',
      numberSize: '',
      numberRunningSize: '',
      clusterSet: '#clusterSet-label',
      imageSet: '#imageSet-group',
      fips: '#fips',
      singleNode: '#singleNode',
    },
    nodePools: {
      region: '#region-label',
      arch: '#architecture-label',
      controlPlane: '#masterpool-control-plane-pool',
      masterType: '#masterType',
      workerPool: '#workerpool-worker-pool-1',
      workerType: '#workerType-input',
    },
  },
  claimCluster: {
    claimName: '#clusterClaimName-label',
    viewCluster: 'View cluster',
  },
  msg: {
    claimClusterMsg: 'You can create a cluster claim, but it will not be fulfilled immediately.',
    noClusterPool: "You don't have any cluster pools",
  },
}

/**
 * This object contais the group of methods that are part of clusterpool page
 */
export const clusterPoolMethods = {
  createClusterPool: (
    { provider, name, clusterPoolName, clusterSet, releaseImage, region, masterInstanceType, workerInstanceType },
    arch,
    clusterPoolSize,
    clusterPoolRunningSize,
    fips,
    sno
  ) => {
    clusterPoolPages.goToClusterPools()
    getClusterPool(clusterPoolName, clusterPoolName + '-ns').then((resp) => {
      // if clusterpool exists (200), delete first
      if (resp.status === 404) {
        clusterPoolActions.waitForClusterDeploymentInPoolDelete(clusterPoolName, clusterPoolName + '-ns')
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500)
          .contains(commonElementSelectors.elements.button, clusterPoolsSelectors.elementText.createClusterPoolButton)
          .click()
        clusterPoolCreatePages.fillInfrastructureProviderDetails(provider)
        clusterPoolCreatePages.fillClusterPoolDetails(
          name,
          clusterPoolName,
          clusterSet,
          releaseImage,
          clusterPoolSize,
          clusterPoolRunningSize,
          fips,
          sno
        )
        clusterPoolCreatePages.fillNodePoolsDetails(region, arch, masterInstanceType, workerInstanceType, sno)
        clusterPoolCreatePages.fillNetworkingDetails()
        clusterPoolCreatePages.fillProxyDetails()
        if (provider == 'Amazon Web Services') clusterPoolCreatePages.fillAWSPrivateConfig()
        cy.contains(commonElementSelectors.elements.button, commonElementSelectors.elementsText.create).click()

        // automatically redirected back to cluster pools page
        cy.url().should('include', 'clusters/pools')
        // cy.get('.pf-m-toast')
        //     .should('include.text', 'Cluster pool created')
        //     .and('include.text', clusterPoolName + ' was successfully created')
      }
    })
  },

  /**
   * @param {string} clusterPoolName
   */
  claimCluster: (clusterPoolName) => {
    clusterPoolPages.goToClaimCluster(clusterPoolName)
    cy.get(clusterPoolsSelectors.claimCluster.claimName).type(clusterPoolName + '-claim')

    // When claim the cluster, there have 3 conditions now.
    // 1. if the clusterpool have cluster with running status, the claim cluster will claim the running cluster.
    // 2. if the clusterpool did not have cluster with running status but have the cluster with hibernating status, the hibernating cluster will be resuming and claimed.
    // 3. if the clusterpool did not have running and hibernating cluster, new cluster will be created.
    // So we should consider the different situations to do the cluster claim
    getClusterPool(clusterPoolName, clusterPoolName + '-ns').then((resp) => {
      if (resp.body.status.ready == 0) {
        // We did not care the clusterpool size here since if the clusterpool size is 0, claim cluster will also create the new cluster.
        // In this case, claim will not have "View cluster" button shows.
        // and the "View cluster" button will only show when the clusterpool have cluster with running status.
        cy.get('button[type="submit"]').contains('Claim').click()
        commonPageMethods.modal.shouldBeOpen()
        genericFunctions.clickButton(commonElementSelectors.elementsText.close)

        // New cluster will be created under this clusterpool
        // clusterPoolMethods.isClusterPoolPreparing(clusterPoolName)
        // TODO(Hui), will add clusterclaim in pending status check then.
      } else {
        cy.get('button[type="submit"]').contains('Claim').click()
        commonPageMethods.modal.shouldBeOpen()
        genericFunctions.clickButton(clusterPoolsSelectors.claimCluster.viewCluster)

        managedClusterDetailMethods.isClusterClaim(clusterPoolName + '-claim')
        managedClusterDetailMethods.isClusterPool(clusterPoolName)
        getClusterClaim(clusterPoolName + '-claim', clusterPoolName + '-ns').then((resp) => {
          if (resp.isOkStatusCode) {
            clusterDeploymentActions.checkClusterDeploymentPowerStatus(resp.body.spec.namespace, 'Running')

            managedClusterDetailMethods.isClusterName(resp.body.spec.namespace)
            managedClusterDetailMethods.isClusterStatus(clusterStatus.READY)

            // new cluster should be preparing now to fill the gap from claimed cluster
            clusterPoolMethods.isClusterPoolPreparing(clusterPoolName)
            cy.contains(resp.body.spec.namespace).should('not.exist')
          }
        })
      }
    })
  },

  /**
   *
   * @param {*} clusterPoolName
   * @param {*} scaleType options: size or runningCount
   * @param {*} scale options: up or down
   */
  scaleClusterPool: (clusterPoolName, scaleType, scale) => {
    clusterPoolPages.goToClusterPoolClickRowOptions(clusterPoolName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.scaleClusterPool
    )
    cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.scaleClusterPool).click()
    commonPageMethods.modal.shouldBeOpen()
    cy.get('[name=scale-' + scaleType + ']')
      .invoke('val')
      .then(($currentScale) => {
        scale == 'up'
          ? cy.get('#scale-' + scaleType + ' ' + clusterPoolsSelectors.clusterPoolScale.plusButton).click()
          : cy.get('#scale-' + scaleType + ' ' + clusterPoolsSelectors.clusterPoolScale.minusButton).click()
        cy.get('button[type="submit"]').contains('Scale').click()

        cy.get('[data-label="Available clusters"] > span')
          .first()
          .then(() => {
            let newVal = scale == 'up' ? Number($currentScale) + 1 : Number($currentScale) - 1
            cy.waitUntil(
              () => {
                return getClusterPool(clusterPoolName, clusterPoolName + '-ns').then((resp) => {
                  if (scaleType == 'size') {
                    return resp.body.spec.size == newVal
                  } else {
                    return resp.body.spec.runningCount == newVal
                  }
                })
              },
              {
                interval: 5 * 1000,
                timeout: 900 * 1000, // up to 15 minutes
              }
            )
          })
        // todo: should also check starting/stopping?
      })
  },

  destroyClusterPool: (clusterPool) => {
    getClusterClaim(clusterPool + '-claim', clusterPool + '-ns').then((resp) => {
      if (resp.status == 200) {
        cy.log('The cluster deployment in cluster claim is:', resp.body.spec.namespace)
        managedClustersMethods.destroyCluster(resp.body.spec.namespace)
      }
    })
    clusterPoolPages.goToClusterPoolClickRowOptions(clusterPool)
    commonPageMethods.resourceTable.buttonShouldClickable(
      clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.destroyClusterPool
    )
    cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.destroyClusterPool).click()
    commonPageMethods.modal.confirmAction(clusterPool)
    genericFunctions.clickSubmit()
    clusterPoolActions.waitForClusterPoolDelete(clusterPool, clusterPool + '-ns')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
      .get(commonElementSelectors.elements.mainSection)
      .then(($body) => {
        if (!$body.text().includes(clusterPoolsSelectors.msg.noClusterPool)) {
          cy.get('[data-label="Name"]').should('not.include.text', clusterPool)
        }
      })
    clusterPoolActions.waitForClusterDeploymentInPoolDelete(clusterPool, clusterPool + '-ns')
  },

  destroyClusterPoolbyAction: (searchFilter) => {
    clusterPoolPages.goToClusterPools()
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (
        !$body.text().includes(clusterPoolsSelectors.msg.noClusterPool) &&
        !$body.text().includes('No results found')
      ) {
        commonPageMethods.resourceTable.searchTable(searchFilter)
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(700).get('#select-all').click()
        cy.get('.pf-c-toolbar__content-section').within(() =>
          cy.get(commonElementSelectors.elements.actionsButton).should('exist').click()
        )
        cy.get('#destroyClusterPools').click()
        commonPageMethods.modal.shouldBeOpen()
        commonPageMethods.modal.confirmAction('confirm')
        genericFunctions.clickSubmit()
      }
    })
  },

  changeReleaseImage: (clusterPoolName) => {
    clusterPoolPages.goToClusterPoolClickRowOptions(clusterPoolName)
    commonPageMethods.resourceTable.buttonShouldClickable(
      clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.updateReleaseImage
    )
    cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.updateReleaseImage).click()
    clusterPoolMethods.valiateChangeReleaseImageByAction()
  },

  changeReleaseImageByAction: (searchFilter) => {
    clusterPoolPages.goToClusterPools()
    commonPageMethods.resourceTable.searchTable(searchFilter)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(700).get('#select-all').click()
    cy.get('.pf-c-toolbar__content-section').within(() =>
      cy.get(commonElementSelectors.elements.actionsButton).should('exist').click()
    )
    cy.get('#updateReleaseImages').click()

    clusterPoolMethods.valiateChangeReleaseImageByAction()
  },

  /**
   * check available release images are actually supported
   * for clusterpools only
   * Expects to be on the update release images dialog
   * Uses a regex expression to test if versions shown are supported
   */
  validateSupportedReleaseImages: () => {
    cy.get('#releaseImage-label').click()
    cy.get('#releaseImage > li > button > .pf-c-select__menu-item-main').each(($releaseImage) => {
      var re = new RegExp('^OpenShift (' + constants.supportedOCPReleasesRegex + ').[0-9][0-9]*$')
      if (!re.test($releaseImage.text())) throw new Error('unexpected release image found: ' + $releaseImage)
    })
  },

  valiateChangeReleaseImageByAction: () => {
    cy.get('td[data-label="Distribution version"]')
      .invoke('text')
      .then(($releaseImage) => {
        commonPageMethods.modal.shouldBeOpen()
        clusterPoolMethods.validateSupportedReleaseImages()

        cy.get('#releaseImage > li > button').first().click()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.get('button[type="submit"]').contains('Update').click().wait(1000)

        cy.get('td[data-label="Distribution version"]')
          .invoke('text')
          .then((val) => {
            expect(val).to.not.eq($releaseImage)
          })
      })
  },

  isClusterPoolPreparing: (clusterPoolName) => {
    clusterPoolPages.goToClusterPools()
    commonPageMethods.resourceTable.searchTable(clusterPoolName) // first result will be the most focused one
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1500)
    clusterPoolMethods.clusterPoolShowsName(clusterPoolName)
    clusterPoolMethods.expandClusterPool() // only if number is more than 0
    clusterPoolMethods.clusterHasStatus('Creating')
  },

  isClusterAvailableToClaim: (claimable) => {
    cy.get('td[data-label="Available to claim"]:visible').as('available')
    if (claimable) cy.get('@available').should('have.text', 'Yes')
    else cy.get('@available').should('have.text', 'No')
  },

  isClusterPoolReady: (clusterPoolName, provider, hibernatingCount, runningCount, poolSize) => {
    // check if cluster pool is in ready state
    clusterPoolActions.checkClusterPoolStatus(clusterPoolName, clusterPoolName + '-ns', runningCount, hibernatingCount)
    clusterPoolPages.goToClusterPools()
    commonPageMethods.resourceTable.searchTable(clusterPoolName)
    clusterPoolMethods.clusterPoolShowsName(clusterPoolName)
    clusterPoolMethods.clusterPoolShowsProvider(provider)
    clusterPoolMethods.isClaimClusterVisible()

    cy.get('[data-label="Available clusters"] > span')
      .eq(0)
      .invoke('text')
      .should('equal', runningCount + ' out of ' + poolSize)

    if (poolSize > 0) {
      clusterPoolMethods.expandClusterPool()

      // validate pool size in the table
      // and if clusters in the pool are either Hibernating or Running
      // and claimable is correct for each cluster in the pool (only Running clusters are claimable)
      cy.get('.pf-c-table__expandable-row-content:visible')
        .find('[aria-label="Simple Table"] > tbody > tr')
        .should('have.length', poolSize)
        .each(($row) => {
          cy.wrap($row)
            .find('td:visible')
            .should(($col) => {
              expect($col).to.have.length(3) // there are 3 columns: name/status/available
              expect($col.eq(0)).to.contain(clusterPoolName)
              if (
                $col.eq(1).text() == 'Hibernating' ||
                $col.eq(1).text() == 'Resuming' ||
                $col.eq(1).text() == 'Stopping'
              )
                expect($col.eq(2)).to.contain('No')
              else if ($col.eq(1).text() == 'Running') expect($col.eq(2)).to.contain('Yes')
              else throw new Error('Invalid status for cluster in cluster pool: ' + $col.eq(1).text())
            })
        })
    }
  },

  clusterPoolShowsName: (clusterPoolName) => {
    cy.get('td[data-label="Name"]:visible').should('include.text', clusterPoolName)
  },

  /**
   * Expands the first clusterpool to show all clusters tied to that pool
   */
  expandClusterPool: () => {
    cy.get('.pf-c-page__main-section').within(() => {
      cy.get('#expandable-toggle0').then(($expand) => {
        if (!$expand.hasClass('pf-m-expanded')) {
          cy.get('#expandable-toggle0').click()
        }
      })
    })
  },

  clusterHasStatus: (status) => {
    cy.get('td[data-label="Status"]:visible').as('status')
    switch (status) {
      case 'Creating':
        cy.get('@status').should('include.text', 'Creating')
        break
      case 'Hibernating':
        cy.get('@status').should('include.text', 'Hibernating')
        break
      case 'Stopping':
        cy.get('@status').should('include.text', 'Stopping')
        break
      case 'Destroying':
        cy.get('@status').should('include.text', 'Destroying')
        break
    }
  },

  clusterPoolShowsProvider: (provider) => {
    cy.get('td[data-label="Infrastructure"]:visible')
      .eq(0)
      .should(($providers) => {
        switch (provider) {
          case 'AWS':
            expect($providers).to.contain('Amazon Web Services')
            break
          case 'AZURE':
            expect($providers).to.contain('Microsoft Azure')
            break
          case 'GCP':
            expect($providers).to.contain('Google Cloud')
            break
          default:
            throw new Error(
              provider + ' is an invalid provider name! These are the supported provider names: AWS, AZURE, GCP'
            )
        }
      })
  },

  isClaimClusterVisible: () => {
    cy.get(clusterPoolsSelectors.tableColumnFields.distriVersion)
      .next()
      .children()
      .eq(0)
      .should('be.enabled')
      .and('have.text', 'Claim cluster')
  },

  // The function used to make sure the clusterpool was exists
  clusterPoolShouldExist: (clusterpool, role) => {
    clusterPoolPages.goToClusterPools(role)
    commonPageMethods.resourceTable.checkIfRowExistsByName(clusterpool)
  },

  checkUserClusterSetActionByOption: (clusterpool, role) => {
    clusterPoolMethods.clusterPoolShouldExist(clusterpool, role)
    commonPageMethods.resourceTable.openRowMenu(clusterpool)
    switch (role) {
      case 'view':
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.scaleClusterPool).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.updateReleaseImage).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.destroyClusterPool).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        break
      case 'edit':
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.scaleClusterPool).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.updateReleaseImage).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterPoolsSelectors.clusterPoolTableRowOptionsMenu.destroyClusterPool).should(
          'have.class',
          commonElementSelectors.elements.disabledButton
        )
        break
      default:
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.editNamespaceBinding).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.manageResourceAssignment).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        cy.get(clusterSetPageSelector.tableRowOptionsMenu.deleteClusterSet).should(
          'not.have.class',
          commonElementSelectors.elements.disabledButton
        )
        break
    }
  },
}

/**
 * This object contais the group of pages that are part of clusterpool page
 */
export const clusterPoolPages = {
  shouldLoad: () => {
    cy.get(commonElementSelectors.elements.pageClassKey).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', '/infrastructure/clusters/pools')

    cy.get(commonElementSelectors.elements.button).should(
      'contain',
      clusterPoolsSelectors.elementText.createClusterPoolButton
    )
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
  },

  goToClusterPools: (role?) => {
    switch (role) {
      case 'view':
      case 'edit':
        acm23xheaderMethods.goToClustersWithUser()
        break
      case 'admin':
      default:
        acm23xheaderMethods.goToClusters()
        break
    }
    cy.get(commonElementSelectors.elements.pageNavLink)
      .filter(`:contains("${clusterPoolsSelectors.elementTab.clusterPoolsTab}")`)
      .click()
    clusterPoolPages.shouldLoad()
  },

  goToCreateClusterPool: (role) => {
    clusterPoolPages.goToClusterPools(role)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
      .contains(commonElementSelectors.elements.button, clusterPoolsSelectors.elementText.createClusterPoolButton)
      .click()
  },

  /**
   * @param {string} clusterPoolName
   * @param {string} checked // optional, used to define if check the messages on claim cluster page
   */
  goToClaimCluster: (clusterPoolName?, checked?, role?) => {
    clusterPoolPages.goToClusterPools(role)
    commonPageMethods.resourceTable.searchTable(clusterPoolName)

    cy.get(clusterPoolsSelectors.tableColumnFields.distriVersion)
      .next()
      .children()
      .eq(0)
      .should('include.text', clusterPoolsSelectors.elementText.claimCluster)
      .eq(0)
      .click()

    commonPageMethods.modal.shouldBeOpen()
    if (checked) {
      getClusterPool(clusterPoolName, clusterPoolName + '-ns').then((resp) => {
        if (resp.body.status.ready == 0) {
          // did not have running cluster
          cy.get(commonElementSelectors.alerts.alertDescrition)
            .should('exist')
            .and('have.text', clusterPoolsSelectors.msg.claimClusterMsg)
        } else {
          // have running cluster
          cy.get(commonElementSelectors.alerts.alertDescrition).should('not.exist')
        }
      })
    }
  },

  goToClusterPoolClickRowOptions: (clusterPool?, role?) => {
    clusterPoolPages.goToClusterPools(role)
    cy.get(commonElementSelectors.elements.mainSection).then(($body) => {
      if (!$body.text().includes(clusterPoolsSelectors.msg.noClusterPool)) {
        commonPageMethods.resourceTable.openRowMenu(clusterPool)
      }
    })
  },
}

/**
 * This object contais the group of pages that are part of create clusterpool page
 */
export const clusterPoolCreatePages = {
  shouldLoad: () => {
    cy.get(commonElementSelectors.elements.pageClassKey).should(
      'contain',
      acmHeaderSelectors.leftNavigation.listItemsText.infrastructureText.clusters
    )
    cy.url().should('include', '/infrastructure/clusters/pools/create/')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
  },
  /**
   * This functon accepts provider name
   * @param {*} provider
   */
  fillInfrastructureProviderDetails: (provider) => {
    switch (provider) {
      case 'Amazon Web Services':
        cy.get(clusterPoolsSelectors.createClusterPool.infrastructureProvider.aws).click()
        cy.url().should('include', 'infrastructure/clusters/pools/create?type=aws')
        break
      case 'Microsoft Azure':
        cy.get(clusterPoolsSelectors.createClusterPool.infrastructureProvider.azure).click()
        cy.url().should('include', 'infrastructure/clusters/pools/create?type=azr')
        break
      case 'Google Cloud':
        cy.get(clusterPoolsSelectors.createClusterPool.infrastructureProvider.gcp).click()
        cy.url().should('include', 'infrastructure/clusters/pools/create?type=gcp')
        break
      default:
        cy.log(provider + ' is an invalid provider name! These are the supported provider names: aws, azure, gcp')
        break
    }
  },

  fillClusterPoolDetails: (
    credentialName,
    clusterPoolName,
    clusterSet,
    releaseImage,
    clusterPoolSize,
    clusterPoolRunningSize,
    fips,
    sno
  ) => {
    // TODO: check credential is auto populated (first one if many exist)
    // TODO: add wait here first to wait for page load complete.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
    if (credentialName != '') {
      cy.get(clusterPoolsSelectors.createClusterPool.basicInformation.credentials)
        .find(commonElementSelectors.elements.input)
        .click({ force: true })
        .then(() => {
          cy.get('ul[id="connection"]')
            .find('li')
            .each(($conn) => {
              if ($conn.text() == credentialName) cy.wrap($conn).click()
            })
        })
    }

    cy.get(clusterPoolsSelectors.createClusterPool.basicInformation.clusterPoolName).click().type(clusterPoolName)
    cy.get(clusterPoolsSelectors.createClusterPool.basicInformation.clusterPoolNamespace)
      .click()
      .type(clusterPoolName + '-ns')

    if (typeof clusterPoolSize != 'undefined') {
      cy.get('input[data-testid="number-size"]').clear().type(clusterPoolSize)
    }

    if (typeof clusterPoolRunningSize != 'undefined') {
      cy.get('input[data-testid="number-runningCount"]').clear().type(clusterPoolRunningSize)
    }

    if (clusterSet != '') {
      genericFunctions.selectOrTypeInInputDropDown(
        clusterPoolsSelectors.createClusterPool.basicInformation.clusterSet,
        clusterSet
      )
    }

    genericFunctions.selectOrTypeInInputDropDown(
      clusterPoolsSelectors.createClusterPool.basicInformation.imageSet,
      releaseImage,
      true
    )

    if (fips) cy.get(clusterPoolsSelectors.createClusterPool.basicInformation.fips).click()

    if (sno) cy.get(clusterPoolsSelectors.createClusterPool.basicInformation.singleNode).click()

    genericFunctions.clickNext()
  },

  fillNodePoolsDetails: (region, arch, masterInstanceType, workerInstanceType, sno) => {
    if (region != '')
      genericFunctions.selectOrTypeInInputDropDown(
        clusterPoolsSelectors.createClusterPool.nodePools.region,
        region,
        true
      )

    if (arch != '')
      genericFunctions.selectOrTypeInInputDropDown(clusterPoolsSelectors.createClusterPool.nodePools.arch, arch, true)

    if (typeof masterInstanceType != 'undefined' && masterInstanceType != '')
      clusterPoolCreatePages.fillMasterNodeDetails(masterInstanceType)

    if (typeof workerInstanceType != 'undefined' && workerInstanceType != '' && !sno)
      clusterPoolCreatePages.fillWorkerPoolDetails(workerInstanceType)

    genericFunctions.clickNext()
  },

  fillMasterNodeDetails: (masterInstanceType) => {
    cy.get(clusterPoolsSelectors.createClusterPool.nodePools.controlPlane)
      .click()
      .then(() =>
        cy
          .get(clusterPoolsSelectors.createClusterPool.nodePools.masterType)
          .clear()
          .type(masterInstanceType)
          .type('{enter}')
      )
  },

  fillWorkerPoolDetails: (workerInstanceType) => {
    cy.get(clusterPoolsSelectors.createClusterPool.nodePools.workerPool)
      .click()
      .then(() =>
        cy
          .get(clusterPoolsSelectors.createClusterPool.nodePools.workerType)
          .clear()
          .type(workerInstanceType)
          .type('{enter}')
      )
  },

  fillNetworkingDetails: () => {
    genericFunctions.clickNext()
  },

  fillProxyDetails: () => {
    genericFunctions.clickNext()
  },

  // for now this methods only click on next button and uses default values
  fillAWSPrivateConfig: () => {
    genericFunctions.clickNext()
  },
}
