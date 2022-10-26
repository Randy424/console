/* Copyright Contributors to the Open Cluster Management project */
import { Metadata } from './metadata'
import { IResource, IResourceDefinition } from './resource'
import { createResource } from './utils/resource-request'

export const SelfSubjectAccessReviewApiVersion = 'authorization.k8s.io/v1'
export type SelfSubjectAccessReviewApiVersionType = 'authorization.k8s.io/v1'

export const SelfSubjectAccessReviewKind = 'SelfSubjectAccessReview'
export type SelfSubjectAccessReviewType = 'SelfSubjectAccessReview'

export const SelfSubjectAccessReviewDefinition: IResourceDefinition = {
    apiVersion: SelfSubjectAccessReviewApiVersion,
    kind: SelfSubjectAccessReviewKind,
}

export interface SelfSubjectAccessReview extends IResource {
    apiVersion: SelfSubjectAccessReviewApiVersionType
    kind: SelfSubjectAccessReviewType
    metadata: Metadata
    spec: {
        resourceAttributes: ResourceAttributes
        user?: string
    }
    status?: {
        allowed: boolean
        denied?: boolean
        evaluationError?: string
        reason?: string
    }
}

export type ResourceAttributes = {
    name?: string
    namespace?: string
    resource: string
    verb: string
    group?: string
    version?: string
    subresource?: string
}

export function createSubjectAccessReview(resourceAttributes: Promise<ResourceAttributes>) {
    return resourceAttributes.then((resourceAttributes) =>
        createResource<SelfSubjectAccessReview>({
            apiVersion: SelfSubjectAccessReviewApiVersion,
            kind: SelfSubjectAccessReviewKind,
            metadata: {},
            spec: {
                resourceAttributes,
            },
        })
    )
}

export function createSubjectAccessReviews(resourceAttributes: Array<ResourceAttributes>) {
    const results = resourceAttributes.map((resource) => createSubjectAccessReview(resource))
    return {
        promise: Promise.allSettled(results.map(async (result) => (await result).promise)),
        abort: () => results.forEach(async (result) => (await result).abort()),
    }
}
