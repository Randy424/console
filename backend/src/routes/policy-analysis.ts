/* Copyright Contributors to the Open Cluster Management project */
import type { Http2ServerRequest, Http2ServerResponse } from 'node:http2'
import { analyzeRawPolicy } from 'acm-policy-analysis'
import type { RawPolicy } from 'acm-policy-analysis'
import { analyzeWithProvider, createProvider } from 'acm-policy-analysis/providers'
import type { ProviderType } from 'acm-policy-analysis/providers'
import { logger } from '../lib/logger'
import { respondBadRequest, respondInternalServerError } from '../lib/respond'
import { getAuthenticatedToken } from '../lib/token'

interface PolicyAnalysisBody {
  policy: RawPolicy
  allPolicies?: RawPolicy[]
  provider?: string
}

export async function policyAnalysis(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  const token = await getAuthenticatedToken(req, res)
  if (token) {
    const chunks: string[] = []
    req.on('data', (chunk: string) => {
      chunks.push(chunk)
    })
    req.on('end', async () => {
      try {
        const body = JSON.parse(chunks.join('')) as PolicyAnalysisBody
        if (!body.policy) {
          respondBadRequest(req, res)
          return
        }

        const { parsed, result } = analyzeRawPolicy(body.policy, body.allPolicies)
        const analysisProvider = await createProvider({ provider: body.provider as ProviderType })
        const fullResult = await analyzeWithProvider(parsed, result, analysisProvider)

        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            policy: { name: parsed.name, namespace: parsed.namespace, disabled: parsed.disabled },
            provider: fullResult.provider,
            riskScores: result.riskScores,
            antiPatterns: result.antiPatterns,
            fleetRisk: result.fleetRisk
              ? {
                  fleetScore: result.fleetRisk.fleetScore,
                  fleetLevel: result.fleetRisk.fleetLevel,
                  worstCluster: result.fleetRisk.worstCluster,
                  mostViolatedPolicy: result.fleetRisk.mostViolatedPolicy,
                  severityBuckets: result.fleetRisk.severityBuckets,
                  riskDistribution: result.fleetRisk.riskDistribution,
                }
              : undefined,
            summary: fullResult.summary,
            riskExplanation: fullResult.riskExplanation,
            catastrophicPrediction: fullResult.catastrophicPrediction,
            accidentalScenarios: fullResult.accidentalScenarios,
          })
        )
      } catch (err) {
        logger.error({ msg: 'Policy analysis failed', error: err instanceof Error ? err.message : String(err) })
        respondInternalServerError(req, res)
      }
    })
  }
}
