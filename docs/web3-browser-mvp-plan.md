# Web3 Browser MVP Technical Plan

## 1) Product Scope

This MVP delivers a desktop-first, EVM-first Web3 browser experience with local custody.

### Goals
- Provide a browser-like shell experience with tab concept and navigation input.
- Offer a built-in non-custodial wallet (local-only key material).
- Support dApp connection permissions and transaction/message approval flow.
- Add first-line safety features (permission boundaries, phishing checks, basic simulation stubs).
- Resolve decentralized content targets like `ipfs://` and ENS-like names with fallback behavior.

### Non-Goals (MVP)
- Native Chromium fork.
- Full multi-chain implementation.
- Hardware wallet support.
- Production-grade anti-phishing intelligence feeds.

## 2) Layered Architecture

### A. UI Shell Layer
- React app renders:
  - Top bar (address/search input)
  - Tab strip (mocked for MVP)
  - Security status panel
  - Wallet state panel
  - Permission center
- Keeps orchestration state for current URL, active account, and requests.

### B. Wallet & Identity Layer
- `walletService` responsibilities:
  - Create/import local wallet profile.
  - Lock/unlock session.
  - Sign messages and transactions (mock-signing in MVP scaffold).
- Local storage only; no custody through backend.

### C. Chain Abstraction Layer
- `providerService` responsibilities:
  - EIP-1193-like connect/disconnect flow.
  - RPC endpoint configuration with fallback list.
  - Prepare transaction payload lifecycle (estimate/simulate/send stubs).

### D. Decentralized Content Layer
- `contentResolver` responsibilities:
  - Convert `ipfs://` URIs to configured gateway URLs.
  - Detect probable ENS input (`*.eth`) and provide resolver placeholders.
  - Normalize standard HTTPS URLs.

### E. Security & Privacy Layer
- `securityService` responsibilities:
  - Domain-level permission checks.
  - Blocklist matching for known phishing hosts.
  - Transaction risk flags (simple heuristic in MVP).

## 3) Folder Structure (Current Iteration)

```text
src/
  App.jsx
  features/
    browser/
      mockData.js
      useBrowserController.js
  services/
    wallet/
      walletService.js
    provider/
      providerService.js
    content/
      contentResolver.js
    security/
      securityService.js
```

## 4) Data and Flow

1. User enters URL/target in address bar.
2. `contentResolver` normalizes target.
3. `securityService` checks host against blocklist and returns risk flags.
4. If dApp asks connection:
   - `providerService` creates connection request.
   - UI asks approval.
   - On approve, permission bound to origin.
5. If signing requested:
   - `securityService` runs heuristic checks.
   - `walletService` signs if approved and unlocked.

## 5) Testing Strategy (MVP)

- Unit tests (next iteration target):
  - URL normalization cases (`https`, `ipfs`, ENS-style).
  - Permission checks and blocklist behavior.
  - Wallet lock/unlock and signing preconditions.
- Integration smoke checks:
  - Connect -> approve -> sign flow in UI state machine.

## 6) Hardening Backlog

- Encrypt wallet secrets at rest with OS keychain integration.
- Add transaction simulation provider and richer risk scoring.
- Introduce real tab process isolation strategy.
- Add telemetry with explicit opt-in and privacy budget limits.
