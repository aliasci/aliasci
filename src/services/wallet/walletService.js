const STORAGE_KEY = 'web3-browser-wallet-profile'

function pseudoHex(length) {
  const alphabet = 'abcdef0123456789'
  let result = ''
  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return result
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
  function getProfile() {
    return readStorage(storage)
  }

  function createProfile(label) {
    const privateKey = `0x${pseudoHex(64)}`
    const address = toAddress(privateKey.replace('0x', ''))
    const profile = {
      label: label || 'Primary Wallet',
      address,
      privateKey,
      createdAt: new Date().toISOString(),
      isLocked: true,
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(profile))
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
      privateKey: `0x${normalized}`,
      createdAt: new Date().toISOString(),
      isLocked: true,
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(profile))
    return profile
  }

  function unlock() {
    const profile = getProfile()
    if (!profile) {
      throw new Error('Wallet profile not found')
    }

    const unlocked = { ...profile, isLocked: false }
    storage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    return unlocked
  }

  function lock() {
    const profile = getProfile()
    if (!profile) {
      return null
    }
    const locked = { ...profile, isLocked: true }
    storage.setItem(STORAGE_KEY, JSON.stringify(locked))
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

    return `0xsignature_${pseudoHex(32)}_${message.length.toString(16)}`
  }

  function signTransaction(txPayload) {
    const profile = getProfile()
    if (!profile) {
      throw new Error('No wallet available')
    }
    if (profile.isLocked) {
      throw new Error('Wallet is locked')
    }

    const fingerprint = `${txPayload.to || 'unknown'}:${String(txPayload.valueWei || 0)}`
    return `0xtx_${pseudoHex(20)}_${fingerprint.length.toString(16)}`
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
