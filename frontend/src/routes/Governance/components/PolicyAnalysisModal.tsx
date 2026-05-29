/* Copyright Contributors to the Open Cluster Management project */

import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../../lib/acm-i18next'
import { Policy } from '../../../resources'
import { getBackendUrl, postRequest } from '../../../resources/utils'

interface PolicyAnalysisResponse {
  policy: { name: string; namespace: string; disabled: boolean }
  provider: string
  riskScores: { cluster: string; normalized: number; level: string }[]
  antiPatterns: { id: string; riskLevel: string; category: string; finding: string; recommendation: string }[]
  fleetRisk?: {
    fleetScore: number
    fleetLevel: string
    worstCluster?: { name: string; score: number }
    severityBuckets: Record<string, number>
    riskDistribution: Record<string, number>
  }
  summary?: string
  riskExplanation?: string
  catastrophicPrediction?: {
    confidence: number
    reasoning: string
    blastRadius: { affectedClusters: string[]; affectedResources: string[] }
  }
  accidentalScenarios?: { id: string; description: string; likelihood: string; impact: string }[]
}

const RISK_LEVEL_COLORS: Record<string, 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'grey'> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
  NONE: 'green',
}

function riskColor(level: string) {
  return RISK_LEVEL_COLORS[level] ?? 'grey'
}

export function PolicyAnalysisModal({
  policy,
  policies,
  isOpen,
  onClose,
}: Readonly<{
  policy: Policy
  policies: Policy[]
  isOpen: boolean
  onClose: () => void
}>) {
  const { t } = useTranslation()
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [result, setResult] = useState<PolicyAnalysisResponse | undefined>()
  const abortRef = useRef<(() => void) | undefined>()

  useEffect(() => {
    if (!isOpen) return

    let ignore = false
    setIsFetching(true)
    setError(undefined)

    const url = getBackendUrl() + '/policy-analysis'
    const { promise, abort } = postRequest<
      { policy: Policy; allPolicies: Policy[]; provider: string },
      PolicyAnalysisResponse
    >(url, { policy, allPolicies: policies, provider: 'deterministic' })

    abortRef.current = abort

    promise
      .then((data) => {
        if (ignore) return
        setResult(data)
        setIsFetching(false)
      })
      .catch((err) => {
        if (ignore) return
        console.error('Policy analysis failed:', err)
        setError(err instanceof Error ? err.message : String(err))
        setIsFetching(false)
      })

    return () => {
      ignore = true
      abortRef.current?.()
    }
  }, [isOpen, policy, policies])

  const policyName = policy?.metadata?.name ?? ''

  return (
    <Modal variant={ModalVariant.large} isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={t('Policy analysis: {{name}}', { name: policyName })} />
      <ModalBody>
        {isFetching && (
          <Stack hasGutter>
            <StackItem>
              <Skeleton width="40%" height="2em" screenreaderText={t('Loading analysis')} />
            </StackItem>
            <StackItem>
              <Skeleton width="100%" height="6em" />
            </StackItem>
            <StackItem>
              <Skeleton width="100%" height="4em" />
            </StackItem>
          </Stack>
        )}

        {!isFetching && error && (
          <Alert variant="danger" title={t('Analysis failed')} ouiaId="analysisError">
            {error}
          </Alert>
        )}

        {!isFetching && result && !error && (
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h3">{t('Risk overview')}</Title>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                {result.fleetRisk ? (
                  <>
                    <Label color={riskColor(result.fleetRisk.fleetLevel)}>
                      {t('Fleet risk: {{score}}/100 ({{level}})', {
                        score: result.fleetRisk.fleetScore,
                        level: result.fleetRisk.fleetLevel,
                      })}
                    </Label>
                    {result.fleetRisk.worstCluster && (
                      <Label color="grey">
                        {t('Worst cluster: {{name}}', { name: result.fleetRisk.worstCluster.name })}
                      </Label>
                    )}
                  </>
                ) : (
                  result.riskScores.map((rs) => (
                    <Label key={rs.cluster} color={riskColor(rs.level)}>
                      {rs.cluster}: {rs.normalized}/100
                    </Label>
                  ))
                )}
              </div>
            </StackItem>

            {result.summary && (
              <StackItem>
                <Title headingLevel="h3">{t('Summary')}</Title>
                <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{result.summary}</p>
              </StackItem>
            )}

            {result.antiPatterns && result.antiPatterns.length > 0 && (
              <StackItem>
                <Title headingLevel="h3">{t('Anti-pattern findings')}</Title>
                <DescriptionList isHorizontal style={{ marginTop: '8px' }}>
                  {result.antiPatterns.map((ap) => (
                    <DescriptionListGroup key={ap.id}>
                      <DescriptionListTerm>
                        <Label color={riskColor(ap.riskLevel)} isCompact>
                          {ap.riskLevel}
                        </Label>{' '}
                        {ap.id}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        <strong>{ap.finding}</strong>
                        <br />
                        {ap.recommendation}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              </StackItem>
            )}

            {result.catastrophicPrediction && result.catastrophicPrediction.confidence > 0 && (
              <StackItem>
                <Alert variant="danger" title={t('Catastrophic placement risk')} ouiaId="catastrophicAlert">
                  <p>
                    {t('Confidence: {{confidence}}%', {
                      confidence: Math.round(result.catastrophicPrediction.confidence * 100),
                    })}
                  </p>
                  <p>{result.catastrophicPrediction.reasoning}</p>
                  {result.catastrophicPrediction.blastRadius.affectedClusters.length > 0 && (
                    <p>
                      {t('Affected clusters: {{clusters}}', {
                        clusters: result.catastrophicPrediction.blastRadius.affectedClusters.join(', '),
                      })}
                    </p>
                  )}
                </Alert>
              </StackItem>
            )}

            {result.accidentalScenarios && result.accidentalScenarios.length > 0 && (
              <StackItem>
                <Title headingLevel="h3">{t('Accidental scenarios')}</Title>
                <Stack hasGutter style={{ marginTop: '8px' }}>
                  {result.accidentalScenarios.map((scenario) => (
                    <StackItem key={scenario.id}>
                      <Alert
                        variant="warning"
                        title={`${scenario.id}: ${scenario.description}`}
                        isInline
                        ouiaId={`scenario-${scenario.id}`}
                      >
                        {t('Likelihood: {{likelihood}} | Impact: {{impact}}', {
                          likelihood: scenario.likelihood,
                          impact: scenario.impact,
                        })}
                      </Alert>
                    </StackItem>
                  ))}
                </Stack>
              </StackItem>
            )}

            <StackItem>
              <Label color="grey" isCompact>
                {t('Provider: {{provider}}', { provider: result.provider })}
              </Label>
            </StackItem>
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
