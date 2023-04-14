/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

import * as constants from '../constants'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const getLatestImageSet = (labels) => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let url = constants.apiUrl + constants.hive_api_path + '/clusterimagesets'
  if (labels) url = url + `?labelSelector=${labels}`
  let options = {
    method: 'GET',
    url: url,
    headers: headers,
    failOnStatusCode: false,
  }
  return cy
    .request(options)
    .its('body')
    .its('items')
    .then((items) => {
      items.sort(function (a, b) {
        if (a.metadata.name.split('.')[0] != b.metadata.name.split('.')[0]) {
          return a.metadata.name.split('.')[0] - b.metadata.name.split('.')[0]
        }
        if (parseInt(a.metadata.name.split('.')[1]) < parseInt(b.metadata.name.split('.')[1])) return -1
        if (parseInt(a.metadata.name.split('.')[1]) < parseInt(b.metadata.name.split('.')[1])) return 1
        if (parseInt(a.metadata.name.split('.')[1]) == parseInt(b.metadata.name.split('.')[1])) {
          if (
            parseInt(a.metadata.name.split('.')[2].split('-')[0]) <
            parseInt(b.metadata.name.split('.')[2].split('-')[0])
          )
            return -1
          if (
            parseInt(a.metadata.name.split('.')[2].split('-')[0]) >
            parseInt(b.metadata.name.split('.')[2].split('-')[0])
          )
            return 1
        }
      })
      return cy.wrap(items[items.length - 1].spec.releaseImage)
    })
}

export const enableSNO = () => {
  headers.Authorization = `Bearer ${Cypress.env('token')}`
  let options = {
    method: 'GET',
    url: constants.apiUrl + '/api/v1/namespaces/' + Cypress.env('MCE_NAMESPACE') + '/configmaps/console-mce-config',
    headers: headers,
  }
  return cy.request(options).then((resp) => {
    if (resp.body.data.singleNodeOpenshift !== 'enabled') {
      options.method = 'PUT'
      resp.body.data.singleNodeOpenshift = 'enabled'
      options.body = resp.body
      return cy.request(options)
    }
  })
}
