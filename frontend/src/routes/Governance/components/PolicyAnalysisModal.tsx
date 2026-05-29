/* Copyright Contributors to the Open Cluster Management project */

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Label,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Skeleton,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../../lib/acm-i18next'
import { Policy } from '../../../resources'
import { getBackendUrl, postRequest } from '../../../resources/utils'

interface StructuredRisk {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  recommendation: string
}

interface StructuredCatastrophicAssessment {
  severity: string
  reasoning: string
  cascadingFailures: { trigger: string; chain: string[]; finalImpact: string }[]
}

interface StructuredAccidentalScenario {
  title: string
  description: string
  likelihood: string
  impact: string
  recommendation: string
}

interface StructuredAnalysis {
  summary: string
  risks: StructuredRisk[]
  recommendations: string[]
  catastrophicAssessment: StructuredCatastrophicAssessment
  accidentalScenarios: StructuredAccidentalScenario[]
}

interface PolicyAnalysisResponse {
  policy: { name: string; namespace: string; disabled: boolean }
  provider: string
  impactedClusters: string[]
  analysis: StructuredAnalysis
  timestamp: string
}

const SEVERITY_COLORS: Record<string, 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'grey'> = {
  CRITICAL: 'red',
  CATASTROPHIC: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
  NONE: 'green',
}

function severityColor(level: string) {
  return SEVERITY_COLORS[level] ?? 'grey'
}

function ImpactedClustersSection({
  clusters,
  t,
}: {
  clusters: string[]
  t: (key: string) => string
}) {
  if (clusters.length === 0) return null

  return (
    <StackItem>
      <Card isPlain isCompact>
        <CardTitle>{t('Potentially impacted clusters')}</CardTitle>
        <CardBody>
          <Flex spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'wrap' }}>
            {clusters.map((cluster) => (
              <FlexItem key={cluster}>
                <Label isCompact>{cluster}</Label>
              </FlexItem>
            ))}
          </Flex>
        </CardBody>
      </Card>
    </StackItem>
  )
}

function RisksSection({
  risks,
  t,
}: {
  risks: StructuredRisk[]
  t: (key: string) => string
}) {
  if (risks.length === 0) return null

  return (
    <StackItem>
      <Title headingLevel="h3">{t('Risks')}</Title>
      <Stack hasGutter style={{ marginTop: '8px' }}>
        {risks.map((risk, idx) => (
          <StackItem key={idx}>
            <Card isPlain isCompact>
              <CardBody>
                <Split hasGutter>
                  <SplitItem>
                    <Label color={severityColor(risk.severity)} isCompact>
                      {risk.severity}
                    </Label>
                  </SplitItem>
                  <SplitItem isFilled>
                    <Stack>
                      <StackItem>
                        <strong>{risk.title}</strong>
                      </StackItem>
                      <StackItem style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                        {risk.description}
                      </StackItem>
                      <StackItem>
                        <Label color="blue" isCompact variant="outline">
                          {t('Recommendation')}
                        </Label>{' '}
                        {risk.recommendation}
                      </StackItem>
                    </Stack>
                  </SplitItem>
                </Split>
              </CardBody>
            </Card>
          </StackItem>
        ))}
      </Stack>
    </StackItem>
  )
}

function RecommendationsSection({
  recommendations,
  t,
}: {
  recommendations: string[]
  t: (key: string) => string
}) {
  if (recommendations.length === 0) return null

  return (
    <StackItem>
      <Title headingLevel="h3">{t('Recommendations')}</Title>
      <List style={{ marginTop: '8px' }}>
        {recommendations.map((rec, idx) => (
          <ListItem key={idx}>{rec}</ListItem>
        ))}
      </List>
    </StackItem>
  )
}

function CatastrophicSection({
  assessment,
  t,
}: {
  assessment: StructuredCatastrophicAssessment
  t: (key: string) => string
}) {
  if (assessment.severity === 'LOW' && assessment.cascadingFailures.length === 0) return null

  return (
    <StackItem>
      <Alert
        variant="danger"
        title={t('Catastrophic placement risk')}
        isInline
        ouiaId="catastrophicAlert"
      >
        <Stack hasGutter>
          <StackItem>
            <Label color={severityColor(assessment.severity)} isCompact>
              {assessment.severity}
            </Label>
          </StackItem>
          <StackItem>{assessment.reasoning}</StackItem>
          {assessment.cascadingFailures.map((failure, idx) => (
            <StackItem key={idx}>
              <Alert variant="warning" title={failure.trigger} isInline isPlain>
                {failure.chain.join(' → ')} → {failure.finalImpact}
              </Alert>
            </StackItem>
          ))}
        </Stack>
      </Alert>
    </StackItem>
  )
}

function AccidentalScenariosSection({
  scenarios,
  t,
}: {
  scenarios: StructuredAccidentalScenario[]
  t: (key: string) => string
}) {
  if (scenarios.length === 0) return null

  return (
    <StackItem>
      <Title headingLevel="h3">{t('Predicted unintended outcomes')}</Title>
      <Stack hasGutter style={{ marginTop: '8px' }}>
        {scenarios.map((scenario, idx) => (
          <StackItem key={idx}>
            <Alert variant="warning" title={scenario.title} isInline ouiaId={`scenario-${idx}`}>
              <Stack>
                <StackItem>{scenario.description}</StackItem>
                <StackItem>
                  <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                    <FlexItem>
                      <strong>{t('Likelihood')}: </strong>
                      <Label color={severityColor(scenario.likelihood)} isCompact>
                        {scenario.likelihood}
                      </Label>
                    </FlexItem>
                    <FlexItem>
                      <strong>{t('Impact')}: </strong>
                      <Label color={severityColor(scenario.impact)} isCompact>
                        {scenario.impact}
                      </Label>
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem>
                  <Label color="blue" isCompact variant="outline">
                    {t('Recommendation')}
                  </Label>{' '}
                  {scenario.recommendation}
                </StackItem>
              </Stack>
            </Alert>
          </StackItem>
        ))}
      </Stack>
    </StackItem>
  )
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
    >(url, { policy, allPolicies: policies, provider: 'auto' })

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

        {!isFetching && result && !error && result.analysis && (
          <Stack hasGutter>
            <ImpactedClustersSection clusters={result.impactedClusters ?? []} t={t} />

            {result.analysis.summary && (
              <StackItem>
                <Title headingLevel="h3">{t('Summary')}</Title>
                <p style={{ marginTop: '8px' }}>{result.analysis.summary}</p>
              </StackItem>
            )}

            <StackItem>
              <Divider />
            </StackItem>

            <CatastrophicSection assessment={result.analysis.catastrophicAssessment} t={t} />

            <RisksSection risks={result.analysis.risks} t={t} />

            <AccidentalScenariosSection scenarios={result.analysis.accidentalScenarios} t={t} />

            <StackItem>
              <Divider />
            </StackItem>

            <RecommendationsSection recommendations={result.analysis.recommendations} t={t} />

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
