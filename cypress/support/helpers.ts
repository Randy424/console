/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

import { join } from 'path'

export function cleanReports() {
  const reportPath = join(__dirname, '..', 'results')
  // recursively remove old reports if they exist in /cypress/results/*
  cy.exec(`rm -r ${reportPath}`, { failOnNonZeroExit: false })
}
