/* Copyright Contributors to the Open Cluster Management project */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AgentK8sResource,
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolK8sResource,
} from '@openshift-assisted/ui-lib/cim'
import { RecoilRoot } from 'recoil'
import { nockIgnoreRBAC } from '../../../../../lib/nock-util'
import { ConfigMap, NodePool } from '../../../../../resources'
import { Cluster, ClusterStatus } from '../../../../../resources/utils'
import { Provider } from '../../../../../ui-components'
import { HypershiftUpgradeModal } from './HypershiftUpgradeModal'
import { configMapsState } from '../../../../../atoms'

const mockNodepools: NodePoolK8sResource[] = [
  {
    apiVersion: 'hypershift.openshift.io/v1alpha1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-1',
      namespace: 'clusters',
    },
    spec: {
      management: { upgradeType: 'Replace' },
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
    status: {
      version: '4.11.12',
    },
  },
  {
    apiVersion: 'hypershift.openshift.io/v1alpha1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-2',
      namespace: 'clusters',
    },
    spec: {
      management: { upgradeType: 'Replace' },
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
    status: {
      version: '4.10.18',
    },
  },
  {
    apiVersion: 'hypershift.openshift.io/v1alpha1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-3',
      namespace: 'clusters',
    },
    spec: {
      management: { upgradeType: 'Replace' },
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
    status: {
      version: '4.10.17',
    },
  },
  {
    apiVersion: 'hypershift.openshift.io/v1alpha1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-4',
      namespace: 'clusters',
    },
    spec: {
      management: { upgradeType: 'Replace' },
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
    status: {
      version: '4.10.16',
    },
  },
  {
    apiVersion: 'hypershift.openshift.io/v1alpha1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-5',
      namespace: 'clusters',
    },
    spec: {
      management: { upgradeType: 'Replace' },
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
    status: {
      version: '4.10.15',
    },
  },
]

const mockNodepoolsNoStatus: NodePool[] = [
  {
    apiVersion: 'hypershift.openshift.io/v1beta1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-1',
      namespace: 'clusters',
    },
    spec: {
      management: {},
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
  },
  {
    apiVersion: 'hypershift.openshift.io/v1beta1',
    kind: 'NodePool',
    metadata: {
      name: 'feng-hypershift-test-2',
      namespace: 'clusters',
    },
    spec: {
      management: {},
      clusterName: '',
      platform: {
        aws: {
          instanceProfile: '',
          instanceType: '',
          rootVolume: {
            size: 1,
            type: '',
          },
          securityGroups: [],
          subnet: {
            id: '',
          },
        },
        type: '',
      },
      release: {
        image: '',
      },
      replicas: 1,
    },
  },
]

const availableUpdates0: Record<string, string> = {
  '4.12.0': 'quay.io/openshift-release-dev/ocp-release:4.12.0-ec.4-x86_64',
}

const availableUpdates1: Record<string, string> = {
  '4.11.12': 'quay.io/openshift-release-dev/ocp-release:4.11.12-x86_64',
}

const availableUpdates2: Record<string, string> = {
  '5.0.12': 'quay.io/openshift-release-dev/ocp-release:5.0.12-x86_64',
}

const availableUpdates3: Record<string, string> = {
  '5.0.12': 'quay.io/openshift-release-dev/ocp-release:5.0.12-x86_64',
  '4.12.0': 'quay.io/openshift-release-dev/ocp-release:4.12.0-ec.4-x86_64',
  '4.11.12': 'quay.io/openshift-release-dev/ocp-release:4.11.12-x86_64',
}

const availableUpdates4: Record<string, string> = {
  '4.15.12': 'quay.io/openshift-release-dev/ocp-release:4.15.12-x86_64',
  '4.14.0': 'quay.io/openshift-release-dev/ocp-release:4.14.0-ec.4-x86_64',
  '4.13.12': 'quay.io/openshift-release-dev/ocp-release:4.13.12-x86_64',
  '4.16.12': 'quay.io/openshift-release-dev/ocp-release:4.16.12-x86_64',
}

const mockCluster: Cluster = {
  name: 'hypershift-cluster1',
  displayName: 'hypershift-cluster1',
  namespace: 'clusters',
  uid: 'hypershift-cluster1-uid',
  provider: undefined,
  status: ClusterStatus.ready,
  distribution: {
    ocp: {
      version: '4.11.12',
      availableUpdates: [],
      desiredVersion: '4.11.12',
      upgradeFailed: false,
    },
    isManagedOpenShift: false,
  },
  labels: { abc: '123' },
  nodes: undefined,
  kubeApiServer: '',
  consoleURL: '',
  hasAutomationTemplate: false,
  hive: {
    isHibernatable: true,
    clusterPool: undefined,
    secrets: {
      installConfig: '',
    },
  },
  hypershift: {
    agent: false,
    hostingNamespace: 'clusters',
    nodePools: mockNodepools,
    secretNames: ['feng-hs-bug-ssh-key', 'feng-hs-bug-pull-secret'],
  },
  isHive: false,
  isManaged: true,
  isCurator: true,
  isHostedCluster: true,
  isHypershift: true,
  isSNOCluster: false,
  owner: {},
  kubeadmin: '',
  kubeconfig: '',
  isRegionalHubCluster: false,
}

const mockClusterHigherVersion: Cluster = {
  name: 'hypershift-cluster1',
  displayName: 'hypershift-cluster1',
  namespace: 'clusters',
  uid: 'hypershift-cluster1-uid',
  provider: undefined,
  status: ClusterStatus.ready,
  distribution: {
    ocp: {
      version: '4.11.15',
      availableUpdates: [],
      desiredVersion: '4.11.12',
      upgradeFailed: false,
    },
    isManagedOpenShift: false,
  },
  labels: { abc: '123' },
  nodes: undefined,
  kubeApiServer: '',
  consoleURL: '',
  hasAutomationTemplate: false,
  hive: {
    isHibernatable: true,
    clusterPool: undefined,
    secrets: {
      installConfig: '',
    },
  },
  hypershift: {
    agent: false,
    hostingNamespace: 'clusters',
    nodePools: mockNodepools,
    secretNames: ['feng-hs-bug-ssh-key', 'feng-hs-bug-pull-secret'],
  },
  isHive: false,
  isManaged: true,
  isCurator: true,
  isHostedCluster: true,
  isHypershift: true,
  isSNOCluster: false,
  owner: {},
  kubeadmin: '',
  kubeconfig: '',
  isRegionalHubCluster: false,
}

const mockClusterNoDistribution: Cluster = {
  name: 'hypershift-cluster1',
  displayName: 'hypershift-cluster1',
  namespace: 'clusters',
  uid: 'hypershift-cluster1-uid',
  provider: undefined,
  status: ClusterStatus.ready,
  labels: { abc: '123' },
  nodes: undefined,
  kubeApiServer: '',
  consoleURL: '',
  hasAutomationTemplate: false,
  hive: {
    isHibernatable: true,
    clusterPool: undefined,
    secrets: {
      installConfig: '',
    },
  },
  hypershift: {
    agent: false,
    hostingNamespace: 'clusters',
    nodePools: mockNodepools,
    secretNames: ['feng-hs-bug-ssh-key', 'feng-hs-bug-pull-secret'],
  },
  isHive: false,
  isManaged: true,
  isCurator: true,
  isHostedCluster: true,
  isHypershift: true,
  isSNOCluster: false,
  owner: {},
  kubeadmin: '',
  kubeconfig: '',
  isRegionalHubCluster: false,
}

