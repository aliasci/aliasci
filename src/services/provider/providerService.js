function makeRequestId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createProviderService() {
  const permissionMap = new Map()

  function requestConnection(origin, address) {
    return {
      id: makeRequestId('connect'),
      type: 'connect',
      origin,
      requestedAccounts: [address],
      createdAt: new Date().toISOString(),
    }
  }

  function approveConnection(origin, address) {
    permissionMap.set(origin, { address, approvedAt: new Date().toISOString() })
    return permissionMap.get(origin)
  }

  function revokeConnection(origin) {
    permissionMap.delete(origin)
  }

  function getPermission(origin) {
    return permissionMap.get(origin) || null
  }

  function listPermissions() {
    return [...permissionMap.entries()].map(([origin, value]) => ({
      origin,
      ...value,
    }))
  }

  function requestSignature(origin, payload) {
    return {
      id: makeRequestId('sign'),
      type: 'sign',
      origin,
      payload,
      createdAt: new Date().toISOString(),
    }
  }

  return {
    requestConnection,
    approveConnection,
    revokeConnection,
    getPermission,
    listPermissions,
    requestSignature,
  }
}
