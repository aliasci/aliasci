import { useState } from 'react'
import { SAMPLE_TARGETS } from './features/browser/mockData'
import { useBrowserController } from './features/browser/useBrowserController'

function statusStyles(status) {
  if (status === 'critical') {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (status === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function App() {
  const [importKey, setImportKey] = useState('')
  const {
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
  } = useBrowserController()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
                W3
              </div>
              <div>
                <p className="font-semibold">Awi Bowser</p>
                <p className="text-xs text-slate-400">Desktop MVP • EVM-first</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs">
              Wallet: {walletSummary.address}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  activeTarget === tab.target
                    ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                }`}
                onClick={() => onUseSampleTarget(tab.target)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-violet-500 placeholder:text-slate-500 focus:ring"
              value={inputTarget}
              onChange={(event) => setInputTarget(event.target.value)}
              placeholder="https://app.uniswap.org | ipfs://... | vitalik.eth"
            />
            <button
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              onClick={onNavigate}
            >
              Navigate
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-3 lg:px-8">
        <section className="space-y-4 lg:col-span-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Navigation Result</h2>
            <p className="mt-3 text-sm text-slate-300">
              <span className="text-slate-400">Input:</span> {resolved.input || '-'}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <span className="text-slate-400">Type:</span> {resolved.kind.toUpperCase()}
            </p>
            <p className="mt-1 break-all text-sm text-slate-300">
              <span className="text-slate-400">Resolved URL:</span> {resolved.resolvedUrl || '-'}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <span className="text-slate-400">Host:</span> {resolved.host || '-'}
            </p>
            <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${statusStyles(security.status)}`}>
              Security status: <span className="font-semibold uppercase">{security.status}</span>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                {security.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SAMPLE_TARGETS.map((target) => (
                <button
                  key={target}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-violet-400 hover:text-violet-200"
                  onClick={() => onUseSampleTarget(target)}
                >
                  {target}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">dApp Permission Center</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={requestConnection}
              >
                Request Connect
              </button>
              <button
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
                onClick={signDemoMessage}
              >
                Sign Message
              </button>
              <button
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
                onClick={signDemoTransaction}
              >
                Sign Transaction
              </button>
            </div>

            {connectionRequest && (
              <div className="mt-4 rounded-xl border border-violet-400/40 bg-violet-500/10 p-3 text-sm">
                <p className="font-semibold">Connection request pending</p>
                <p className="mt-1 text-slate-300">Origin: {connectionRequest.origin || 'unknown'}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={approveConnection}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={rejectConnection}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-200">Approved origins</h3>
              {permissions.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No origin connected yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {permissions.map((permission) => (
                    <li
                      key={permission.origin}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs"
                    >
                      <div>
                        <p>{permission.origin}</p>
                        <p className="text-slate-400">{permission.address}</p>
                      </div>
                      <button
                        className="rounded-md border border-red-400 px-2 py-1 text-red-300"
                        onClick={() => revokePermission(permission.origin)}
                      >
                        Revoke
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Wallet</h2>
            <p className="mt-3 text-sm text-slate-300">Label: {walletSummary.label}</p>
            <p className="mt-1 text-sm text-slate-300">
              Status: {walletSummary.isLocked ? 'Locked' : 'Unlocked'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                onClick={createWallet}
              >
                Create
              </button>
              <button
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
                onClick={unlockWallet}
              >
                Unlock
              </button>
              <button
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
                onClick={lockWallet}
              >
                Lock
              </button>
            </div>
            <label className="mt-4 block text-xs text-slate-400">
              Import private key (demo)
              <input
                value={importKey}
                onChange={(event) => setImportKey(event.target.value)}
                placeholder="0x..."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none ring-violet-500 focus:ring"
              />
            </label>
            <button
              className="mt-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
              onClick={() => importWallet(importKey)}
            >
              Import
            </button>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-xs text-slate-300">
            <h2 className="text-sm font-semibold text-slate-100">Latest Output</h2>
            <p className="mt-3 break-all">
              <span className="text-slate-500">Signature:</span> {lastSignature || '-'}
            </p>
            <p className="mt-2 break-all">
              <span className="text-slate-500">Transaction:</span> {lastTxResult || '-'}
            </p>
            <p className="mt-2 break-all text-red-300">
              <span className="text-slate-500">Error:</span> {lastError || '-'}
            </p>
          </article>
        </aside>
      </main>
    </div>
  )
}

export default App