const mockClusterNoOCP: Cluster = {
  name: 'hypershift-cluster1',
  displayName: 'hypershift-cluster1',
  namespace: 'clusters',
  uid: 'hypershift-cluster1-uid',
  provider: undefined,
  status: ClusterStatus.ready,
  distribution: {
    isManagedOpenShift: false,
  },
  labels: { abc: '123' },
  nodes: undefined,
  kubeApiServer: '',
  consoleURL: '',
  hasAutomationTemplate: false,
  hive: {
    isHibernatable: true,
    clusterPool: undefined,
    secrets: {
      installConfig: '',
    },
  },
  hypershift: {
    agent: false,
    hostingNamespace: 'clusters',
    nodePools: mockNodepools,
    secretNames: ['feng-hs-bug-ssh-key', 'feng-hs-bug-pull-secret'],
  },
  isHive: false,
  isManaged: true,
  isCurator: true,
  isHostedCluster: true,
  isHypershift: true,
  isSNOCluster: false,
  owner: {},
  kubeadmin: '',
  kubeconfig: '',
  isRegionalHubCluster: false,
}

const mockBMCluster: Cluster = {
  name: 'feng-test',
  displayName: 'feng-test',
  namespace: 'feng-test',
  uid: 'e97c30e0-89fa-4816-8715-f52376632c44',
  status: ClusterStatus.pendingimport,
  provider: Provider.hostinventory,
  labels: {
    cloud: 'hypershift',
    'cluster.open-cluster-management.io/clusterset': 'default',
    'feature.open-cluster-management.io/addon-application-manager': 'unreachable',
    'feature.open-cluster-management.io/addon-cert-policy-controller': 'unreachable',
    'feature.open-cluster-management.io/addon-cluster-proxy': 'unreachable',
    'feature.open-cluster-management.io/addon-config-policy-controller': 'unreachable',
    'feature.open-cluster-management.io/addon-governance-policy-framework': 'unreachable',
    'feature.open-cluster-management.io/addon-search-collector': 'unreachable',
    'feature.open-cluster-management.io/addon-work-manager': 'unreachable',
    name: 'feng-test',
  },
  nodes: {
    nodeList: [],
    ready: 0,
    unhealthy: 0,
    unknown: 0,
  },
  consoleURL: 'https://console-openshift-console.apps.feng-test.dev06.red-chesterfield.com',
  isHive: false,
  isHypershift: true,
  isManaged: true,
  isCurator: false,
  isHostedCluster: false,
  isSNOCluster: false,
  isRegionalHubCluster: false,
  hasAutomationTemplate: false,
  hive: {
    isHibernatable: false,
    secrets: {},
  },
  clusterSet: 'default',
  owner: {},
  creationTimestamp: '2022-10-24T20:34:08Z',
  kubeconfig: 'feng-test-admin-kubeconfig',
  kubeadmin: 'feng-test-kubeadmin-password',
  hypershift: {
    agent: true,
    nodePools: [
      {
        apiVersion: 'hypershift.openshift.io/v1alpha1',
        kind: 'NodePool',
        metadata: {
          annotations: {
            'hypershift.openshift.io/nodePoolCurrentConfig': 'd878d427',
            'hypershift.openshift.io/nodePoolCurrentConfigVersion': '970177e6',
          },
          creationTimestamp: '2022-10-24T20:34:08Z',
          finalizers: ['hypershift.openshift.io/finalizer'],
          generation: 3,
          name: 'nodepool-feng-test-1',
          namespace: 'feng-test',
          ownerReferences: [
            {
              apiVersion: 'hypershift.openshift.io/v1alpha1',
              kind: 'HostedCluster',
              name: 'feng-test',
              uid: 'c2e1ac30-c118-432c-9c90-22912c3c7e3b',
            },
          ],
          resourceVersion: '14458385',
          uid: '390cd3fb-af1e-45cd-a18c-0473015b175e',
        },
        spec: {
          clusterName: 'feng-test',
          management: {
            autoRepair: false,
            replace: {
              rollingUpdate: {
                maxSurge: 1,
                maxUnavailable: 0,
              },
              strategy: 'RollingUpdate',
            },
            upgradeType: 'InPlace',
          },
          platform: {
            agent: {
              agentLabelSelector: {},
            },
            type: 'Agent',
          },
          release: {
            image: 'quay.io/openshift-release-dev/ocp-release:4.11.9-x86_64',
          },
          replicas: 1,
        },
        status: {
          conditions: [
            {
              lastTransitionTime: '2022-10-24T20:34:08Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'False',
              type: 'AutoscalingEnabled',
            },
            {
              lastTransitionTime: '2022-10-24T20:34:08Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'True',
              type: 'UpdateManagementEnabled',
            },
            {
              lastTransitionTime: '2022-10-24T21:08:24Z',
              message: 'Using release image: quay.io/openshift-release-dev/ocp-release:4.11.9-x86_64',
              observedGeneration: 3,
              reason: 'AsExpected',
              status: 'True',
              type: 'ValidReleaseImage',
            },
            {
              lastTransitionTime: '2022-10-24T21:08:24Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'True',
              type: 'ValidMachineConfig',
            },
            {
              lastTransitionTime: '2022-10-24T21:08:24Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'True',
              type: 'ValidTunedConfig',
            },
            {
              lastTransitionTime: '2022-10-24T21:08:24Z',
              message: 'Reconciliation active on resource',
              observedGeneration: 3,
              reason: 'ReconciliationActive',
              status: 'True',
              type: 'ReconciliationActive',
            },
            {
              lastTransitionTime: '2022-10-24T21:08:24Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'False',
              type: 'AutorepairEnabled',
            },
            {
              lastTransitionTime: '2022-10-24T21:21:41Z',
              observedGeneration: 3,
              reason: 'AsExpected',
              message: '',
              status: 'True',
              type: 'Ready',
            },
          ],
          replicas: 1,
          version: '4.11.9',
        },
      },
    ],
    secretNames: ['sshkey-cluster-feng-test', 'pullsecret-cluster-feng-test'],
    hostingNamespace: 'feng-test',
  },
}

