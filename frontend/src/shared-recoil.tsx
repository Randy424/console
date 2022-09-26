/* Copyright Contributors to the Open Cluster Management project */
import { PluginContext } from './lib/PluginContext'
import { useContext } from 'react'
import { RecoilValue } from 'recoil'

// const {useRecoilValue} = PluginContext.

function useSharedRecoil() {
    const { dataContext } = useContext(PluginContext)
    const { recoil } = useContext(dataContext)

    return recoil
}

export function useRecoilValue<T>(param: RecoilValue<T>): T {
    const { useRecoilValue } = useSharedRecoil()
    return useRecoilValue(param)
}

// export function(){}
