/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2023 Red Hat, Inc.
 ****************************************************************************** */

import { credentialsCreateMethods } from '../../support/action-utils/credentials-actions'
const { options } = JSON.parse(Cypress.env('ENV_CONFIG'))

describe(
  'Create provider credentials',
  {
    tags: ['@CLC', '@create'],
  },
  function () {
    beforeEach(() => {
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

    s

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
