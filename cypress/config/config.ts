/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

import { readFileSync } from 'fs'
import { join } from 'path'
import { load } from 'js-yaml'

export function getTestEnv() {
  let envConfig: any = readFileSync(join(__dirname, 'options.yaml'))
  try {
    envConfig = load(envConfig)
  } catch (e) {
    throw new Error(e)
  }
  return JSON.stringify(envConfig)
}

export function getTestInfraEnv() {
  let config
  if (process.env.NODE_ENV != 'cim') {
    return 'No need for infraenv configs.'
  } else {
    config = readFileSync(join(__dirname, 'config-infraenv.yaml'))
    try {
      config = load(config)
    } catch (e) {
      throw new Error(e)
    }
    return JSON.stringify(config)
  }
}

export function getExtraVars() {
  let config
  if (process.env.NODE_ENV != 'cim') {
    return 'No need for extravars configs.'
  } else {
    config = readFileSync(join(__dirname, 'extravars.yaml'))
    try {
      config = load(config)
    } catch (e) {
      throw new Error(e)
    }
    return JSON.stringify(config)
  }
}