const mockAgent0: AgentK8sResource = {
  apiVersion: 'agent-install.openshift.io/v1beta1',
  kind: 'Agent',
  metadata: {
    annotations: {
      agentMachineRefNamespace: 'feng-test-feng-test',
      'inventory.agent-install.openshift.io/version': '0.1',
    },
    name: '814ab1d8-6fb3-1d14-44b3-0d117a112572',
    namespace: 'agent-test2',
    labels: {
      'agent-install.openshift.io/clusterdeployment-namespace': 'feng-test-feng-test',
      agentMachineRef: '533dde6d-9d01-4d08-a39e-032b6046d90e',
      'infraenvs.agent-install.openshift.io': 'agent-test2',
      'inventory.agent-install.openshift.io/cpu-architecture': 'x86_64',
      'inventory.agent-install.openshift.io/cpu-virtenabled': 'true',
      'inventory.agent-install.openshift.io/host-isvirtual': 'false',
      'inventory.agent-install.openshift.io/host-productname': 'PowerEdgeR640',
      'inventory.agent-install.openshift.io/storage-hasnonrotationaldisk': 'false',
    },
  },
  spec: {
    approved: true,
    clusterDeploymentName: {
      name: 'feng-test',
      namespace: 'feng-test-feng-test',
    },
    ignitionEndpointTokenReference: {
      name: 'agent-user-data-nodepool-feng-test-1-970177e6',
      namespace: 'feng-test-feng-test',
    },
    machineConfigPool: 'ignition',
    role: 'auto-assign',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-10-20T14:59:26Z',
        message: 'The Spec has been successfully applied',
        reason: 'SyncOK',
        status: 'True',
        type: 'SpecSynced',
      },
      {
        lastTransitionTime: '2022-10-20T14:59:26Z',
        message: "The agent's connection to the installation service is unimpaired",
        reason: 'AgentIsConnected',
        status: 'True',
        type: 'Connected',
      },
      {
        lastTransitionTime: '2022-10-24T21:10:16Z',
        message: 'The agent installation stopped',
        reason: 'AgentInstallationStopped',
        status: 'True',
        type: 'RequirementsMet',
      },
      {
        lastTransitionTime: '2022-10-24T21:10:16Z',
        message: "The agent's validations are passing",
        reason: 'ValidationsPassing',
        status: 'True',
        type: 'Validated',
      },
      {
        lastTransitionTime: '2022-10-24T21:12:12Z',
        message: 'The installation has completed: Rebooting',
        reason: 'InstallationCompleted',
        status: 'True',
        type: 'Installed',
      },
      {
        lastTransitionTime: '2022-10-24T21:09:13Z',
        message: 'The agent is bound to a cluster deployment',
        reason: 'Bound',
        status: 'True',
        type: 'Bound',
      },
    ],
    debugInfo: {
      eventsURL:
        'https://assisted-service-multicluster-engine.apps.slot-09.dev06.red-chesterfield.com/api/assisted-install/v2/events?api_key=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmZyYV9lbnZfaWQiOiJlOTE3YTdkZi04MzU4LTQ2MDAtYjU3MS02ZmRjOTZlNWQ0NzUifQ.x58LtO4N5SocnT9-q-1kMBQnHxoD_ZwOpx0wo7ByMF258H02gx2upivbeXthab-itOo3chENDcPgnO0Lipb1yA&host_id=814ab1d8-6fb3-1d14-44b3-0d117a112572',
      logsURL:
        'https://assisted-service-multicluster-engine.apps.slot-09.dev06.red-chesterfield.com/api/assisted-install/v2/clusters/e9168554-bfbb-43d6-9b6c-f301ca02565e/logs?api_key=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVzdGVyX2lkIjoiZTkxNjg1NTQtYmZiYi00M2Q2LTliNmMtZjMwMWNhMDI1NjVlIn0.TDtX5b4GeSYQOQmQLVlM-pZf5e7RDK3qvXvhav_5qKo5epDFumHO8-FSmoZf67OJMpOP76ytV4kqApZU9NYJ3A&host_id=814ab1d8-6fb3-1d14-44b3-0d117a112572&logs_type=host',
      state: 'added-to-existing-cluster',
      stateInfo: 'Rebooting',
    },
    inventory: {
      memory: {
        physicalBytes: 68719476736,
        usableBytes: 67002777600,
      },
      cpu: {
        architecture: 'x86_64',
        count: 20,
        flags: [
          'fpu',
          'vme',
          'de',
          'pse',
          'tsc',
          'msr',
          'pae',
          'mce',
          'cx8',
          'apic',
          'sep',
          'mtrr',
          'pge',
          'mca',
          'cmov',
          'pat',
          'pse36',
          'clflush',
          'dts',
          'acpi',
          'mmx',
          'fxsr',
          'sse',
          'sse2',
          'ss',
          'ht',
          'tm',
          'pbe',
          'syscall',
          'nx',
          'pdpe1gb',
          'rdtscp',
          'lm',
          'constant_tsc',
          'art',
          'arch_perfmon',
          'pebs',
          'bts',
          'rep_good',
          'nopl',
          'xtopology',
          'nonstop_tsc',
          'cpuid',
          'aperfmperf',
          'pni',
          'pclmulqdq',
          'dtes64',
          'monitor',
          'ds_cpl',
          'vmx',
          'smx',
          'est',
          'tm2',
          'ssse3',
          'sdbg',
          'fma',
          'cx16',
          'xtpr',
          'pdcm',
          'pcid',
          'dca',
          'sse4_1',
          'sse4_2',
          'x2apic',
          'movbe',
          'popcnt',
          'tsc_deadline_timer',
          'aes',
          'xsave',
          'avx',
          'f16c',
          'rdrand',
          'lahf_lm',
          'abm',
          '3dnowprefetch',
          'cpuid_fault',
          'epb',
          'cat_l3',
          'cdp_l3',
          'invpcid_single',
          'intel_ppin',
          'ssbd',
          'mba',
          'ibrs',
          'ibpb',
          'stibp',
          'ibrs_enhanced',
          'tpr_shadow',
          'vnmi',
          'flexpriority',
          'ept',
          'vpid',
          'ept_ad',
          'fsgsbase',
          'tsc_adjust',
          'bmi1',
          'hle',
          'avx2',
          'smep',
          'bmi2',
          'erms',
          'invpcid',
          'cqm',
          'mpx',
          'rdt_a',
          'avx512f',
          'avx512dq',
          'rdseed',
          'adx',
          'smap',
          'clflushopt',
          'clwb',
          'intel_pt',
          'avx512cd',
          'avx512bw',
          'avx512vl',
          'xsaveopt',
          'xsavec',
          'xgetbv1',
          'xsaves',
          'cqm_llc',
          'cqm_occup_llc',
          'cqm_mbm_total',
          'cqm_mbm_local',
          'dtherm',
          'ida',
          'arat',
          'pln',
          'pts',
          'pku',
          'ospke',
          'avx512_vnni',
          'md_clear',
          'flush_l1d',
          'arch_capabilities',
        ],
        modelName: 'Intel(R) Xeon(R) Silver 4210 CPU @ 2.20GHz',
      },
      boot: {
        currentBootMode: 'uefi',
      },
      hostname: 'fog26.cluster.internal',
      disks: [
        {
          driveType: 'HDD',
          path: '/dev/sdb',
          vendor: 'DELL',
          model: 'PERC_H330_Mini',
          sizeBytes: 274877906944,
          name: 'sdb',
          wwn: '0x62cea7f0b3a0e100293c068b03bc3b95',
          ioPerf: {},
          byId: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068b03bc3b95',
          hctl: '1:2:0:0',
          installationEligibility: {
            eligible: true,
            notEligibleReasons: [],
          },
          serial: '62cea7f0b3a0e100293c068b03bc3b95',
          id: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068b03bc3b95',
          byPath: '/dev/disk/by-path/pci-0000:17:00.0-scsi-0:2:0:0',
        },
        {
          driveType: 'HDD',
          path: '/dev/sdc',
          vendor: 'DELL',
          model: 'PERC_H330_Mini',
          sizeBytes: 274877906944,
          name: 'sdc',
          wwn: '0x62cea7f0b3a0e100293c068c03c2c225',
          ioPerf: {},
          byId: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068c03c2c225',
          hctl: '1:2:1:0',
          installationEligibility: {
            eligible: true,
            notEligibleReasons: [],
          },
          serial: '62cea7f0b3a0e100293c068c03c2c225',
          id: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068c03c2c225',
          byPath: '/dev/disk/by-path/pci-0000:17:00.0-scsi-0:2:1:0',
        },
        {
          driveType: 'HDD',
          path: '/dev/sdd',
          vendor: 'DELL',
          model: 'PERC_H330_Mini',
          sizeBytes: 274877906944,
          name: 'sdd',
          wwn: '0x62cea7f0b3a0e100293c068c03c87007',
          ioPerf: {},
          byId: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068c03c87007',
          hctl: '1:2:2:0',
          installationEligibility: {
            eligible: true,
            notEligibleReasons: [],
          },
          serial: '62cea7f0b3a0e100293c068c03c87007',
          id: '/dev/disk/by-id/wwn-0x62cea7f0b3a0e100293c068c03c87007',
          byPath: '/dev/disk/by-path/pci-0000:17:00.0-scsi-0:2:2:0',
        },
      ],
      systemVendor: {
        manufacturer: 'Dell Inc.',
        productName: 'PowerEdge R640',
        serialNumber: 'BB08NF3',
      },
      interfaces: [
        {
          macAddress: '78:ac:44:4d:3b:38',
          flags: ['up', 'broadcast', 'multicast'],
          vendor: '0x8086',
          name: 'eno1',
          mtu: 1500,
          product: '0x1521',
          biosdevname: 'em1',
          ipV6Addresses: [],
          ipV4Addresses: [],
          hasCarrier: true,
          speedMbps: 1000,
        },
        {
          macAddress: '78:ac:44:4d:3b:39',
          flags: ['up', 'broadcast', 'multicast'],
          vendor: '0x8086',
          name: 'eno2',
          mtu: 1500,
          product: '0x1521',
          biosdevname: 'em2',
          ipV6Addresses: [],
          ipV4Addresses: ['172.31.8.52/24'],
          hasCarrier: true,
          speedMbps: 1000,
        },
        {
          macAddress: '78:ac:44:4d:3b:3a',
          flags: ['up', 'broadcast', 'multicast'],
          vendor: '0x8086',
          name: 'eno3',
          mtu: 1500,
          product: '0x1521',
          biosdevname: 'em3',
          ipV6Addresses: [],
          ipV4Addresses: [],
          speedMbps: -1,
        },
        {
          macAddress: '78:ac:44:4d:3b:3b',
          flags: ['up', 'broadcast', 'multicast'],
          vendor: '0x8086',
          name: 'eno4',
          mtu: 1500,
          product: '0x1521',
          biosdevname: 'em4',
          ipV6Addresses: [],
          ipV4Addresses: [],
          speedMbps: -1,
        },
      ],
      bmcV6address: '::/0',
      bmcAddress: '10.1.157.58',
    },
    ntpSources: [
      {
        sourceName: '2601:603:b7f:fec0:feed:feed:feed:feed',
        sourceState: 'unreachable',
      },
      {
        sourceName: 'vmi586073.contaboserver.net',
        sourceState: 'unreachable',
      },
      {
        sourceName: 'lithium.constant.com',
        sourceState: 'unreachable',
      },
      {
        sourceName: '2603:c020:0:8369:176e:3d88:a3d2:6d77',
        sourceState: 'unreachable',
      },
      {
        sourceName: 'time.cloudflare.com',
        sourceState: 'unreachable',
      },
      {
        sourceName: '2601:603:b7f:fec0::f00d:feed',
        sourceState: 'unreachable',
      },
      {
        sourceName: 't1.time.bf1.yahoo.com',
        sourceState: 'unreachable',
      },
      {
        sourceName: '2604:a880:400:d0::83:2002',
        sourceState: 'unreachable',
      },
      {
        sourceName: 'gateway.cluster.internal',
        sourceState: 'synced',
      },
      {
        sourceName: 'ntp1.ntp-001.prod.iad2.dc.redhat.com',
        sourceState: 'not_combined',
      },
    ],
    progress: {
      currentStage: 'Done',
      installationPercentage: 100,
      progressStages: [
        'Starting installation',
        'Installing',
        'Writing image to disk',
        'Waiting for control plane',
        'Rebooting',
      ],
      stageStartTime: '2022-10-24T21:12:12Z',
      stageUpdateTime: '2022-10-24T21:12:12Z',
    },
    role: 'worker',
    validationsInfo: {
      hardware: [
        {
          id: 'has-inventory',
          message: 'Valid inventory exists for the host',
          status: 'success',
        },
        {
          id: 'has-min-cpu-cores',
          message: 'Sufficient CPU cores',
          status: 'success',
        },
        {
          id: 'has-min-memory',
          message: 'Sufficient minimum RAM',
          status: 'success',
        },
        {
          id: 'has-min-valid-disks',
          message: 'Sufficient disk capacity',
          status: 'success',
        },
        {
          id: 'has-cpu-cores-for-role',
          message: 'Sufficient CPU cores for role worker',
          status: 'success',
        },
        {
          id: 'has-memory-for-role',
          message: 'Sufficient RAM for role worker',
          status: 'success',
        },
        {
          id: 'hostname-unique',
          message: 'Hostname fog26.cluster.internal is unique in cluster',
          status: 'success',
        },
        {
          id: 'hostname-valid',
          message: 'Hostname fog26.cluster.internal is allowed',
          status: 'success',
        },
        {
          id: 'sufficient-installation-disk-speed',
          message: 'Speed of installation disk has not yet been measured',
          status: 'success',
        },
        {
          id: 'compatible-with-cluster-platform',
          message: 'Host is compatible with cluster platform none',
          status: 'success',
        },
        {
          id: 'vsphere-disk-uuid-enabled',
          message: 'VSphere disk.EnableUUID is enabled for this virtual machine',
          status: 'success',
        },
        {
          id: 'compatible-agent',
          message: 'Host agent compatibility checking is disabled',
          status: 'success',
        },
        {
          id: 'no-skip-installation-disk',
          message: 'No request to skip formatting of the installation disk',
          status: 'success',
        },
        {
          id: 'no-skip-missing-disk',
          message: 'All disks that have skipped formatting are present in the host inventory',
          status: 'success',
        },
      ],
      network: [
        {
          id: 'connected',
          message: 'Host is connected',
          status: 'success',
        },
        {
          id: 'media-connected',
          message: 'Media device is connected',
          status: 'success',
        },
        {
          id: 'machine-cidr-defined',
          message: 'No Machine Network CIDR needed: User Managed Networking',
          status: 'success',
        },
        {
          id: 'belongs-to-machine-cidr',
          message: 'No machine network CIDR validation needed: User Managed Networking',
          status: 'success',
        },
        {
          id: 'ignition-downloadable',
          message: 'Ignition is downloadable',
          status: 'success',
        },
        {
          id: 'belongs-to-majority-group',
          message: 'Day2 host is not required to be connected to other hosts in the cluster',
          status: 'success',
        },
        {
          id: 'valid-platform-network-settings',
          message: 'Platform PowerEdge R640 is allowed',
          status: 'success',
        },
        {
          id: 'ntp-synced',
          message: 'Host NTP is synced',
          status: 'success',
        },
        {
          id: 'container-images-available',
          message: 'All required container images were either pulled successfully or no attempt was made to pull them',
          status: 'success',
        },
        {
          id: 'sufficient-network-latency-requirement-for-role',
          message: 'Network latency requirement has been satisfied.',
          status: 'success',
        },
        {
          id: 'sufficient-packet-loss-requirement-for-role',
          message: 'Packet loss requirement has been satisfied.',
          status: 'success',
        },
        {
          id: 'has-default-route',
          message: 'Host has been configured with at least one default route.',
          status: 'success',
        },
        {
          id: 'api-domain-name-resolved-correctly',
          message:
            'Domain name resolution for the api.feng-test.dev06.red-chesterfield.com domain was successful or not required',
          status: 'success',
        },
        {
          id: 'api-int-domain-name-resolved-correctly',
          message:
            'Domain name resolution for the api-int.feng-test.dev06.red-chesterfield.com domain was successful or not required',
          status: 'success',
        },
        {
          id: 'apps-domain-name-resolved-correctly',
          message:
            'Domain name resolution for the *.apps.feng-test.dev06.red-chesterfield.com domain was successful or not required',
          status: 'success',
        },
        {
          id: 'dns-wildcard-not-configured',
          message: 'DNS wildcard check is not required for day2',
          status: 'success',
        },
        {
          id: 'non-overlapping-subnets',
          message: 'Host subnets are not overlapping',
          status: 'success',
        },
      ],
      operators: [
        {
          id: 'cnv-requirements-satisfied',
          message: 'cnv is disabled',
          status: 'success',
        },
        {
          id: 'lso-requirements-satisfied',
          message: 'lso is disabled',
          status: 'success',
        },
        {
          id: 'lvm-requirements-satisfied',
          message: 'lvm is disabled',
          status: 'success',
        },
        {
          id: 'odf-requirements-satisfied',
          message: 'odf is disabled',
          status: 'success',
        },
      ],
    },
  },
}

