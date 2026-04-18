/* Copyright Contributors to the Open Cluster Management project */
import { useEffect, useRef, useState } from 'react'
import debounce from 'debounce'
import { IPlacement } from '../common/resources/IPlacement'
import { postPlacementDebug, PlacementDebugResult } from '../../resources/placement-debug'
import { isRequestAbortedError } from '../../resources/utils/resource-request'

export interface PlacementDebugState {
  matched: string[]
  notMatched: string[]
  totalClusters: number
  matchedCount: number | undefined
  loading: boolean
  error: Error | undefined
}

const EMPTY_STATE: PlacementDebugState = {
  matched: [],
  notMatched: [],
  totalClusters: 0,
  matchedCount: undefined,
  loading: false,
  error: undefined,
}

function mapDebugResult(result: PlacementDebugResult): PlacementDebugState {
  if (result.error) {
    return { ...EMPTY_STATE, error: new Error(result.error) }
  }

  const allMatched = (result.aggregatedScores ?? []).map((s) => s.clusterName)
  const limit = result.placement?.spec?.numberOfClusters
  const matched = limit !== undefined && limit >= 0 ? allMatched.slice(0, limit) : allMatched
  const matchedSet = new Set(matched)

  const notMatched: string[] = []
  for (const clusterName of allMatched) {
    if (!matchedSet.has(clusterName)) {
      notMatched.push(clusterName)
    }
  }
  for (const pipeline of result.filteredPipelineResults ?? []) {
    for (const clusterName of pipeline.filteredClusters) {
      if (!matchedSet.has(clusterName) && !notMatched.includes(clusterName)) {
        notMatched.push(clusterName)
      }
    }
  }

  return {
    matched,
    notMatched,
    totalClusters: matched.length + notMatched.length,
    matchedCount: matched.length,
    loading: false,
    error: undefined,
  }
}

export function usePlacementDebug(placement: IPlacement | undefined, enabled = true): PlacementDebugState {
  const [state, setState] = useState<PlacementDebugState>(EMPTY_STATE)
  const abortRef = useRef<(() => void) | undefined>(undefined)

  // Serialize the full placement to detect in-place mutations from `set-value`.
  // No namespace guard — the server validates; the hook re-fetches when namespace appears.
  const specKey = placement ? JSON.stringify({ metadata: placement.metadata, spec: placement.spec }) : undefined

  const debouncedFetchRef = useRef(
    debounce((p: IPlacement) => {
      abortRef.current?.()
      setState((prev) => ({ ...prev, loading: true, error: undefined }))

      const { promise, abort } = postPlacementDebug(p)
      abortRef.current = abort

      promise
        .then((result) => {
          setState(mapDebugResult(result))
        })
        .catch((err: unknown) => {
          if (isRequestAbortedError(err)) return
          setState({ ...EMPTY_STATE, error: err instanceof Error ? err : new Error(String(err)) })
        })
    }, 500)
  )

  useEffect(() => {
    const debouncedFetch = debouncedFetchRef.current
    if (!enabled || !specKey || !placement) {
      setState(EMPTY_STATE)
      return
    }

    setState({ ...EMPTY_STATE, loading: true })
    debouncedFetch(placement)

    return () => {
      debouncedFetch.clear()
      abortRef.current?.()
    }
  }, [specKey, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
