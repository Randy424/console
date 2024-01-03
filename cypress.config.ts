/* Copyright Contributors to the Open Cluster Management project */

import { defineConfig } from 'cypress'
import * as fs from 'fs'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        createFile({ path, data }) {
          // there is a name and arguments for a task
          fs.appendFile(path, data, (err) => {
            console.log('error creating file: ', err)
          })
          return null
        },
      })
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
