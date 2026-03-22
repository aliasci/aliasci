const STORAGE_KEY = 'awi-bowser-wallet-profile'
const inMemorySecretVault = new Map()

function secureHex(length) {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure random source is unavailable in this environment')
  }

  const bytes = new Uint8Array(Math.ceil(length / 2))
  cryptoApi.getRandomValues(bytes)
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return hex.slice(0, length)
}

function toAddress(seed) {
  return `0x${seed.slice(0, 40)}`
}

function readStorage(storage) {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function createWalletService(storage = window.localStorage) {
  function persistProfile(profile) {
    // Intentionally avoid persisting secret material to localStorage.
    storage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }

  function getPrivateKey(profile) {
    return profile?.address ? inMemorySecretVault.get(profile.address) : null
  }

  function getProfile() {
    return readStorage(storage)
  }

  function createProfile(label) {
    const privateKey = `0x${secureHex(64)}`
    const address = toAddress(privateKey.replace('0x', ''))
    const profile = {
      label: label || 'Primary Wallet',
      address,
      createdAt: new Date().toISOString(),
      isLocked: true,
    }
    inMemorySecretVault.set(address, privateKey)
    persistProfile(profile)
    return profile
  }

  function importProfile(privateKey, label) {
    const normalized = privateKey.trim().replace(/^0x/i, '').toLowerCase()
    if (!/^[a-f0-9]{64}$/.test(normalized)) {
      throw new Error('Invalid private key format')
    }

    const profile = {
      label: label || 'Imported Wallet',
      address: toAddress(normalized),
      createdAt: new Date().toISOString(),
      isLocked: true,
    }
    inMemorySecretVault.set(profile.address, `0x${normalized}`)
    persistProfile(profile)
    return profile
  }

  function unlock() {
    const profile = getProfile()
    if (!profile) {
      throw new Error('Wallet profile not found')
    }
    if (!getPrivateKey(profile)) {
      throw new Error('Wallet secret unavailable, re-import wallet for this session')
    }

    const unlocked = { ...profile, isLocked: false }
    persistProfile(unlocked)
    return unlocked
  }

  function lock() {
    const profile = getProfile()
    if (!profile) {
      return null
    }
    const locked = { ...profile, isLocked: true }
    persistProfile(locked)
    return locked
  }

  function signMessage(message) {
    const profile = getProfile()
    if (!profile) {
      throw new Error('No wallet available')
    }
    if (profile.isLocked) {
      throw new Error('Wallet is locked')
    }
    if (!getPrivateKey(profile)) {
      throw new Error('Wallet secret unavailable, re-import wallet for this session')
    }

    return `0xsignature_${secureHex(32)}_${message.length.toString(16)}`
  }

  function signTransaction(txPayload) {
    const profile = getProfile()
    if (!profile) {
      throw new Error('No wallet available')
    }
    if (profile.isLocked) {
      throw new Error('Wallet is locked')
    }
    if (!getPrivateKey(profile)) {
      throw new Error('Wallet secret unavailable, re-import wallet for this session')
    }

    const fingerprint = `${txPayload.to || 'unknown'}:${String(txPayload.valueWei || 0)}`
    return `0xtx_${secureHex(20)}_${fingerprint.length.toString(16)}`
  }

  return {
    getProfile,
    createProfile,
    importProfile,
    unlock,
    lock,
    signMessage,
    signTransaction,
  }
}
