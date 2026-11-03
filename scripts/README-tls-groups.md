# ACM-47232 managed Console test

This `test/ACM-47232-tls-groups-review` branch holds review-only test files for [PR #7071](https://github.com/stolostron/console/pull/7071). It has the same backend source as the PR branch; the test files are not part of the PR.

The shared `cs-aws-51` cluster pool has a test environment under claim **`rbrunopi-groups`** in the `console-squad` namespace. It has ACM and MCE 5.1 and the `TLSGroupPreferences` gate. Check out this test branch and use the claim's kubeconfig:

```sh
git fetch https://github.com/Randy424/console.git test/ACM-47232-tls-groups-review
git switch --detach FETCH_HEAD
export TLS_GROUP_KUBECONFIG="$HOME/Repositories/cluster-keeper/dependencies/lifeguard/clusterclaims/rbrunopi-groups/kubeconfig"
./scripts/test-tls-groups.sh all | tee tls-groups-result.log
```

If the claim file is at that default path, the script selects it automatically, even when a global `KUBECONFIG` is stale. Set `TLS_GROUP_KUBECONFIG` when your copy is elsewhere. The script requires `oc`, `jq`, Go 1.26+, `git`, and cluster-admin access. Run one copy at a time.

| Mode | Purpose |
| --- | --- |
| `all` (default) | Prepare the current checkout, then run the TLS matrix. |
| `prepare` | Build the current backend binary for Linux, overlay it on the installed ACM/MCE Console images, apply the operators' image overrides, and verify every ready pod's binary hash. |
| `test` | Require both managed Consoles to run the current binary, then probe their TLS listeners through temporary local port-forwards. |
| `restore` | Restore the saved API server TLS profile after an interrupted test. The next invocation of any mode also does this automatically. |
| `status` | Wait for master pool recovery and verify both managed Console images without patching the TLS profile. |

The test checks unset behavior, P-256-only restriction, P-256/P-384 expansion, TLS 1.3 `X25519MLKEM768` with P-256, and restoration. Every allowed handshake must return HTTP 200 from the backend plugin manifest; rejected handshakes must fail with a TLS alert. It checks TLS 1.2 and 1.3 for both managed components, confirms the Console pods did not restart during profile changes, and waits for the master MachineConfigPool to settle. Certificate validation is disabled only in the probe so it measures group policy with the same endpoint and certificate for positive and negative controls.

The script saves the original `APIServer/cluster.spec.tlsSecurityProfile` in a dedicated ConfigMap before patching it. It restores the profile on normal exit or error, and a later run recovers it after a forced termination. Image overrides, image builds, and merged pull credentials remain installed for follow-up testing. Repeating `prepare` or `all` skips image builds when the ready pods already contain the current checkout's binary.

OpenShift may roll control-plane nodes after profile changes. The no-restart assertion covers the live handshake sequence; a later node reboot may reschedule a Console pod, which the script reports separately. The script waits up to 30 minutes for the master pool and repairs any failed Console image pulls during recovery. It leaves the cluster on the current branch images with the original TLS profile restored.

This is developer validation of the branch on the shared claim. ART image, actual process FIPS mode, scanner, and formal QE verification remain separate.