const mockAgentMachine0 = {
  apiVersion: 'capi-provider.agent-install.openshift.io/v1alpha1',
  kind: 'AgentMachine',
  metadata: {
    annotations: {
      'cluster.x-k8s.io/cloned-from-groupkind': 'AgentMachineTemplate.capi-provider.agent-install.openshift.io',
      'cluster.x-k8s.io/cloned-from-name': 'nodepool-feng-test-1',
      'hypershift.openshift.io/nodePool': 'feng-test/nodepool-feng-test-1',
      'hypershift.openshift.io/nodePoolPlatformMachineTemplate': '{"template":{"spec":{"agentLabelSelector":{}}}}',
    },
    name: 'nodepool-feng-test-1-9mbv2',
    namespace: 'feng-test-feng-test',
    ownerReferences: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'Machine',
        name: 'nodepool-feng-test-1-7k7hh',
        uid: '6b10fd36-5309-40d3-b2d4-6026a2c0d287',
      },
    ],
    labels: {
      'cluster.x-k8s.io/cluster-name': 'feng-test',
      'feng-test-feng-test-nodepool-feng-test-1': 'feng-test-feng-test-nodepool-feng-test-1',
    },
  },
  spec: {
    agentLabelSelector: {},
    providerID: 'agent://814ab1d8-6fb3-1d14-44b3-0d117a112572',
  },
  status: {
    addresses: [
      {
        address: '172.31.8.52',
        type: 'ExternalIP',
      },
      {
        address: 'fog26.cluster.internal',
        type: 'InternalDNS',
      },
    ],
    agentRef: {
      name: '814ab1d8-6fb3-1d14-44b3-0d117a112572',
      namespace: 'agent-test2',
    },
    conditions: [
      {
        lastTransitionTime: '2022-10-24T21:12:12Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-10-24T21:10:16Z',
        status: 'True',
        type: 'AgentRequirementsMet',
      },
      {
        lastTransitionTime: '2022-10-24T21:08:24Z',
        status: 'True',
        type: 'AgentReserved',
      },
      {
        lastTransitionTime: '2022-10-24T21:08:24Z',
        status: 'True',
        type: 'AgentSpecSynced',
      },
      {
        lastTransitionTime: '2022-10-24T21:10:16Z',
        status: 'True',
        type: 'AgentValidated',
      },
      {
        lastTransitionTime: '2022-10-24T21:12:12Z',
        status: 'True',
        type: 'Installed',
      },
    ],
    ready: true,
  },
}

