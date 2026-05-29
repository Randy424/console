/* Copyright Contributors to the Open Cluster Management project */
import nock from 'nock'
import { parsePipedJsonBody } from '../../src/lib/body-parser'
import { request } from '../mock-request'

const testPolicy = {
  apiVersion: 'policy.open-cluster-management.io/v1',
  kind: 'Policy',
  metadata: {
    name: 'test-config-policy',
    namespace: 'default',
  },
  spec: {
    disabled: false,
    remediationAction: 'inform',
    'policy-templates': [
      {
        objectDefinition: {
          apiVersion: 'policy.open-cluster-management.io/v1',
          kind: 'ConfigurationPolicy',
          metadata: { name: 'cfg' },
          spec: {
            severity: 'high',
            'object-templates': [
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'v1',
                  kind: 'ConfigMap',
                  metadata: { name: 'my-config', namespace: 'my-app' },
                },
              },
            ],
          },
        },
      },
    ],
  },
  status: {
    compliant: 'NonCompliant',
    status: [
      { clustername: 'cluster-1', clusternamespace: 'cluster-1', compliant: 'NonCompliant' },
      { clustername: 'cluster-2', clusternamespace: 'cluster-2', compliant: 'Compliant' },
    ],
  },
}

describe('Policy Analysis Route', function () {
  it('should return 401 without auth', async function () {
    nock(process.env.CLUSTER_API_URL).get('/apis').reply(401)
    const res = await request('POST', '/policy-analysis', { policy: testPolicy })
    expect(res.statusCode).toEqual(401)
  })

  it('should return 400 when policy is missing from body', async function () {
    nock(process.env.CLUSTER_API_URL).get('/apis').reply(200)
    const res = await request('POST', '/policy-analysis', {})
    expect(res.statusCode).toEqual(400)
  })

  it('should return analysis result for a valid policy', async function () {
    nock(process.env.CLUSTER_API_URL).get('/apis').reply(200)
    const res = await request('POST', '/policy-analysis', { policy: testPolicy, provider: 'deterministic' })
    expect(res.statusCode).toEqual(200)

    const body = await parsePipedJsonBody<Record<string, unknown>>(res)
    expect(body.policy).toEqual({
      name: 'test-config-policy',
      namespace: 'default',
      disabled: false,
    })
    expect(body.provider).toEqual('deterministic')
    expect(body.summary).toBeDefined()
    expect(typeof body.summary).toEqual('string')
    expect(body.riskExplanation).toBeDefined()
    expect(body.riskScores).toBeDefined()
    expect(body.antiPatterns).toBeDefined()
    expect(body.catastrophicPrediction).toBeDefined()
    expect(Array.isArray(body.accidentalScenarios)).toBe(true)
  })

  it('should include fleet risk when allPolicies is provided', async function () {
    nock(process.env.CLUSTER_API_URL).get('/apis').reply(200)
    const res = await request('POST', '/policy-analysis', {
      policy: testPolicy,
      allPolicies: [testPolicy],
      provider: 'deterministic',
    })
    expect(res.statusCode).toEqual(200)

    const body = await parsePipedJsonBody<Record<string, unknown>>(res)
    expect(body.fleetRisk).toBeDefined()
    const fleet = body.fleetRisk as Record<string, unknown>
    expect(typeof fleet.fleetScore).toEqual('number')
    expect(fleet.fleetLevel).toBeDefined()
    expect(fleet.severityBuckets).toBeDefined()
    expect(fleet.riskDistribution).toBeDefined()
  })
})
