function toSet(list) {
  return new Set(list.map((entry) => entry.toLowerCase()))
}

export function createSecurityService({ blocklistedHosts }) {
  const blocked = toSet(blocklistedHosts)

  function inspectHost(host) {
    if (!host) {
      return { status: 'unknown', blocked: false, reasons: ['Host unavailable'] }
    }

    if (blocked.has(host)) {
      return {
        status: 'critical',
        blocked: true,
        reasons: ['Known phishing host matched local blocklist'],
      }
    }

    if (host.includes('airdrop') || host.includes('claim')) {
      return {
        status: 'warning',
        blocked: false,
        reasons: ['Promotional keyword pattern matched; review carefully'],
      }
    }

    return { status: 'ok', blocked: false, reasons: ['No local risk signal detected'] }
  }

  function evaluateTransaction(txRequest) {
    const warnings = []

    if (!txRequest.to) {
      warnings.push('Recipient address missing')
    }

    if (typeof txRequest.valueWei === 'bigint' && txRequest.valueWei > 2_000_000_000_000_000_000n) {
      warnings.push('High transfer amount for MVP threshold')
    }

    return {
      approvedForReview: warnings.length === 0,
      warnings,
    }
  }

  return {
    inspectHost,
    evaluateTransaction,
  }
}