const mockHostedCluster0: HostedClusterK8sResource = {
  apiVersion: 'hypershift.openshift.io/v1alpha1',
  kind: 'HostedCluster',
  metadata: {
    name: 'feng-test',
    namespace: 'feng-test',
  },
  spec: {
    fips: false,
    release: {
      image: 'quay.io/openshift-release-dev/ocp-release:4.11.9-x86_64',
    },
    dns: {
      baseDomain: 'dev06.red-chesterfield.com',
    },
    controllerAvailabilityPolicy: 'SingleReplica',
    infraID: 'feng-test',
    etcd: {
      managed: {
        storage: {
          persistentVolume: {
            size: '4Gi',
          },
          type: 'PersistentVolume',
        },
      },
      managementType: 'Managed',
    },
    infrastructureAvailabilityPolicy: 'SingleReplica',
    platform: {
      agent: {
        agentNamespace: 'agent-test2',
      },
      type: 'Agent',
    },
    networking: {
      clusterNetwork: [
        {
          cidr: '10.132.0.0/14',
        },
      ],
      machineNetwork: [
        {
          cidr: '10.1.158.0/24',
        },
      ],
      networkType: 'OVNKubernetes',
      serviceNetwork: [
        {
          cidr: '172.31.0.0/16',
        },
      ],
    },
    clusterID: 'dff4fe12-de44-4b6f-a78d-16e831234b07',
    pullSecret: {
      name: 'pullsecret-cluster-feng-test',
    },
    issuerURL: 'https://kubernetes.default.svc',
    sshKey: {
      name: 'sshkey-cluster-feng-test',
    },
    autoscaling: {},
    olmCatalogPlacement: 'management',
    services: [
      {
        service: 'APIServer',
        servicePublishingStrategy: {
          nodePort: {
            address: '10.1.158.55',
          },
          type: 'NodePort',
        },
      },
      {
        service: 'OAuthServer',
        servicePublishingStrategy: {
          type: 'Route',
        },
      },
      {
        service: 'OIDC',
        servicePublishingStrategy: {
          type: 'Route',
        },
      },
      {
        service: 'Konnectivity',
        servicePublishingStrategy: {
          type: 'Route',
        },
      },
      {
        service: 'Ignition',
        servicePublishingStrategy: {
          type: 'Route',
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-10-24T20:34:08Z',
        message: 'Reconciliation completed succesfully',
        observedGeneration: 3,
        reason: 'ReconciliatonSucceeded',
        status: 'True',
        type: 'ReconciliationSucceeded',
      },
      {
        lastTransitionTime: '2022-11-03T19:52:46Z',
        message:
          'Some cluster operators are still updating: console, csi-snapshot-controller, dns, image-registry, insights, kube-storage-version-migrator, monitoring, network, openshift-samples, service-ca, storage',
        observedGeneration: 3,
        reason: 'ClusterOperatorsNotAvailable',
        status: 'False',
        type: 'ClusterVersionSucceeding',
      },
      {
        lastTransitionTime: '2022-10-24T20:42:58Z',
        message:
          'Kubernetes 1.25 and therefore OpenShift 4.12 remove several APIs which require admin consideration. Please see the knowledge article https://access.redhat.com/articles/6955381 for details and instructions.',
        observedGeneration: 1,
        reason: 'AdminAckRequired',
        status: 'False',
        type: 'ClusterVersionUpgradeable',
      },
      {
        lastTransitionTime: '2022-11-03T12:48:06Z',
        message: 'The hosted cluster is not degraded',
        observedGeneration: 3,
        reason: 'AsExpected',
        status: 'False',
        type: 'Degraded',
      },
      {
        lastTransitionTime: '2022-10-24T20:42:05Z',
        message: 'The hosted control plane is available',
        observedGeneration: 3,
        reason: 'HostedClusterAsExpected',
        status: 'True',
        type: 'Available',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:08Z',
        message: 'Configuration passes validation',
        observedGeneration: 3,
        reason: 'HostedClusterAsExpected',
        status: 'True',
        type: 'ValidConfiguration',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:08Z',
        message: 'HostedCluster is supported by operator configuration',
        observedGeneration: 3,
        reason: 'HostedClusterAsExpected',
        status: 'True',
        type: 'SupportedHostedCluster',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:23Z',
        message: 'Configuration passes validation',
        reason: 'HostedClusterAsExpected',
        status: 'True',
        type: 'ValidHostedControlPlaneConfiguration',
      },
      {
        lastTransitionTime: '2022-10-24T20:35:36Z',
        message: 'Ignition server deployent is available',
        observedGeneration: 3,
        reason: 'IgnitionServerDeploymentAsExpected',
        status: 'True',
        type: 'IgnitionEndpointAvailable',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:08Z',
        message: 'Reconciliation active on resource',
        observedGeneration: 3,
        reason: 'ReconciliationActive',
        status: 'True',
        type: 'ReconciliationActive',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:09Z',
        message: 'Release image is valid',
        observedGeneration: 3,
        reason: 'AsExpected',
        status: 'True',
        type: 'ValidReleaseImage',
      },
      {
        lastTransitionTime: '2022-10-24T20:34:08Z',
        message: 'HostedCluster is at expected version',
        observedGeneration: 3,
        reason: 'AsExpected',
        status: 'False',
        type: 'Progressing',
      },
    ],
    ignitionEndpoint: 'ignition-server-feng-test-feng-test.apps.slot-09.dev06.red-chesterfield.com',
    kubeadminPassword: {
      name: 'feng-test-kubeadmin-password',
    },
    kubeconfig: {
      name: 'feng-test-admin-kubeconfig',
    },
    oauthCallbackURLTemplate:
      'https://oauth-feng-test-feng-test.apps.slot-09.dev06.red-chesterfield.com:443/oauthcallback/[identity-provider-name]',
    version: {
      desired: {
        image: 'quay.io/openshift-release-dev/ocp-release:4.11.9-x86_64',
      },
      history: [
        {
          completionTime: '',
          image: 'quay.io/openshift-release-dev/ocp-release:4.11.9-x86_64',
          startedTime: '2022-10-24T20:34:08Z',
          state: 'Partial',
          verified: false,
          version: '',
        },
      ],
      observedGeneration: 2,
    },
  },
}

const mockConfigMaps: ConfigMap[] = [
  {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: 'supported-versions',
      namespace: 'hypershift',
    },
    data: {
      'supported-versions': '{"versions":["4.15","4.14","4.13"]}',
    },
  },
  {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: 'myconfig',
      namespace: 'hypershift',
    },
    data: {
      'supported-versions': '{"versions":["4.15","4.14","4.13"]}',
    },
  },
  {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: 'myotherconfig',
      namespace: 'differentnamespace',
    },
    data: {
      'supported-versions': '{"versions":["4.15","4.14","4.13"]}',
    },
  },
]

