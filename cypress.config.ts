/* Copyright Contributors to the Open Cluster Management project */

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
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
    retries: 1,
  },
})
