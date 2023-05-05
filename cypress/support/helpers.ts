/* Copyright Contributors to the Open Cluster Management project */

import { join } from 'path'

export function cleanReports() {
  const reportPath = join(__dirname, '..', 'results')
  // recursively remove old reports if they exist in /cypress/results/*
  cy.exec(`rm -r ${reportPath}`, { failOnNonZeroExit: false })
}