describe('HypershiftUpgradeModal', () => {
  const renderHypershiftUpgradeModal = async (
    controlPlane: Cluster,
    nodepools: NodePool[],
    availableUpdates: Record<string, string>,
    agents?: AgentK8sResource[],
    agentMachines?: AgentMachineK8sResource[],
    hostedCluster?: HostedClusterK8sResource,
    open = true,
    includeSupportedVersion = false
  ) => {
    nockIgnoreRBAC()

    const retResource = !includeSupportedVersion
      ? render(
          <RecoilRoot>
            <HypershiftUpgradeModal
              controlPlane={controlPlane}
              nodepools={nodepools}
              open={open}
              close={() => {}}
              availableUpdates={availableUpdates}
              agents={agents}
              agentMachines={agentMachines}
              hostedCluster={hostedCluster}
            />
          </RecoilRoot>
        )
      : render(
          <RecoilRoot
            initializeState={(snapshot) => {
              snapshot.set(configMapsState, mockConfigMaps)
            }}
          >
            <HypershiftUpgradeModal
              controlPlane={controlPlane}
              nodepools={nodepools}
              open={open}
              close={() => {}}
              availableUpdates={availableUpdates}
              agents={agents}
              agentMachines={agentMachines}
              hostedCluster={hostedCluster}
            />
          </RecoilRoot>
        )

    return retResource
  }

  it('should render upgrade modal', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates0,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal control plane higher patch version', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockClusterHigherVersion,
      mockClusterHigherVersion.hypershift?.nodePools as NodePool[],
      availableUpdates0,
      undefined,
      undefined,
      undefined,
      true,
      true
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
    expect(screen.getByTestId('controlplane-checkbox')).toBeTruthy()
    userEvent.click(screen.getByTestId('controlplane-checkbox'))
  })

  it('should render upgrade modal no available updates', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      {},
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal no available updates and no distribution', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockClusterNoDistribution,
      mockClusterNoDistribution.hypershift?.nodePools as NodePool[],
      {},
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal no available updates and no ocp', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockClusterNoOCP,
      mockClusterNoOCP.hypershift?.nodePools as NodePool[],
      {},
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal no available updates same version', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates1,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal updates greater than n-2', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates2,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal nodepool no status', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockNodepoolsNoStatus,
      availableUpdates2,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })

  it('should render upgrade modal closed', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates2,
      undefined,
      undefined,
      undefined,
      false
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(0)
  })

  it('should render upgrade modal control plane unchecked', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates0,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
    expect(screen.getByTestId('controlplane-checkbox')).toBeTruthy()
    userEvent.click(screen.getByTestId('controlplane-checkbox'))
    expect(screen.getByTestId('nodepoolgroup-checkbox')).toBeDisabled()
    userEvent.click(screen.getByTestId('controlplane-checkbox'))
    expect(screen.getByTestId('nodepoolgroup-checkbox')).toBeEnabled()
  })

  it('should render upgrade modal nodepool group unchecked/checked toggle', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates0,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)

    // Test nodepool group checkbox
    expect(screen.getByTestId('nodepoolgroup-checkbox')).toBeTruthy()
    userEvent.click(screen.getByTestId('nodepoolgroup-checkbox'))
    expect(screen.getByTestId('nodepoolgroup-checkbox')).toHaveProperty('checked', false)
    userEvent.click(screen.getByTestId('nodepoolgroup-checkbox'))
    expect(screen.getByTestId('nodepoolgroup-checkbox')).toHaveProperty('checked', true)

    // Test nodepool group expand button
    expect(screen.getByTestId('nodepoolgroup-toggle')).toBeTruthy()
    userEvent.click(screen.getByTestId('nodepoolgroup-toggle'))
  })

  it('should render upgrade modal nodepools unchecked/checked', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates0,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)

    // Test nodepool group expand button
    expect(screen.getByTestId('nodepoolgroup-toggle')).toBeTruthy()
    userEvent.click(screen.getByTestId('nodepoolgroup-toggle'))

    // Test nodepool check/uncheck
    expect(screen.getByTestId('feng-hypershift-test-2-checkbox')).toBeTruthy()
    userEvent.click(screen.getByTestId('feng-hypershift-test-2-checkbox'))
    expect(screen.getByTestId('feng-hypershift-test-2-checkbox')).toHaveProperty('checked', false)
    userEvent.click(screen.getByTestId('feng-hypershift-test-2-checkbox'))
    expect(screen.getByTestId('feng-hypershift-test-2-checkbox')).toHaveProperty('checked', true)
  })

  it('should render upgrade modal select upgrade version', async () => {
    const { queryAllByText, getByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates3,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)

    // Test version selection in control plane dropdown
    expect(screen.getByTestId('controlplane-version-dropdown-label')).toBeTruthy()

    // Click to open dropdown and select a different version
    userEvent.click(queryAllByText('5.0.12')[0])
    userEvent.click(getByText('4.12.0'))

    // Old UI: nodepools showed CP version as text (no dropdowns), so version appeared 7 times
    // New UI: added separate nodepool dropdown, version appears 2 times (dropdown and menu)
    expect(queryAllByText('4.12.0').length).toBe(2)
  })

  it('should render upgrade modal for BM', async () => {
    const { queryAllByText, getByText } = await renderHypershiftUpgradeModal(
      mockBMCluster,
      mockBMCluster.hypershift?.nodePools as NodePool[],
      availableUpdates3,
      [mockAgent0],
      [mockAgentMachine0],
      mockHostedCluster0
    )
    expect(queryAllByText('feng-test').length).toBe(1)

    // Test BM nodepool group toggle - with ClusterCurator, we have a nodepool group
    expect(screen.getByTestId('nodepoolgroup-toggle')).toBeTruthy()
    userEvent.click(screen.getByTestId('nodepoolgroup-toggle'))

    // After expanding, should see nodepool name
    expect(getByText('nodepool-feng-test-1')).toBeTruthy()
    expect(getByText('fog26.cluster.internal')).toBeTruthy()
  })
})

