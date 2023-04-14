/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2021 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import * as rbac from '../../apis/rbac'

export const rbacActions = {

    /**
    * Create the clusterrolebinding with clusterrole for user
    * @param {string} clusterRoleBinding the name fo clusterrolebinding to be created
    * @param {string} clusterRole the clusterrole to be associate for this clusterrolebinding
    * @param {string} user the user to be associate for this clusterrolebinding
    */
    shouldHaveClusterRolebindingForUser: (clusterRoleBinding, clusterRole, user) => {
        rbac.getClusterRolebinding(clusterRoleBinding).then((resp) => {
            if (!resp.isOkStatusCode) {
                let request_body = `
                {
                    "kind": "ClusterRoleBinding",
                    "apiVersion": "rbac.authorization.k8s.io/v1",
                    "metadata": {
                        "name": "${clusterRoleBinding}"
                    },
                    "subjects": [{
                        "kind": "User",
                        "apiGroup": "rbac.authorization.k8s.io",
                        "name": "${user}"
                    }],
                    "roleRef": {
                        "apiGroup": "rbac.authorization.k8s.io",
                        "kind": "ClusterRole",
                        "name": "${clusterRole}"
                    }
                }`
                rbac.createClusterRolebinding(request_body)
            }
        })
    },

    /**
    * Delete the clusterrolebinding
    * @param {string} clusterRoleBinding the name of clusterrolebinding to be deleted
    */
    deleteClusterRolebinding: (clusterRoleBinding) => {
        rbac.deleteClusterRolebinding(clusterRoleBinding).then((resp) => expect(resp.isOkStatusCode))
    },

    /**
    * Create the rolebinding with clusterrole in namespace
    * @param {string} roleBinding the name of rolebinding to be created
    * @param {string} clusterRole the clusterrole to be associate for this rolebinding
    * @param {string} namespace the namespace of rolebinding to be created in
    * @param {string} user the user to be associate for this rolebinding
    */
    shouldHaveRolebindingForUser: (rolebinding, namespace, clusterRole, user) => {
        rbac.getRolebinding(rolebinding, namespace).then((resp) => {
            if (!resp.isOkStatusCode) {
                let request_body = `
                {
                    "kind": "RoleBinding",
                    "apiVersion": "rbac.authorization.k8s.io/v1",
                    "metadata": {
                        "name": "${rolebinding}",
                        "namespace": "${namespace}"
                    },
                    "subjects": [{
                        "kind": "User",
                        "apiGroup": "rbac.authorization.k8s.io",
                        "name": "${user}"
                    }],
                    "roleRef": {
                        "apiGroup": "rbac.authorization.k8s.io",
                        "kind": "ClusterRole",
                        "name": "${clusterRole}"
                    }
                }`
                rbac.createRolebinding(request_body, namespace)
            }
        })
    },

    /**
    * Delete the rolebinding in namespace
    * @param {string} rolebinding the name of rolebinding to be deleted
    * @param {string} namespace the namespace of rolebinding
    */
    deleteRolebinding: (rolebinding, namespace) => {
        rbac.deleteRolebinding(rolebinding, namespace).then((resp) => expect(resp.isOkStatusCode))
    }
}