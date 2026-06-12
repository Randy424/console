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

        const { parsed, fleetContext } = analyzeRawPolicy(body.policy, body.allPolicies)
        const analysisProvider = await createProvider({ provider: body.provider as ProviderType })
        const fullResult = await analyzeWithProvider(parsed, analysisProvider, fleetContext)

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(fullResult))
      } catch (err) {
        logger.error({ msg: 'Policy analysis failed', error: err instanceof Error ? err.message : String(err) })
        respondInternalServerError(req, res)
      }
    })
  }
}
