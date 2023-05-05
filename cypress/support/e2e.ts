// ***********************************************************
// Previously the supportFile option defaulted to cypress/support/index.js.
// Now the e2e.supportFile option defaults to cypress/support/e2e.{js,jsx,ts,tsx}
// and the component.supportFile option defaults to cypress/support/component.
// {js,jsx,ts,tsx}.
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import { Http2ServerResponse } from 'http2'
import './commands'
require('cypress-terminal-report/src/installLogsCollector')()
// import { safeLoad } from 'js-yaml'
// "import" with `@ts-ignore`
// @see error 2306 https://github.com/microsoft/TypeScript/blob/3fcd1b51a1e6b16d007b368229af03455c7d5794/src/compiler/diagnosticMessages.json#L1635
// @ts-ignore

declare global {
  namespace Cypress {
    interface Chainable {
      multiselect(value: string): Chainable<Element>
      login(user?: string, password?: string): Chainable<void>
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

before(() => {
  // cleanReports()
  cy.login()
})
