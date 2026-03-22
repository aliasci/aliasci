const ENS_SUFFIX = '.eth'

function ensureHttps(target) {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(target)) {
    return target
  }
  return `https://${target}`
}

export function normalizeTarget(rawTarget, ipfsGateway) {
  const target = rawTarget.trim()

  if (!target) {
    return {
      input: rawTarget,
      kind: 'invalid',
      normalizedTarget: '',
      resolvedUrl: '',
      host: '',
    }
  }

  if (target.startsWith('ipfs://')) {
    const cidPath = target.replace('ipfs://', '')
    const resolvedUrl = `${ipfsGateway}${cidPath}`

    return {
      input: rawTarget,
      kind: 'ipfs',
      normalizedTarget: target,
      resolvedUrl,
      host: extractHost(resolvedUrl),
    }
  }

  if (target.toLowerCase().endsWith(ENS_SUFFIX)) {
    const normalizedTarget = target.toLowerCase()
    const resolvedUrl = `https://app.ens.domains/name/${normalizedTarget}`
    return {
      input: rawTarget,
      kind: 'ens',
      normalizedTarget,
      resolvedUrl,
      host: extractHost(resolvedUrl),
    }
  }

  const resolvedUrl = ensureHttps(target)
  return {
    input: rawTarget,
    kind: 'web',
    normalizedTarget: resolvedUrl,
    resolvedUrl,
    host: extractHost(resolvedUrl),
  }
}

export function extractHost(urlValue) {
  try {
    return new URL(urlValue).hostname.toLowerCase()
  } catch {
    return ''
  }
}
