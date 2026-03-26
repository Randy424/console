/* Copyright Contributors to the Open Cluster Management project */
import { Modal, ModalVariant, SearchInput } from '@patternfly/react-core'
import { useState, useMemo } from 'react'
import { useTranslation } from '../../lib/acm-i18next'
import { AcmTable } from '../../ui-components'
import { IResource } from '../common/resources/IResource'

export interface MatchedClustersModalProps {
  isOpen: boolean
  onClose: () => void
  matchedClusters: IResource[]
  notMatchedClusters: IResource[]
}

export function MatchedClustersModal(props: MatchedClustersModalProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMatchedClusters = useMemo(() => {
    if (!searchTerm) return props.matchedClusters
    const lowerSearch = searchTerm.toLowerCase()
    return props.matchedClusters.filter((cluster) =>
      cluster.metadata?.name?.toLowerCase().includes(lowerSearch)
    )
  }, [props.matchedClusters, searchTerm])

  const filteredNotMatchedClusters = useMemo(() => {
    if (!searchTerm) return props.notMatchedClusters
    const lowerSearch = searchTerm.toLowerCase()
    return props.notMatchedClusters.filter((cluster) =>
      cluster.metadata?.name?.toLowerCase().includes(lowerSearch)
    )
  }, [props.notMatchedClusters, searchTerm])

  const columns = [
    {
      header: t('Cluster name'),
      cell: (cluster: IResource) => cluster.metadata?.name ?? '-',
      sort: (a: IResource, b: IResource) => {
        const aName = a.metadata?.name ?? ''
        const bName = b.metadata?.name ?? ''
        return aName.localeCompare(bName)
      },
    },
  ]

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('{{count}} clusters matched', { count: props.matchedClusters.length })}
      isOpen={props.isOpen}
      onClose={props.onClose}
      hasNoBodyWrapper
    >
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SearchInput
          placeholder={t('Search clusters')}
          value={searchTerm}
          onChange={(_event, value) => setSearchTerm(value)}
          onClear={() => setSearchTerm('')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
          {filteredMatchedClusters.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{t('Matched')}</h3>
              <AcmTable<IResource>
                items={filteredMatchedClusters}
                emptyState={undefined}
                columns={columns}
                keyFn={(cluster: IResource) => cluster.metadata?.uid ?? cluster.metadata?.name ?? ''}
                tableActions={[]}
                rowActions={[]}
                bulkActions={[]}
                perPageOptions={[]}
                autoHidePagination
              />
            </div>
          )}

          {filteredNotMatchedClusters.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{t('Not matched')}</h3>
              <AcmTable<IResource>
                items={filteredNotMatchedClusters}
                emptyState={undefined}
                columns={columns}
                keyFn={(cluster: IResource) => cluster.metadata?.uid ?? cluster.metadata?.name ?? ''}
                tableActions={[]}
                rowActions={[]}
                bulkActions={[]}
                perPageOptions={[]}
                autoHidePagination
              />
            </div>
          )}

          {filteredMatchedClusters.length === 0 && filteredNotMatchedClusters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              {searchTerm ? t('No clusters found matching "{{search}}"', { search: searchTerm }) : t('No clusters')}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
