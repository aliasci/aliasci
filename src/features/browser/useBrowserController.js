import { useMemo, useState } from 'react'
import { DEFAULT_IPFS_GATEWAY, PHISHING_HOSTS, SAMPLE_TABS, SAMPLE_TARGETS } from './mockData'
import { normalizeTarget } from '../../services/content/contentResolver'
import { createSecurityService } from '../../services/security/securityService'
import { createWalletService } from '../../services/wallet/walletService'
import { createProviderService } from '../../services/provider/providerService'

const walletService = createWalletService()
const providerService = createProviderService()
const securityService = createSecurityService({ blocklistedHosts: PHISHING_HOSTS })

function trimAddress(address) {
  if (!address) {
    return 'No wallet'
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useBrowserController() {
  const [inputTarget, setInputTarget] = useState(SAMPLE_TARGETS[0])
  const [activeTarget, setActiveTarget] = useState(SAMPLE_TABS[0].target)
  const [tabs] = useState(SAMPLE_TABS)
  const [walletProfile, setWalletProfile] = useState(() => walletService.getProfile())
  const [lastSignature, setLastSignature] = useState('')
  const [lastTxResult, setLastTxResult] = useState('')
  const [lastError, setLastError] = useState('')
  const [connectionRequest, setConnectionRequest] = useState(null)
  const [permissions, setPermissions] = useState(() => providerService.listPermissions())

  const resolved = useMemo(
    () => normalizeTarget(activeTarget, DEFAULT_IPFS_GATEWAY),
    [activeTarget],
  )
  const security = useMemo(() => securityService.inspectHost(resolved.host), [resolved.host])

  const walletSummary = {
    label: walletProfile?.label || 'No wallet',
    address: trimAddress(walletProfile?.address),
    isLocked: walletProfile?.isLocked ?? true,
  }

  function clearError() {
    if (lastError) {
      setLastError('')
    }
  }

  function onNavigate() {
    clearError()
    setActiveTarget(inputTarget)
  }

  function onUseSampleTarget(target) {
    clearError()
    setInputTarget(target)
    setActiveTarget(target)
  }

  function createWallet() {
    clearError()
    const profile = walletService.createProfile('Primary Wallet')
    setWalletProfile(profile)
  }

  function importWallet(privateKey) {
    clearError()
    try {
      const profile = walletService.importProfile(privateKey, 'Imported Wallet')
      setWalletProfile(profile)
    } catch (error) {
      setLastError(error.message)
    }
  }

  function unlockWallet() {
    clearError()
    try {
      const profile = walletService.unlock()
      setWalletProfile(profile)
    } catch (error) {
      setLastError(error.message)
    }
  }

  function lockWallet() {
    clearError()
    const profile = walletService.lock()
    setWalletProfile(profile)
  }

  function requestConnection() {
    clearError()
    if (!walletProfile?.address) {
      setLastError('Create or import a wallet first.')
      return
    }
    const request = providerService.requestConnection(resolved.host, walletProfile.address)
    setConnectionRequest(request)
  }

  function approveConnection() {
    if (!connectionRequest || !walletProfile?.address) {
      return
    }
    providerService.approveConnection(connectionRequest.origin, walletProfile.address)
    setConnectionRequest(null)
    setPermissions(providerService.listPermissions())
  }

  function rejectConnection() {
    setConnectionRequest(null)
  }

  function revokePermission(origin) {
    providerService.revokeConnection(origin)
    setPermissions(providerService.listPermissions())
  }

  function ensurePermissionForResolvedOrigin() {
    const origin = resolved.host
    if (!origin) {
      throw new Error('Current target has no valid origin')
    }
    const permission = providerService.getPermission(origin)
    if (!permission) {
      throw new Error('Connect this origin before signing')
    }
    return origin
  }

  function signDemoMessage() {
    clearError()
    try {
      const origin = ensurePermissionForResolvedOrigin()
      const request = providerService.requestSignature(origin, { message: 'Sign into Awi Bowser MVP' })
      const signature = walletService.signMessage(request.payload.message)
      setLastSignature(signature)
    } catch (error) {
      setLastError(error.message)
    }
  }

  function signDemoTransaction() {
    clearError()
    try {
      ensurePermissionForResolvedOrigin()
      const txRequest = {
        to: '0x1111111111111111111111111111111111111111',
        valueWei: 1_000_000_000_000_000n,
      }
      const risk = securityService.evaluateTransaction(txRequest)
      if (!risk.approvedForReview) {
        setLastError(risk.warnings.join(', '))
        return
      }
      const result = walletService.signTransaction(txRequest)
      setLastTxResult(result)
    } catch (error) {
      setLastError(error.message)
    }
  }

  return {
    inputTarget,
    setInputTarget,
    activeTarget,
    tabs,
    resolved,
    security,
    permissions,
    walletSummary,
    lastSignature,
    lastTxResult,
    lastError,
    connectionRequest,
    onNavigate,
    onUseSampleTarget,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    requestConnection,
    approveConnection,
    rejectConnection,
    revokePermission,
    signDemoMessage,
    signDemoTransaction,
  }
}
