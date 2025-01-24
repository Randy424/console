import * as _ from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk'
import { fetchRetry, getBackendUrl } from '../../../resources/utils'
import { getResourceNameApiPath, getResourcePlural } from '../../../resources'
import { ClusterScopeContext } from '../../../plugin-extensions/ClusterScopeContext'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: FIXME missing exports due to out-of-sync @types/react-redux version

type GetK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, any]

export type Query = { [key: string]: any }

export type MakeQuery = (
  namespace?: string,
  labelSelector?: any,
  fieldSelector?: any,
  name?: string,
  limit?: number
) => Query

export const useK8sGetResource = (resource: WatchK8sResource | null): GetK8sResult<any> => {
  const [data, setData] = useState<any>({})
  const [loaded, setLoaded] = useState<boolean>(false)
  const [error, setError] = useState<any>(undefined)
  const { cluster: clusterName } = useContext(ClusterScopeContext)

  const fetchData = async (resource: WatchK8sResource | null) => {
    if (!resource) {
      setData({})
      setLoaded(false)
      setError(undefined)
      return
    }
    try {
      let resourceGroup = resource.groupVersionKind?.group ? `${resource.groupVersionKind?.group}/` : ''
      let apiVersion = `${resourceGroup}${resource.groupVersionKind?.version}`

      const pluralResourceKind = await getResourcePlural({
        kind: resource.groupVersionKind?.kind || '',
        apiVersion: apiVersion,
      })

      const resourcePath = await getResourceNameApiPath({
        kind: resource.groupVersionKind?.kind || '',
        apiVersion: apiVersion,
        metadata: { namespace: resource.namespace, name: resource.name },
        plural: pluralResourceKind,
      })

      const requestPath = `${getBackendUrl()}/managedclusterproxy/${clusterName}${resourcePath}`
      const headers: HeadersInit = { ['Content-Type']: 'application/json' }

      fetchRetry({
        method: 'GET',
        url: requestPath,
        headers: headers,
        retries: 0,
      })
        .then((response) => {
          if (response.status !== 200) {
            setError(new Error('Failed to fetch data'))
            setLoaded(true)
          } else {
            setData((response.data as { items: any }).items)
            setLoaded(true)
          }
        })
        .catch((err) => {
          setError(err)
          setLoaded(true)
        })
    } catch (err) {
      setError(err)
      setLoaded(true)
    }
  }

  useEffect(() => {
    fetchData(resource)
  }, [])

  return [data, loaded, error]
}
