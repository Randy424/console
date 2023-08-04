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
      createNamespace(namespace: string): Chainable<void>
      deleteNamespace(namespace: string): Chainable<void>
      add<T extends keyof Chainable, S extends PrevSubject>(
        name: T,
        options: CommandOptions & { prevSubject: S | ['optional'] },
        fn: CommandFnWithSubject<T, PrevSubjectMap[S]>
      ): void
      failOnErrorResponseStatus(resp: Http2ServerResponse, errorMsg: string): Chainable<void>
      paste(text: string): Chainable<void>
      acquireToken(): Chainable<void>
      setAPIToken(): Chainable<void>
      clearOCMCookies(): Chainable<void>
      runCmd(cmd, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      uploadDiscoveryISO(vmName, discoveryIsoName, isoPath, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      wipeVmDisk(pathToDiskFile, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      startVM(vmName, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      destroyVM(vmName, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      copyKubeconfigToPath(kubeconfigCurrentPath, newPath, setAlias, failOnNonZeroExit, timeout): Chainable<void>
      hostDetailSelector(row, label, timeout): Chainable<JQuery<HTMLElement>>
      getYamlEditorText(divElement): Chainable<void>
      toggleYamlEditor(divElement): Chainable<void>
      getYamlEditorTextCreate(): Chainable<void>
      getYamlEditorTextImport(): Chainable<void>
      get(element: JQuery<HTMLElement>): Chainable<void>
      type(element: JQuery<HTMLElement>, text: string, options?: any): Chainable<void>
      includes(text: string): Chainable<void>
      login(user: string, password: string, ocIDP: string): Chainable<void>
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
