/* Copyright Contributors to the Open Cluster Management project */

import { defineConfig } from 'cypress'
import { getTestEnv } from './cypress/config/config'
import { getTestInfraEnv } from './cypress/config/config'
import { getExtraVars } from './cypress/config/config'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-terminal-report/src/installLogsPrinter')(on)
      config.env.ENV_CONFIG = getTestEnv()
      config.env.INFRA_ENV_CONFIG = getTestInfraEnv()
      config.env.EXTRA_VARS = getExtraVars()

      require('@cypress/grep/src/plugin')(config)
      return config
    },
    baseUrl: 'https://localhost:3000/',
    viewportWidth: 1600,
    viewportHeight: 1120,
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 30000,

    chromeWebSecurity: false,
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'results/screenshots',
    videosFolder: 'results/videos',
    numTestsKeptInMemory: 10,
    videoUploadOnPasses: false, // needed, if set to true, will always create and upload video of the test. Too time consuming and resource intensive.
    watchForFileChanges: true,
    reporter: 'cypress-multi-reporters', // needed for our report portal/polarion
    reporterOptions: {
      // needed for our report portal/polarion
      reporterEnabled: 'mochawesome, mocha-junit-reporter',
      mochawesomeReporterOptions: {
        reportDir: 'results/json',
        reportFilename: 'mochawesome-report.json',
        overwrite: false,
        html: false,
        json: true,
      },
      mochaJunitReporterReporterOptions: {
        //
        testCaseSwitchClassnameAndName: true,
        mochaFile: 'results/cypress-[hash].xml',
      },
    },
    retries: 1,
  },
})