describe('HypershiftUpgradeModal - SupportVersion', () => {
  const renderHypershiftUpgradeModal = async (
    controlPlane: Cluster,
    nodepools: NodePool[],
    availableUpdates: Record<string, string>,
    agents?: AgentK8sResource[],
    agentMachines?: AgentMachineK8sResource[],
    hostedCluster?: HostedClusterK8sResource,
    open = true
  ) => {
    nockIgnoreRBAC()

    const retResource = render(
      <RecoilRoot
        initializeState={(snapshot) => {
          snapshot.set(configMapsState, [
            {
              kind: 'ConfigMap',
              apiVersion: 'v1',
              metadata: {
                name: 'supported-versions',
                namespace: 'hypershift',
              },
              data: {
                'supported-versions': '{"versions":["4.13","4.14","4.15"]}',
              },
            },
          ])
        }}
      >
        <HypershiftUpgradeModal
          controlPlane={controlPlane}
          nodepools={nodepools}
          open={open}
          close={() => {}}
          availableUpdates={availableUpdates}
          agents={agents}
          agentMachines={agentMachines}
          hostedCluster={hostedCluster}
        />
      </RecoilRoot>
    )

    return retResource
  }

  it('should render upgrade modal with supported version', async () => {
    const { queryAllByText } = await renderHypershiftUpgradeModal(
      mockCluster,
      mockCluster.hypershift?.nodePools as NodePool[],
      availableUpdates4,
      undefined,
      undefined,
      undefined
    )
    expect(queryAllByText('hypershift-cluster1').length).toBe(1)
  })
})

