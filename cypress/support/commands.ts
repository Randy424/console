//
// Command library

import 'cypress-wait-until'
import * as constants from './constants'

Cypress.Commands.add('multiselect', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, text: string) => {
  cy.wrap(subject)
    .click()
    .get('.pf-c-check')
    .contains(text)
    .parent()
    .within(() => cy.get('[type="checkbox"]').check())
})

// Login
// cy.session & cacheAcrossSpecs option will preserve session cache (cookies) across specs
// 'local-user' is the session id for caching and restoring session
Cypress.Commands.add('login', (user: string = 'kube:admin', password?: string) => {
  cy.session(
    user,
    () => {
      if (process.env.NODE_ENV === 'production' || password) {
        const baseUrl = Cypress.env('BASE_URL')
        const username = user || Cypress.env('OPTIONS_HUB_USER')
        const pass = password || Cypress.env('OPTIONS_HUB_PASSWORD')
        cy.exec(`oc login ${baseUrl} -u ${username} -p ${pass}`).then(() => {
          cy.exec('oc whoami -t').then((result) => {
            cy.setCookie('acm-access-token-cookie', result.stdout)
            Cypress.env({ token: result.stdout })
          })
        })
      } else {
        // simple auth for local development environments
        cy.exec('oc whoami -t').then((result) => {
          cy.setCookie('acm-access-token-cookie', result.stdout)
        })
      }
      cy.exec('curl --insecure https://localhost:3000', { timeout: 120000 })
    },
    { cacheAcrossSpecs: true }
  )
})

Cypress.Commands.add('createNamespace', (namespace: string) => {
  cy.exec(`oc create namespace ${namespace}`)
  cy.exec(`oc label namespaces ${namespace} cypress=true`)
})

Cypress.Commands.add('deleteNamespace', (namespace: string) => {
  cy.exec(`oc delete namespace ${namespace}`)
})

Cypress.Commands.add('failOnErrorResponseStatus', (resp: any, errorMsg) => {
  expect(resp.status, errorMsg + ' ' + resp.body.message).to.match(/20[0,1]/)
})

Cypress.Commands.add(
  'paste',
  {
    // @ts-ignore
    prevSubject: true,
    element: true,
  },
  ($element, text) => {
    const subString = text.substr(0, text.length - 1)
    const lastChar = text.slice(-1)

    $element.text(subString)
    $element.val(subString)
    cy.get($element)
      .type(lastChar)
      .then(() => {
        if ($element.val() !== text)
          // first usage only setStates the last character for some reason
          cy.get($element).clear().type(text)
      })
  }
)

Cypress.Commands.add('acquireToken', () => {
  cy.request({
    method: 'HEAD',
    url: constants.authUrl + '/oauth/authorize?response_type=token&client_id=openshift-challenging-client',
    followRedirect: false,
    headers: {
      'X-CSRF-Token': 1,
    },
    auth: {
      username: Cypress.env('OPTIONS_HUB_USER'),
      password: Cypress.env('OPTIONS_HUB_PASSWORD'),
    },
  }).then((resp) => {
    if (typeof resp.headers.location === 'string') {
      return resp.headers.location.match(/access_token=([^&]+)/)[1]
    } else if (Array.isArray(resp.headers.location))
      return resp.headers.location.join().match(/access_token=([^&]+)/)[1]
  })
}),
  Cypress.Commands.add('setAPIToken', () => {
    cy.acquireToken().then((token) => {
      Cypress.env('token', token)
    })
  })

Cypress.Commands.add('clearOCMCookies', () => {
  cy.clearCookie('acm-access-token-cookie')
  cy.clearCookie('_oauth_proxy')
  cy.clearCookie('XSRF-TOKEN')
  cy.clearCookie('_csrf')
  cy.clearCookie('openshift-session-token')
  cy.clearCookie('csrf-token')
})

Cypress.Commands.add(
  'runCmd',
  (cmd, setAlias = false, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    cy.log(`Executing command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add(
  'uploadDiscoveryISO',
  (
    vmName,
    discoveryIsoName,
    isoPath,
    setAlias = false,
    failOnNonZeroExit = true,
    timeout = Cypress.config('defaultCommandTimeout')
  ) => {
    var cmd = `virsh change-media ${vmName} hdd ${isoPath}/${discoveryIsoName} --update`
    cy.log(`Executing command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add(
  'wipeVmDisk',
  (pathToDiskFile, setAlias = false, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    var cmd = `qemu-img create -f qcow2 ${pathToDiskFile} 120G`
    cy.log(`Executing command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add(
  'startVM',
  (vmName, setAlias = false, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    var cmd = `virsh start ${vmName}`
    cy.log(`Executing command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add(
  'destroyVM',
  (vmName, setAlias = false, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    var cmd = `virsh destroy ${vmName}`
    cy.log(`Executing command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add(
  'copyKubeconfigToPath',
  (
    kubeconfigCurrentPath,
    newPath,
    setAlias = false,
    failOnNonZeroExit = true,
    timeout = Cypress.config('defaultCommandTimeout')
  ) => {
    var cmd = `cp ${kubeconfigCurrentPath} ${newPath}`
    cy.log(`Executing cypress copy kubeconfig command: ${cmd}`)
    if (setAlias) {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias')
      })
    } else {
      cy.exec(`${cmd}`, { timeout: timeout, failOnNonZeroExit: failOnNonZeroExit })
    }
  }
)

Cypress.Commands.add('hostDetailSelector', (row, label, timeout = Cypress.config('defaultCommandTimeout')) =>
  cy.get(`table.hosts-table > tbody:nth-child(${row}) > tr:nth-child(1) > [data-label="${label}"]`, {
    timeout: timeout,
  })
)

/**
 * Gets the current visible yaml editor inner text
 * Must be on a page with the editor already open
 */
Cypress.Commands.add('getYamlEditorText', (divElement) => {
  cy.viewport(4000, 4000) // enlarge view to get full yaml content from page
  cy.wait(1000)
  cy.get(divElement)
    .find('div.lines-content')
    .then(($yaml) => {
      return cy.wrap($yaml[0].innerText).as('yamlInnerText')
    })
})

Cypress.Commands.add('toggleYamlEditor', (divElement) => {
  cy.get(divElement).click({ force: true })
})

Cypress.Commands.add('getYamlEditorTextCreate', () => {
  cy.getYamlEditorText('div.yamlEditorContainer:visible')
})

Cypress.Commands.add('getYamlEditorTextImport', () => {
  cy.getYamlEditorText('div.pf-c-drawer__main:visible')
})

// TODO: verify these two overwrites are actually being used
Cypress.Commands.overwrite('click', (originalFunction, subject, options: any) => {
  options = options || {}
  options.force = true
  return originalFunction(subject, options)
})

Cypress.Commands.overwrite('type', (originalFunction, element: JQuery<HTMLElement>, text, options: any) => {
  if (options && options.sensitive) {
    // turn off original logging so we don't print the unmasked data
    options.log = false
    // now let's override this function to hide sensitive data instead
    Cypress.log({
      $el: element,
      name: 'type',
      message: '*'.repeat(20),
    })
  }
  // return originalFn(element, text, options)
  return originalFunction(text, options)
})
