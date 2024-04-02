export interface MatchExpressions {
  key: string
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist' | undefined
  values?: string[]
}
export interface Selector {
  matchExpressions?: MatchExpressions[]
  matchLabels?: Record<string, string>
}
