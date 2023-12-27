/* Copyright Contributors to the Open Cluster Management project */

import { Http2ServerResponse } from 'http2'
import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      multiselect(value: string): Chainable<Element>
      login(user?: string, password?: string): Chainable<void>
      clearAllCredentials(): Chainable<void>
      clearAllManagedClusters(): Chainable<void>
      createCredential(fileName: string): Chainable<void>
      typeToInputField(selector: string, contents: string): Chainable<void>
      selectFromSelectField(selector: string, target: string): Chainable<void>
    }
    interface SuiteConfigOverrides {
      /**
       * List of tags for this suite
       * @example a single tag
       *  describe('block with config tag', { tags: '@smoke' }, () => {})
       * @example multiple tags
       *  describe('block with config tag', { tags: ['@smoke', '@slow'] }, () => {})
       */
      tags?: string | string[]
    }
    interface TestConfigOverrides {
      tags?: string | string[]
    }
  }
}

beforeEach(() => {
  cy.login()
  cy.visit('/multicloud/infrastructure/')
})