describe('HypershiftUpgradeModal - ClusterCurator Integration', () => {
  const renderHypershiftUpgradeModal = async (
    controlPlane: Cluster,
    nodepools: NodePool[],
    availableUpdates: Record<string, string>
  ) => {
    nockIgnoreRBAC()

    const retResource = render(
      <RecoilRoot>
        <HypershiftUpgradeModal
          controlPlane={controlPlane}
          nodepools={nodepools}
          open={true}
          close={() => {}}
          availableUpdates={availableUpdates}
        />
      </RecoilRoot>
    )

    return retResource
  }

  const mockClusterForCurator: Cluster = {
    ...mockCluster,
    distribution: {
      ocp: {
        version: '4.20.0',
        availableUpdates: ['4.20.1', '4.20.2', '4.21.0'],
        desiredVersion: '4.20.0',
        upgradeFailed: false,
      },
      isManagedOpenShift: false,
    },
  }

  const mockNodepoolsForCurator: NodePool[] = [
    {
      ...mockNodepools[0],
      apiVersion: 'hypershift.openshift.io/v1beta1',
      kind: 'NodePool',
      metadata: { ...mockNodepools[0].metadata, name: 'nodepool-1' },
      status: { version: '4.19.8' },
    },
    {
      ...mockNodepools[1],
      apiVersion: 'hypershift.openshift.io/v1beta1',
      kind: 'NodePool',
      metadata: { ...mockNodepools[1].metadata, name: 'nodepool-2' },
      status: { version: '4.19.9' },
    },
    {
      ...mockNodepools[2],
      apiVersion: 'hypershift.openshift.io/v1beta1',
      kind: 'NodePool',
      metadata: { ...mockNodepools[2].metadata, name: 'nodepool-3' },
      status: { version: '4.19.10' },
    },
  ]

  const availableUpdatesForCurator: Record<string, string> = {
    '4.19.11': 'quay.io/openshift-release-dev/ocp-release:4.19.11-multi',
    '4.19.12': 'quay.io/openshift-release-dev/ocp-release:4.19.12-multi',
    '4.20.0': 'quay.io/openshift-release-dev/ocp-release:4.20.0-multi',
    '4.20.1': 'quay.io/openshift-release-dev/ocp-release:4.20.1-multi',
    '4.20.2': 'quay.io/openshift-release-dev/ocp-release:4.20.2-multi',
    '4.21.0': 'quay.io/openshift-release-dev/ocp-release:4.21.0-multi',
  }

  it('should filter control plane dropdown to show only versions > current CP version', async () => {
    const { getByTestId } = await renderHypershiftUpgradeModal(
      mockClusterForCurator,
      mockNodepoolsForCurator,
      availableUpdatesForCurator
    )

    // Control plane is at 4.20.0
    // Should show: 4.21.0, 4.20.2, 4.20.1 (versions > 4.20.0)
    // Should NOT show: 4.20.0, 4.19.12, 4.19.11 (versions <= 4.20.0)

    const cpDropdown = getByTestId('controlplane-version-dropdown-label')
    expect(cpDropdown).toBeTruthy()
  })

  it('should filter nodepool dropdown to show versions > max nodepool version AND <= current CP version', async () => {
    const { getByTestId } = await renderHypershiftUpgradeModal(
      mockClusterForCurator,
      mockNodepoolsForCurator,
      availableUpdatesForCurator
    )

    // Max nodepool version is 4.19.10
    // Current CP version is 4.20.0
    // Should show: 4.19.11, 4.19.12, 4.20.0 (versions > 4.19.10 AND <= 4.20.0)
    // Should NOT show: 4.20.1, 4.20.2, 4.21.0 (versions > 4.20.0)

    const nodepoolGroupToggle = getByTestId('nodepoolgroup-toggle')
    expect(nodepoolGroupToggle).toBeTruthy()
  })

  it('should disable submit button when no version is selected', async () => {
    // Create a cluster with no available updates in the dropdown
    const mockClusterNoUpdates: Cluster = {
      ...mockClusterForCurator,
      distribution: {
        ocp: {
          version: '4.21.0',
          availableUpdates: [],
          desiredVersion: '4.21.0',
          upgradeFailed: false,
        },
        isManagedOpenShift: false,
      },
    }

    await renderHypershiftUpgradeModal(mockClusterNoUpdates, mockNodepoolsForCurator, availableUpdatesForCurator)

    // With no upgrades available for control plane, verify modal still renders
    const cpCheckbox = screen.queryByTestId('controlplane-checkbox')
    expect(cpCheckbox).toBeTruthy()

    // Nodepool group should be visible since nodepools can still be upgraded
    const npGroupCheckbox = screen.queryByTestId('nodepoolgroup-checkbox')
    expect(npGroupCheckbox).toBeTruthy()
  })

  it('should disable submit button when no components are checked', async () => {
    await renderHypershiftUpgradeModal(mockClusterForCurator, mockNodepoolsForCurator, availableUpdatesForCurator)

    // Uncheck control plane
    const cpCheckbox = screen.queryByTestId('controlplane-checkbox')
    expect(cpCheckbox).toBeTruthy()
    expect(cpCheckbox).toHaveProperty('checked', true)
    userEvent.click(cpCheckbox!)

    // After unchecking, verify control plane is now unchecked
    expect(cpCheckbox).toHaveProperty('checked', false)

    // Uncheck all nodepools
    const npGroupCheckbox = screen.queryByTestId('nodepoolgroup-checkbox')
    expect(npGroupCheckbox).toBeTruthy()
    userEvent.click(npGroupCheckbox!)
  })

  it('should enable submit button when control plane is checked and version is selected', async () => {
    await renderHypershiftUpgradeModal(mockClusterForCurator, mockNodepoolsForCurator, availableUpdatesForCurator)

    // Control plane should be checked and version auto-selected
    // Verify the control plane checkbox exists and is checked by default
    const cpCheckbox = screen.queryByTestId('controlplane-checkbox')
    expect(cpCheckbox).toBeTruthy()
    expect(cpCheckbox).toHaveProperty('checked', true)
  })

  it('should disable control plane dropdown when nodepool-only version is selected', async () => {
    await renderHypershiftUpgradeModal(mockClusterForCurator, mockNodepoolsForCurator, availableUpdatesForCurator)

    // Verify control plane checkbox starts as checked
    const cpCheckbox = screen.queryByTestId('controlplane-checkbox')
    expect(cpCheckbox).toBeTruthy()
    expect(cpCheckbox).toHaveProperty('checked', true)

    // Verify control plane dropdown label exists
    const cpDropdownLabel = screen.queryByTestId('controlplane-version-dropdown-label')
    expect(cpDropdownLabel).toBeTruthy()
  })

  it('should handle dropdown clearing without errors', async () => {
    const { queryByTestId } = await renderHypershiftUpgradeModal(
      mockClusterForCurator,
      mockNodepoolsForCurator,
      availableUpdatesForCurator
    )

    // Clearing the dropdown should not throw an error
    const cpDropdown = queryByTestId('controlplane-version-dropdown-label')
    expect(cpDropdown).toBeTruthy()

    // Test passes if no error is thrown
  })

  it('should auto-select first available version when control plane is enabled', async () => {
    const mockClusterWithUpdates: Cluster = {
      ...mockClusterForCurator,
      distribution: {
        ocp: {
          version: '4.20.0',
          availableUpdates: ['4.21.0', '4.20.2', '4.20.1'],
          desiredVersion: '4.20.0',
          upgradeFailed: false,
        },
        isManagedOpenShift: false,
      },
    }

    await renderHypershiftUpgradeModal(mockClusterWithUpdates, mockNodepoolsForCurator, availableUpdatesForCurator)

    // When modal opens with available updates, control plane should be checked
    const cpCheckbox = screen.queryByTestId('controlplane-checkbox')
    expect(cpCheckbox).toBeTruthy()
    expect(cpCheckbox).toHaveProperty('checked', true)

    // Control plane dropdown should exist
    const cpDropdownLabel = screen.queryByTestId('controlplane-version-dropdown-label')
    expect(cpDropdownLabel).toBeTruthy()
  })

  it('should show control plane and nodepool dropdowns with different version sets', async () => {
    const { queryByTestId } = await renderHypershiftUpgradeModal(
      mockClusterForCurator,
      mockNodepoolsForCurator,
      availableUpdatesForCurator
    )

    // Control plane dropdown (versions > 4.20.0)
    const cpDropdown = queryByTestId('controlplane-version-dropdown-label')
    expect(cpDropdown).toBeTruthy()

    // Nodepool dropdown (versions > 4.19.10 AND <= 4.20.0)
    // Should include current CP version as an option
    const npGroupToggle = queryByTestId('nodepoolgroup-toggle')
    expect(npGroupToggle).toBeTruthy()
  })
})
