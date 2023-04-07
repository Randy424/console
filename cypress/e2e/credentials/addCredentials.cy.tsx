/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2023 Red Hat, Inc.
 ****************************************************************************** */

import { credentialsCreateMethods } from '../../support/action-utils/credentials/credentials-actions'
const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    before(function () {
      cy.login()
      cy.visit('/multicloud/infrastructure/')
    })

    it(
      `RHACM4K-567: CLC: Create AWS provider connections`,
      { tags: ['aws', 'credentials', '@ocpInterop'] },
      function () {
        credentialsCreateMethods.addAWSCredential({
          ...options.connections.apiKeys.aws,
          ...options.connections.secrets,
        })
      }
    )

    it(`RHACM4K-568: CLC: Create Azure provider connections`, { tags: ['azure', 'credentials'] }, function () {
      credentialsCreateMethods.addAzureCredential(
        { ...options.connections.apiKeys.azure, ...options.connections.secrets },
        'AzurePublicCloud'
      )
    })

    it(`RHACM4K-569: CLC: Create Google Cloud provider connections`, { tags: ['gcp', 'credentials'] }, function () {
      credentialsCreateMethods.addGCPCredential({ ...options.connections.apiKeys.gcp, ...options.connections.secrets })
    })

    it(`RHACM4K-1232: CLC: Create VMware provider connections`, { tags: ['vmware', 'credentials'] }, function () {
      credentialsCreateMethods.addVMwareCredential({
        ...options.connections.apiKeys.vmware,
        ...options.connections.secrets,
      })
    })

    it(`RHACM4K-6917: CLC: Create Ansible credentials`, { tags: ['ansible', 'credentials'] }, function () {
      credentialsCreateMethods.addAnsibleTowerCredential({ ...options.connections.apiKeys.ansible })
    })

    it(`RHACM4K-8106: CLC: Create Azure Government credentials`, { tags: ['azgov', 'credentials'] }, function () {
      credentialsCreateMethods.addAzureCredential(
        { ...options.connections.apiKeys.azgov, ...options.connections.secrets },
        'AzureUSGovernmentCloud'
      )
    })

    it(
      `RHACM4K-3177: CLC: Create Red Hat OpenStack Platform credentials`,
      { tags: ['openstack', 'credentials'] },
      function () {
        credentialsCreateMethods.addOpenStackCredential({
          ...options.connections.apiKeys.openstack,
          ...options.connections.secrets,
        })
      }
    )

    it(`RHACM4K-13213: CLC: Create a Red Hat Virtualization credential`, { tags: ['rhv', 'credentials'] }, function () {
      credentialsCreateMethods.addRHVCredential({ ...options.connections.apiKeys.rhv, ...options.connections.secrets })
    })
  }
)
