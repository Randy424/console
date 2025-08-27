# Testing Methods for WebSocket Sharing and Caching - VM TreeView

## Test 1: WebSocket Data Caching in VM TreeView

1. Navigate to **Virtualization → VirtualMachines** with treeView active
2. Open DevTools → Network → WS tab to monitor WebSocket connections
3. Expand different clusters and namespaces in the tree's remote clusters to load VM data 
4. **Expected**: VM tree data appears instantly from cache (no loading state), existing WebSocket connections are reused

## Test 2: WebSocket Sharing Demo

1. Open the test webpage: (from the top of console repo) `open -a "Google Chrome" ./frontend/packages/multicluster-sdk/test-shared-websockets.html` in your browser
2. Open DevTools → Console to see detailed logging
3. Click "Add Pod List Component" multiple times - observe only 1 WebSocket created for all Pod components
4. Click "Add VM List Component" - observe a separate WebSocket for VM resources  
5. Remove components individually and watch reference counts decrease
6. **Expected**: Multiple components of the same resource type share one WebSocket, different resource types get separate WebSockets, proper cleanup when components are removed
```