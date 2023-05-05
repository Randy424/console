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

    // add a date to the cluster and cluster pool name to make it unique
    let date = Date.now()
    let providers = ['aws', 'azure', 'gcp', 'azgov']
    console.log("Adding Date.now() suffix to all cluster names in options-*.yaml loaded: \n")
    providers.forEach(provider => {
      envConfig.options.clusters[provider].clusterName = envConfig.options.clusters[provider].clusterName + "-" + date
      envConfig.options.clusterPools[provider].clusterPoolName = envConfig.options.clusterPools[provider].clusterPoolName + "-" + date
      console.log(provider + " cluster name used in tests will be: " + envConfig.options.clusters[provider].clusterName + "\n" +
      provider + " cluster pool name used in tests will be: " + envConfig.options.clusterPools[provider].clusterPoolName)
    })
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
