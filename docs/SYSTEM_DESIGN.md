# HelalFinans — Interest-Free Fintech Platform: System Design

> Full-scale, production-ready SaaS platform for interest-free (Islamic / participation finance) institutions.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Modules (Detailed)](#2-core-modules-detailed)
3. [Tasarruf Finance Special Modules](#3-tasarruf-finance-special-modules)
4. [Participation Finance Modules](#4-participation-finance-modules)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Key Workflows](#6-key-workflows)
7. [Marketplace (HelalHesap Integration)](#7-marketplace-helalhesap-integration)
8. [Data & Analytics](#8-data--analytics)
9. [Compliance & Audit](#9-compliance--audit)
10. [MVP Roadmap](#10-mvp-roadmap)
11. [Differentiation](#11-differentiation)

---

## 1. System Overview

### 1.1 Vision

HelalFinans is a vertically integrated SaaS platform purpose-built for Turkey's interest-free finance ecosystem. It combines a consumer-facing marketplace (lead generation and product comparison) with a full back-office ERP/core operating system that handles every stage of the customer lifecycle — from first click to final delivery and beyond.

### 1.2 Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONSUMER LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Marketplace  │  │  Customer    │  │  Mobile App / WebView    │  │
│  │  (HelalHesap) │  │  Portal      │  │  (PWA)                   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
├─────────┼─────────────────┼────────────────────────┼────────────────┤
│         │          API GATEWAY / BFF               │                │
│         │    ┌─────────────────────────┐           │                │
│         └────┤  Rate Limiting          ├───────────┘                │
│              │  Auth (JWT + OAuth2)    │                            │
│              │  Tenant Resolution      │                            │
│              │  Request Routing        │                            │
│              └────────────┬────────────┘                            │
├───────────────────────────┼─────────────────────────────────────────┤
│                    CORE ERP LAYER                                   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐       │
│  │ CRM &     │ │ Customer  │ │ Product & │ │ Offer &      │       │
│  │ Lead Mgmt │ │ & KYC     │ │ Plan Eng. │ │ Contract     │       │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └──────┬───────┘       │
│        │              │             │               │               │
│  ┌─────┴─────┐ ┌──────┴──────┐ ┌───┴──────┐ ┌─────┴──────────┐   │
│  │ Payment & │ │ Document    │ │ Tasarruf  │ │ Participation  │   │
│  │ Collection│ │ Management  │ │ Finance   │ │ Finance        │   │
│  └─────┬─────┘ └──────┬──────┘ └───┬──────┘ └──────┬─────────┘   │
│        │              │             │               │               │
├────────┼──────────────┼─────────────┼───────────────┼───────────────┤
│              COMPLIANCE & INTELLIGENCE LAYER                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │ Audit     │ │ Reporting │ │ Risk &    │ │ Notification     │   │
│  │ Engine    │ │ & BI      │ │ Scoring   │ │ Engine           │   │
│  └───────────┘ └───────────┘ └───────────┘ └──────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE LAYER                            │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ PostgreSQL │ │ Redis    │ │ S3/Minio │ │ Message Broker     │  │
│  │ (per-tenant│ │ Cache    │ │ (Docs)   │ │ (RabbitMQ/Kafka)   │  │
│  │  schema)   │ │          │ │          │ │                    │  │
│  └────────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow Between Layers

**Marketplace → ERP:**
1. Consumer visits marketplace, compares products across institutions.
2. Consumer submits an interest form → a `Lead` is created in the marketplace database.
3. The Lead is pushed (via REST/webhook or event queue) to the matched institution's ERP tenant.
4. The ERP's CRM module picks up the lead, assigns it to a sales agent, and the lifecycle begins.

**ERP Internal Flow:**
1. Lead is qualified → converted to `Customer` entity.
2. KYC checks run (identity verification, credit bureau queries, internal scoring).
3. `Product` and `Plan` engine generates personalized offers.
4. Customer accepts → `Contract` is created with installment schedule.
5. Payments are collected → tracked against the installment schedule.
6. For Tasarruf finance: customer enters a group/pool → allocation/lottery → delivery.
7. For Participation finance: asset is purchased → delivered → financing schedule begins.

**ERP → Compliance Layer:**
- Every state change emits an audit event (immutable append-only log).
- Nightly batch jobs aggregate data into BI-ready materialized views.
- Risk scoring engine evaluates portfolio health in near-real-time.

**ERP → Consumer Layer:**
- Customer portal reads contract status, installment schedule, payment history.
- Notifications (SMS, email, push) are dispatched via the notification engine.

### 1.4 Multi-Tenancy Model

Each financial institution is a **tenant**. Tenancy is enforced at the database level using PostgreSQL schemas (one schema per tenant within a shared cluster). This provides:

- **Data isolation**: No cross-tenant data leakage.
- **Schema-level migrations**: Tenants can be upgraded independently if needed.
- **Cost efficiency**: Shared infrastructure, isolated data.

Tenant resolution happens at the API Gateway level via subdomain (`fuzulev.helalfinans.com`) or a tenant header.

---

## 2. Core Modules (Detailed)

### 2.1 CRM & Lead Management

#### Lead Sources

| Source | Mechanism | Data Quality | Priority |
|--------|-----------|-------------|----------|
| Marketplace (HelalHesap) | API push via webhook | High (structured form) | High |
| Institution's own website | Embedded form / widget | Medium | High |
| Branch walk-in | Manual entry by agent | Varies | Medium |
| Call center | Inbound call logging | Medium | Medium |
| Referral | Referral link tracking | High | High |
| Social media / Ads | UTM-tagged landing pages | Low-Medium | Low |
| Partner channel | B2B API integration | High | Medium |

#### Pipeline Stages

```
[New] → [Contacted] → [Qualified] → [Proposal Sent] → [Negotiation] → [Won/Lost]
                ↓            ↓              ↓                ↓
            [No Answer]  [Disqualified] [Rejected]      [Stalled]
```

**Stage Definitions:**

| Stage | SLA | Auto-Actions |
|-------|-----|--------------|
| New | Agent must contact within 2 hours | Auto-assign based on round-robin + branch proximity + product specialization |
| Contacted | Move to Qualified/Disqualified within 48h | Send introductory materials via SMS/email |
| Qualified | Generate proposal within 24h | Trigger KYC pre-check |
| Proposal Sent | Follow up within 72h | Auto-reminder to agent |
| Negotiation | Resolve within 7 days | Escalation to branch manager if stalled |
| Won | Create customer entity + contract | Trigger onboarding workflow |
| Lost | Capture reason | Feed into analytics for improvement |

#### Assignment Logic

```
FUNCTION assignLead(lead):
  candidates = getActiveAgents(lead.branch_id OR lead.region)

  IF lead.product_type IS SPECIFIC:
    candidates = candidates.filter(agent => agent.specializations.includes(lead.product_type))

  IF lead.source == 'MARKETPLACE' AND lead.priority == 'HIGH':
    candidates = candidates.sortBy(agent => agent.conversion_rate, DESC)
  ELSE:
    candidates = candidates.sortBy(agent => agent.current_load, ASC)  // round-robin weighted

  selected = candidates[0]

  IF selected.current_load > MAX_LOAD_THRESHOLD:
    escalate_to_branch_manager(lead)
  ELSE:
    assign(lead, selected)
    notify(selected, lead)
    start_sla_timer(lead, stage='New', timeout=2h)
```

#### Conversion Tracking

Every stage transition is logged as an event:

```json
{
  "lead_id": "L-2026-00451",
  "from_stage": "qualified",
  "to_stage": "proposal_sent",
  "changed_by": "agent:A-0032",
  "changed_at": "2026-03-22T14:30:00Z",
  "metadata": {
    "proposal_id": "PROP-2026-00112",
    "time_in_previous_stage_seconds": 14400
  }
}
```

Conversion metrics are computed per agent, branch, source, product, and time period.

---

### 2.2 Customer & KYC

#### Identity Verification Flow

```
[ID Document Upload] → [OCR Extraction] → [NVI (Nüfus) Verification]
        ↓                                           ↓
[Liveness Check (optional)] ←─── [Manual Review Queue (if mismatch)]
        ↓
[KYC Status: VERIFIED / REJECTED / PENDING_REVIEW]
```

**Verification Sources:**
- **NVI (Kimlik Paylaşım Sistemi - KPS)**: TC Kimlik No validation, name/surname/birthdate match.
- **Address Verification**: e-Devlet address pull or utility bill OCR.
- **Phone Verification**: OTP via SMS.
- **Email Verification**: Magic link.
- **Credit Bureau**: KKB/Findeks score pull (for risk assessment, not for interest-based scoring).

#### Customer Segmentation

| Segment | Criteria | Treatment |
|---------|----------|-----------|
| New Applicant | No prior relationship | Full KYC required |
| Existing Customer | Has active or completed contract | Streamlined process, pre-filled data |
| VIP / High-Value | Lifetime value > threshold OR referral count > N | Priority assignment, dedicated agent |
| Corporate | Business entity (TCKN → VKN) | Different document requirements, different products |
| Guarantor | Linked to another customer's contract | Limited profile, specific document set |

#### Household / Guarantor Structure

```
Customer (Primary Applicant)
├── Spouse (co-applicant, optional)
├── Guarantor 1
│   ├── Relationship: Father
│   └── Guarantee Type: Joint & Several
├── Guarantor 2
│   ├── Relationship: Colleague
│   └── Guarantee Type: Limited (up to 50,000 TL)
└── Household Members (for expense calculation)
    ├── Dependent 1 (Child, age 5)
    └── Dependent 2 (Child, age 12)
```

Guarantors have their own KYC cycle and must digitally sign the guarantee agreement.

---

### 2.3 Product & Plan Engine

#### Plan Types

**Type 1: Standard Installment (Sabit Taksit)**
- Fixed monthly payment.
- Participation fee spread evenly across all installments.
- Optional down payment (peşinat) reduces total financed amount.

**Type 2: Increasing Payment (Artan Taksit)**
- Payment amount increases by a fixed percentage (e.g., 3% per month or 10% per quarter).
- Suitable for customers expecting income growth.
- Total cost is calculated based on the escalation formula.

**Type 3: Balloon / Back-loaded (Balon Ödeme)**
- Lower regular installments, large final payment.
- Used in certain Tasarruf Finance models where the customer expects to receive allocation before term ends.

**Type 4: Flexible Payment (Esnek Ödeme)**
- Customer defines payment amounts within min/max bounds.
- System tracks total paid vs. required for allocation eligibility.

**Type 5: Group-linked (Gruba Bağlı)**
- Payment amount and schedule are tied to a group/pool.
- Group formation rules determine when payments start.

#### Configurable Rule Engine

The plan engine is driven by a rule configuration that is defined per product per tenant:

```json
{
  "product_id": "PROD-TSF-001",
  "product_name": "Konut Tasarruf Planı - Standart",
  "rules": {
    "min_term_months": 60,
    "max_term_months": 240,
    "min_asset_value": 500000,
    "max_asset_value": 10000000,
    "participation_fee_rate": 0.045,
    "administration_fee_flat": 2500,
    "down_payment_required": false,
    "down_payment_min_pct": 0.0,
    "down_payment_max_pct": 0.40,
    "installment_type": "FIXED",
    "escalation_rate": null,
    "early_allocation_eligible": true,
    "group_size": 100,
    "allocation_method": "LOTTERY_PLUS_MERIT",
    "max_dti_ratio": 0.50,
    "guarantor_required_above": 2000000,
    "currency": "TRY"
  }
}
```

#### Simulation Engine

Before signing a contract, the customer (or agent) can simulate multiple scenarios:

```
INPUT:
  - Asset value: 2,000,000 TL
  - Down payment: 400,000 TL (20%)
  - Term: 120 months
  - Plan type: Fixed installment

OUTPUT:
  - Financed amount: 1,600,000 TL
  - Participation fee: 72,000 TL (4.5%)
  - Administration fee: 2,500 TL
  - Total cost: 1,674,500 TL
  - Monthly installment: 13,954.17 TL
  - Estimated allocation month: 36-48 (based on historical data)
  - Required DTI ratio: 0.28 (within limit)

  Installment Schedule:
  | Month | Payment    | Cumulative | % of Total |
  |-------|-----------|------------|------------|
  | 1     | 13,954.17 | 13,954.17  | 0.83%      |
  | 2     | 13,954.17 | 27,908.34  | 1.67%      |
  | ...   | ...       | ...        | ...        |
  | 120   | 13,954.17 | 1,674,500  | 100%       |
```

The simulation also shows comparison across multiple products/plans side by side.

---

### 2.4 Offer & Contract Management

#### Offer Lifecycle

```
[Draft] → [Pending Approval] → [Approved] → [Sent to Customer] → [Accepted / Rejected / Expired]
                                                     ↓
                                              [Counter-Offer]
                                                     ↓
                                              [Revised → Re-sent]
```

**Offer Generation:**
1. Agent selects product + plan parameters.
2. System runs simulation, validates against rules.
3. If amount exceeds agent's authority limit → routes to branch manager for approval.
4. Approved offer is sent to customer via email/SMS with a unique link.
5. Customer reviews, can request changes (counter-offer).
6. Offer expires after configurable period (default: 7 days).

**Offer Versioning:**
Every change to an offer creates a new version. The system stores the full diff between versions. This is critical for audit compliance.

#### Contract Lifecycle

```
                    ┌─────────────┐
                    │   CREATED   │
                    └──────┬──────┘
                           │ (all documents collected, KYC passed)
                    ┌──────▼──────┐
                    │   PENDING   │
                    │  SIGNATURE  │
                    └──────┬──────┘
                           │ (e-signature completed by all parties)
                    ┌──────▼──────┐
                    │   ACTIVE    │──────────────┐
                    └──────┬──────┘              │
                           │                     │ (breach / non-payment)
              ┌────────────┼────────────┐  ┌─────▼──────┐
              │            │            │  │ DEFAULTED  │
       ┌──────▼──┐  ┌──────▼──┐  ┌─────▼──┐└───────────┘
       │ALLOCATED│  │DELIVERED│  │COMPLETED│
       └─────────┘  └─────────┘  └─────────┘
              │
       ┌──────▼──────┐
       │  CANCELLED  │ (mutual termination / refund)
       └─────────────┘
```

**Contract States Explained:**

| State | Meaning | Allowed Transitions |
|-------|---------|-------------------|
| CREATED | Contract entity exists, documents being collected | → PENDING_SIGNATURE, → CANCELLED |
| PENDING_SIGNATURE | Awaiting e-signature from customer + guarantors | → ACTIVE, → CANCELLED |
| ACTIVE | Signed and in force, payments being collected | → ALLOCATED, → DELIVERED, → COMPLETED, → DEFAULTED, → CANCELLED |
| ALLOCATED | Customer has been allocated in lottery/merit (Tasarruf only) | → DELIVERED, → CANCELLED |
| DELIVERED | Asset has been delivered to customer | → COMPLETED, → DEFAULTED |
| COMPLETED | All obligations fulfilled | Terminal state |
| DEFAULTED | Serious payment delinquency / breach | → ACTIVE (if cured), → CANCELLED |
| CANCELLED | Contract terminated | Terminal state |

#### E-Signature Flow

1. System generates the final contract PDF with all terms, schedules, and disclosures.
2. Contract is uploaded to e-signature provider (e.g., Turkcell e-İmza, DocuSign, or internal qualified signature system).
3. Customer receives SMS with signing link.
4. Customer authenticates (OTP + TC Kimlik), reviews, signs.
5. If guarantors exist, they also receive signing requests.
6. Once all parties sign, contract status moves to ACTIVE.
7. Signed PDF is stored immutably with hash verification.

---

### 2.5 Payment & Collection System

#### Installment Schedule Generation

When a contract becomes ACTIVE, the system generates the full installment schedule:

```json
{
  "contract_id": "CTR-2026-00234",
  "installments": [
    {
      "installment_no": 1,
      "due_date": "2026-04-15",
      "principal": 13254.17,
      "participation_fee": 600.00,
      "admin_fee": 100.00,
      "total_due": 13954.17,
      "status": "PAID",
      "paid_amount": 13954.17,
      "paid_date": "2026-04-14",
      "payment_method": "BANK_TRANSFER"
    },
    {
      "installment_no": 2,
      "due_date": "2026-05-15",
      "principal": 13254.17,
      "participation_fee": 600.00,
      "admin_fee": 100.00,
      "total_due": 13954.17,
      "status": "PENDING",
      "paid_amount": 0,
      "paid_date": null,
      "payment_method": null
    }
  ]
}
```

#### Payment Methods

| Method | Integration | Processing Time | Reconciliation |
|--------|------------|-----------------|----------------|
| Bank Transfer (EFT/Havale) | Bank API or statement parsing | Same day | Automated via reference matching |
| Direct Debit (Otomatik Ödeme) | BKMS integration | Due date | Fully automated |
| Credit/Debit Card | Payment gateway (iyzico, PayTR) | Instant | Automated |
| Branch Cash Payment | POS / manual entry | Instant | Daily reconciliation |
| Mobile Payment (BKM Express) | BKM API | Instant | Automated |

#### Payment Matching Logic

```
FUNCTION matchPayment(incoming_payment):
  // Step 1: Try exact reference match
  match = findByReference(incoming_payment.reference_code)
  IF match FOUND:
    applyPayment(match.contract_id, match.installment_no, incoming_payment)
    RETURN

  // Step 2: Try customer ID + amount match
  contracts = findContractsByCustomerIdentifier(incoming_payment.sender_info)
  FOR contract IN contracts:
    pending = getNextPendingInstallment(contract)
    IF pending.total_due == incoming_payment.amount:
      applyPayment(contract.id, pending.installment_no, incoming_payment)
      RETURN

  // Step 3: Partial match / overpayment
  IF incoming_payment.amount < pending.total_due:
    createPartialPayment(contract.id, pending.installment_no, incoming_payment)
    notify_agent(contract.assigned_agent, 'PARTIAL_PAYMENT')
    RETURN

  IF incoming_payment.amount > pending.total_due:
    applyPayment(contract.id, pending.installment_no, incoming_payment, overpayment=true)
    // Apply surplus to next installment or hold as credit
    RETURN

  // Step 4: Unmatched
  addToReconciliationQueue(incoming_payment)
  notify_operations('UNMATCHED_PAYMENT')
```

#### Delinquency Handling

```
Day 0:   Due date → Payment not received
Day 1:   SMS reminder: "Your payment of X TL was due yesterday."
Day 3:   Second SMS + Email reminder
Day 7:   Agent is notified, phone call required
Day 15:  Formal notice generated (ihtar)
Day 30:  Status changes to OVERDUE. Late fee applied (if contractually agreed).
Day 60:  Escalation to collections team. Guarantor notification.
Day 90:  Contract status → DEFAULTED. Legal process initiated.
Day 90+: Legal team takes over. Contract may be terminated.
```

**Important for Islamic finance**: Late fees must be structured as a contractual penalty (cezai şart) rather than interest. Some institutions donate late fees to charity — the system must support configurable late fee handling rules per tenant.

#### Refund & Cancellation

**Cancellation Scenarios:**

| Scenario | Refund Policy | Processing |
|----------|--------------|------------|
| Customer cancels before allocation | Refund all payments minus admin fee | 15 business days |
| Customer cancels after allocation but before delivery | Refund minus allocation cancellation fee | 30 business days |
| Customer cancels after delivery | Not applicable (restructuring or sale) | N/A |
| Institution cancels (force majeure) | Full refund including fees | 10 business days |
| Mutual termination | Negotiated terms | Per agreement |

Refund calculations account for: participation fees already earned, administrative costs incurred, any insurance premiums, and fund pool impact.

---

### 2.6 Document Management

#### Document Types

| Category | Documents | Required For |
|----------|-----------|-------------|
| Identity | TC Kimlik, Passport, Driving License | KYC |
| Address | Utility bill, e-Devlet address | KYC |
| Income | Payslip, Tax return, Bank statement | Risk assessment |
| Asset | Title deed (tapu), Vehicle registration | Collateral |
| Contract | Signed contract, Guarantee agreement | Legal |
| Insurance | DASK, Housing insurance | Delivery |
| Allocation | Allocation notification, Asset appraisal | Tasarruf |
| Compliance | AML declaration, PEP declaration | Regulatory |

#### Document Verification Workflow

```
[Uploaded] → [Auto-Validation] → [Pending Review] → [Approved / Rejected]
                  ↓                                         ↓
           [OCR Extraction]                          [Reason captured]
                  ↓                                         ↓
           [Data populated                           [Customer notified
            into entity fields]                       to re-upload]
```

**Auto-Validation Rules:**
- File format check (PDF, JPG, PNG only).
- File size check (max 10MB).
- Image quality / readability check (blur detection).
- Expiry date check for identity documents.
- OCR confidence score threshold.

#### Audit Trail

Every document interaction is logged:
- Upload (who, when, IP address, file hash).
- View (who, when — to track data access).
- Download (who, when).
- Approval/Rejection (who, when, reason).
- Deletion (soft-delete only, who, when, reason — requires compliance officer approval).

---

## 3. Tasarruf Finance Special Modules

### 3.1 Business Model Overview

Tasarruf Finansman (Savings Finance) is a unique Turkish financial model where customers contribute to a collective pool. When the pool accumulates enough funds, members receive allocation (tahsisat) to purchase their asset (typically real estate). Allocation is determined by a combination of lottery (kura) and merit (payment regularity / amount contributed).

### 3.2 Group Management

#### Group Formation

```
FUNCTION formGroup(product_id):
  pending_contracts = getContractsByStatus(product_id, 'ACTIVE', not_in_group=true)
  pending_contracts = pending_contracts.sortBy(contract.signed_date, ASC) // FIFO

  IF pending_contracts.count >= product.rules.group_size:
    group = createGroup(
      product_id: product_id,
      size: product.rules.group_size,
      members: pending_contracts.take(product.rules.group_size),
      formation_date: NOW(),
      first_draw_date: NOW() + product.rules.draw_delay_months
    )
    notifyMembers(group, 'GROUP_FORMED')
    RETURN group
  ELSE:
    RETURN null  // Not enough members yet
```

**Group Rules:**
- Typical group size: 50-200 members (configurable per product).
- Groups are formed on a FIFO basis.
- Once formed, a group's composition is locked (members cannot switch groups).
- If a member cancels, their slot can be filled by a new member or left vacant.
- Group formation triggers the start of the draw/allocation cycle.

#### Group States

```
[FORMING] → [ACTIVE] → [ALLOCATING] → [COMPLETED]
                ↓
          [SUSPENDED] (if too many cancellations)
```

### 3.3 Pool / Fund Tracking

#### Fund Pool Structure

Each group has an associated fund pool that tracks all monetary flows:

```
Pool Balance = Σ(Member Payments) - Σ(Allocations Disbursed) - Σ(Refunds) - Σ(Operating Costs)
```

The system maintains a real-time pool ledger:

```json
{
  "group_id": "GRP-2026-00015",
  "pool_summary": {
    "total_collected": 45000000.00,
    "total_allocated": 32000000.00,
    "total_refunded": 1500000.00,
    "operating_costs": 500000.00,
    "available_balance": 11000000.00,
    "next_allocation_target": 2000000.00,
    "can_allocate": true
  },
  "ledger_entries": [
    {
      "entry_id": "LE-00001",
      "type": "MEMBER_PAYMENT",
      "member_id": "M-0032",
      "amount": 13954.17,
      "date": "2026-03-15",
      "running_balance": 45013954.17
    }
  ]
}
```

#### Liquidity Planning

```
FUNCTION projectLiquidity(group_id, months_ahead):
  pool = getPoolBalance(group_id)
  members = getActiveMembers(group_id)

  projections = []
  FOR month IN 1..months_ahead:
    expected_inflow = Σ(member.monthly_payment * member.payment_probability)
    expected_allocations = estimateAllocations(group_id, month)
    expected_refunds = estimateRefunds(group_id, month)

    projected_balance = pool.balance + expected_inflow - expected_allocations - expected_refunds
    projections.append({
      month: month,
      inflow: expected_inflow,
      outflow: expected_allocations + expected_refunds,
      balance: projected_balance,
      risk_flag: projected_balance < 0 ? 'LIQUIDITY_RISK' : 'OK'
    })

  RETURN projections
```

### 3.4 Allocation Logic

Allocation determines which member(s) get to receive their asset in a given period. There are two primary methods:

#### Method 1: Lottery (Kura)

```
FUNCTION runLottery(group_id, draw_date):
  eligible = getEligibleMembers(group_id)
  // Eligibility: all payments current, no delinquency, not already allocated

  pool = getPoolBalance(group_id)
  allocation_amount = getNextAllocationTarget(group_id)

  IF pool.available_balance < allocation_amount:
    RETURN { status: 'INSUFFICIENT_FUNDS', next_attempt: draw_date + 1_month }

  // Regulatory requirement: lottery must be witnessed and recorded
  lottery_session = createLotterySession(
    group_id: group_id,
    date: draw_date,
    eligible_count: eligible.count,
    method: 'RANDOM_DRAW',
    witnessed_by: [notary_id, compliance_officer_id]
  )

  winner = secureRandomSelect(eligible)  // Cryptographically secure random

  allocation = createAllocation(
    group_id: group_id,
    member_id: winner.id,
    amount: allocation_amount,
    method: 'LOTTERY',
    lottery_session_id: lottery_session.id,
    status: 'PENDING_ASSET_SELECTION'
  )

  lottery_session.result = winner.id
  lottery_session.status = 'COMPLETED'

  notifyMember(winner, 'ALLOCATION_WON')
  notifyGroup(group_id, 'LOTTERY_COMPLETED', { winner: winner.masked_name })

  RETURN allocation
```

#### Method 2: Merit-Based (Hak Ediş)

```
FUNCTION allocateByMerit(group_id):
  eligible = getEligibleMembers(group_id)

  FOR member IN eligible:
    member.merit_score = calculateMeritScore(member)

  // Merit score components:
  //   - Payment regularity (40%): percentage of on-time payments
  //   - Total contributed amount (30%): cumulative payments as % of total
  //   - Tenure in group (20%): months since joining
  //   - Extra payments bonus (10%): advance payments or overpayments

  eligible = eligible.sortBy(merit_score, DESC)
  winner = eligible[0]

  // Break ties by join date (earlier = higher priority)
  IF eligible[0].merit_score == eligible[1].merit_score:
    winner = [eligible[0], eligible[1]].sortBy(join_date, ASC)[0]

  allocation = createAllocation(
    group_id: group_id,
    member_id: winner.id,
    method: 'MERIT',
    merit_score: winner.merit_score
  )

  RETURN allocation
```

#### Combined Method (Lottery + Merit)

Most Tasarruf Finance companies use a hybrid:
- N allocations per period: K by lottery, (N-K) by merit.
- Example: 2 allocations per month — 1 lottery, 1 merit.

### 3.5 Delivery Workflow

After allocation, the customer must find and purchase an asset:

```
[ALLOCATED]
    ↓
[ASSET_SEARCH] ← Customer has T months to find asset (configurable, typically 6)
    ↓
[ASSET_SELECTED] → Institution appraises the asset
    ↓
[APPRAISAL_APPROVED] / [APPRAISAL_REJECTED → back to ASSET_SEARCH]
    ↓
[TITLE_TRANSFER] → Legal process (tapu devri)
    ↓
[DISBURSEMENT] → Funds released to seller's account
    ↓
[DELIVERED] → Asset is in customer's name, mortgage registered
    ↓
[POST_DELIVERY] → Remaining installments continue
```

**Edge Cases:**
- **Customer cannot find asset within deadline**: Allocation may be revoked and re-entered into next draw.
- **Appraisal value < allocation amount**: Customer pays the difference or selects a different asset.
- **Appraisal value > allocation amount**: Customer may request increased allocation (subject to rules) or pay the difference.
- **Asset has legal issues** (lien, encumbrance): Rejected, customer finds another asset.
- **Customer wants to change asset type** (e.g., from house to land): Subject to product rules.

### 3.6 State Transitions (Tasarruf-specific)

```
Customer Journey State Machine:

[CONTRACT_SIGNED]
    ↓
[WAITING_FOR_GROUP] ←── Customer is paying but not yet in a group
    ↓
[IN_GROUP] ←── Group formed, draws begin
    ↓
[ELIGIBLE_FOR_DRAW] ←── Meets all criteria for allocation
    ├── [LOTTERY_ENTERED] → [LOTTERY_WON] / [LOTTERY_LOST]
    └── [MERIT_EVALUATED] → [MERIT_ALLOCATED] / [NOT_YET]
         ↓
    [ALLOCATED]
         ↓
    [ASSET_SEARCH]
         ↓
    [DELIVERY_IN_PROGRESS]
         ↓
    [DELIVERED]
         ↓
    [POST_DELIVERY_PAYMENTS]
         ↓
    [COMPLETED]
```

---

## 4. Participation Finance Modules

### 4.1 Financing Workflow (Murabaha-like)

Participation banks use a cost-plus-margin (murabaha) or partnership (musharaka) model. The institution buys the asset and sells it to the customer at a disclosed markup.

```
[Customer Request]
    ↓
[Asset Identification] → Customer identifies the asset they want
    ↓
[Vendor Quotation] → Institution gets price from vendor
    ↓
[Financing Offer] → Institution calculates cost + profit margin
    ↓
[Customer Acceptance]
    ↓
[Purchase Order] → Institution purchases asset from vendor
    ↓
[Asset Receipt] → Institution takes ownership momentarily
    ↓
[Sale to Customer] → Asset sold to customer at agreed price
    ↓
[Delivery + Registration]
    ↓
[Payment Schedule Active] → Customer pays in installments
    ↓
[Completion]
```

### 4.2 Asset Tracking

```json
{
  "asset_id": "AST-2026-00089",
  "type": "REAL_ESTATE",
  "subtype": "APARTMENT",
  "description": "3+1 Apartment, 145m², Kadıköy, Istanbul",
  "vendor": {
    "vendor_id": "VND-0045",
    "name": "ABC İnşaat A.Ş.",
    "tax_id": "1234567890",
    "contact": "+90 212 555 1234"
  },
  "purchase_price": 3000000.00,
  "appraisal_value": 3200000.00,
  "sale_price_to_customer": 3450000.00,
  "profit_margin": 0.15,
  "ownership_chain": [
    { "owner": "VND-0045", "from": "2025-01-01", "to": "2026-03-20" },
    { "owner": "INSTITUTION", "from": "2026-03-20", "to": "2026-03-20" },
    { "owner": "CUST-00123", "from": "2026-03-20", "to": null }
  ],
  "collateral": {
    "type": "MORTGAGE",
    "registered": true,
    "registration_date": "2026-03-21",
    "registration_no": "2026/12345"
  },
  "insurance": {
    "dask_policy": "DASK-2026-456789",
    "housing_policy": "HI-2026-789012",
    "coverage_amount": 3500000.00
  }
}
```

### 4.3 Vendor Management

- Vendor registration and vetting (KYB - Know Your Business).
- Approved vendor list per asset category.
- Vendor payment tracking (disbursement to vendor upon asset purchase).
- Vendor performance scoring (delivery time, issue rate).
- Blacklist management.

### 4.4 Payment Disbursement

```
FUNCTION disburseToVendor(contract_id):
  contract = getContract(contract_id)
  asset = getAsset(contract.asset_id)
  vendor = getVendor(asset.vendor_id)

  VALIDATE:
    - contract.status == 'APPROVED'
    - asset.appraisal.status == 'APPROVED'
    - all documents collected (title deed, insurance, etc.)
    - compliance check passed
    - vendor bank details verified

  disbursement = createDisbursement(
    contract_id: contract_id,
    vendor_id: vendor.id,
    amount: asset.purchase_price,
    bank_account: vendor.bank_account,
    scheduled_date: next_business_day(),
    approval_chain: [operations_officer, finance_manager]
  )

  // Requires dual approval for amounts > threshold
  IF disbursement.amount > DUAL_APPROVAL_THRESHOLD:
    requireApproval(disbursement, [finance_manager, cfo])

  RETURN disbursement
```

### 4.5 Collateral Tracking

```
Collateral Registry:
- Asset linked to contract
- Mortgage registration status
- Insurance coverage verification
- Periodic revaluation schedule (annual or event-triggered)
- Release conditions (all payments completed + no outstanding obligations)
- Forced sale procedures (in case of default)
```

---

## 5. User Roles & Permissions

### Role Matrix

| Permission / Action | Sales Agent | Branch Manager | Operations | Finance | Compliance | Admin | Customer |
|---------------------|:-----------:|:--------------:|:----------:|:-------:|:----------:|:-----:|:--------:|
| View leads | Own | Branch | All | — | All | All | — |
| Create lead | ✓ | ✓ | ✓ | — | — | ✓ | — |
| Assign lead | — | ✓ | ✓ | — | — | ✓ | — |
| View customer data | Own | Branch | All | Limited | All | All | Self |
| Edit customer data | ✓ | ✓ | ✓ | — | — | ✓ | Limited |
| Run KYC check | ✓ | ✓ | ✓ | — | ✓ | ✓ | — |
| Create offer | ✓ | ✓ | — | — | — | ✓ | — |
| Approve offer (>limit) | — | ✓ | — | — | — | ✓ | — |
| Create contract | — | ✓ | ✓ | — | — | ✓ | — |
| Record payment | — | — | ✓ | ✓ | — | ✓ | — |
| Process refund | — | — | — | ✓ | — | ✓ | — |
| Run allocation/lottery | — | — | ✓ | — | ✓ | ✓ | — |
| Approve disbursement | — | — | — | ✓ | — | ✓ | — |
| View audit logs | — | — | — | — | ✓ | ✓ | — |
| Manage users/roles | — | — | — | — | — | ✓ | — |
| View own contract | — | — | — | — | — | — | ✓ |
| Make payment | — | — | — | — | — | — | ✓ |
| Upload documents | ✓ | ✓ | ✓ | — | — | — | ✓ |
| Generate reports | Own | Branch | All | Financial | Compliance | All | — |
| Configure products | — | — | — | — | — | ✓ | — |

### Role Details

**Sales Agent:**
- Works leads in their pipeline.
- Cannot see other agents' leads unless reassigned.
- Has a maximum offer amount authority (e.g., up to 2M TL).
- Performance tracked: conversion rate, response time, customer satisfaction.

**Branch Manager:**
- Oversees all agents in their branch.
- Approves offers exceeding agent authority.
- Can reassign leads between agents.
- Views branch-level dashboards and reports.

**Operations Officer:**
- Handles contract processing, document verification, payment reconciliation.
- Manages allocation/lottery operations.
- Does not interact directly with customers.

**Finance Team:**
- Manages treasury, disbursements, refunds.
- Reconciles bank statements.
- Manages fund pool accounting.
- Dual approval for large disbursements.

**Compliance Officer:**
- Reviews KYC/AML flags.
- Accesses full audit trail.
- Can freeze accounts or flag transactions.
- Generates regulatory reports.
- Witnesses lottery/allocation events.

**Admin (System Administrator):**
- Full system access.
- User and role management.
- Product and rule configuration.
- Tenant settings management.
- System health monitoring.

**Customer (Portal User):**
- Views own contract(s), payment schedule, payment history.
- Makes payments online.
- Uploads required documents.
- Tracks allocation status.
- Receives notifications.
- Cannot view other customers' data.

---

## 6. Key Workflows

### Workflow A: Lead → Customer → Contract

```
Step 1: Lead Capture
  - Source: Marketplace form submission
  - Data: Name, phone, email, desired product, asset value
  - System: Lead created with status=NEW, source=MARKETPLACE

Step 2: Lead Assignment
  - System auto-assigns based on branch proximity + product specialization
  - Agent receives push notification + SMS
  - SLA timer starts (2 hours to first contact)

Step 3: First Contact
  - Agent calls customer, qualifies interest
  - Updates lead status: NEW → CONTACTED
  - Records call notes, customer preferences

Step 4: Qualification
  - Agent collects preliminary info: income range, desired asset type, timeline
  - Runs preliminary eligibility check (DTI ratio, age, residency)
  - Status: CONTACTED → QUALIFIED (or DISQUALIFIED with reason)

Step 5: Customer Creation
  - For qualified leads: create Customer entity
  - Collect TC Kimlik No → initiate KYC
  - Link lead to customer (lead.customer_id = customer.id)

Step 6: KYC Completion
  - Identity verification via NVI
  - Document collection (ID, income proof, address proof)
  - Risk scoring (internal model + Findeks if applicable)
  - KYC Status: PENDING → VERIFIED (or FAILED)

Step 7: Offer Generation
  - Agent selects product, enters parameters (asset value, term, down payment)
  - System runs simulation → generates offer
  - If amount > agent authority → routes to branch manager
  - Offer sent to customer (email + SMS link)

Step 8: Offer Acceptance
  - Customer reviews offer on portal
  - Customer accepts → triggers contract creation
  - OR customer requests changes → new offer version created

Step 9: Contract Creation
  - System generates contract document with all terms
  - Document checklist verified (all required docs collected)
  - Contract status: CREATED

Step 10: Signature
  - E-signature process initiated
  - Customer signs → Guarantor(s) sign → Institution counter-signs
  - Contract status: PENDING_SIGNATURE → ACTIVE

Step 11: Post-Signing
  - Installment schedule generated
  - First payment date set
  - Customer added to portal
  - Welcome notification sent
  - For Tasarruf: customer enters group queue
```

### Workflow B: Contract → Payment → Collection

```
Step 1: Installment Due
  - System generates due notification 5 days before due date
  - Customer receives SMS + email with payment details

Step 2: Payment Collection
  - Auto-debit (if enrolled) → bank processes on due date
  - OR customer pays via portal / bank transfer / branch
  - Payment received → matched to installment

Step 3: Payment Processing
  - System validates amount against expected installment
  - If exact match → installment status = PAID
  - If partial → installment status = PARTIALLY_PAID, remainder tracked
  - If overpayment → excess applied to next installment or held as credit

Step 4: Reconciliation
  - Daily automated reconciliation with bank statements
  - Unmatched payments flagged for manual review
  - Operations team resolves within 24 hours

Step 5: Delinquency (if payment missed)
  - Day 1-3: Automated reminders (SMS + email)
  - Day 7: Agent notification → personal follow-up
  - Day 15: Formal notice (ihtar mektubu)
  - Day 30: Penalty applied (cezai şart), escalation to collections
  - Day 60: Guarantor contacted
  - Day 90: Contract status → DEFAULTED, legal process

Step 6: Regular Reporting
  - Monthly statement generated for customer
  - Updated payment status visible on portal
  - Agent dashboard updated with portfolio health
```

### Workflow C: Collection → Allocation / Delivery

```
Step 1: Pool Monitoring
  - System continuously tracks pool balance per group
  - When balance > next allocation amount → allocation eligible

Step 2: Eligibility Check
  - System identifies eligible members:
    ✓ All payments current (no delinquency)
    ✓ Minimum contribution threshold met
    ✓ Not already allocated
    ✓ All documents current (no expired KYC)

Step 3: Allocation Event
  - Lottery: Cryptographically random selection, witnessed by compliance
  - Merit: Score calculation, ranking, selection
  - Results recorded with full audit trail

Step 4: Winner Notification
  - Allocated member receives notification
  - Deadline set for asset selection (e.g., 6 months)

Step 5: Asset Selection
  - Customer finds desired asset (house, car, etc.)
  - Submits asset details to institution

Step 6: Appraisal
  - Institution arranges independent appraisal
  - Appraisal report submitted
  - IF appraisal OK → proceed
  - IF appraisal < allocation amount → customer adjusts
  - IF appraisal reveals issues → customer finds alternative

Step 7: Documentation
  - Title deed preparation
  - Insurance procurement (DASK + housing)
  - Mortgage registration

Step 8: Disbursement
  - Funds transferred to seller's account
  - Title deed transferred to customer
  - Mortgage registered in institution's favor

Step 9: Delivery Confirmation
  - Contract status: ALLOCATED → DELIVERED
  - Post-delivery obligations begin
  - Remaining installments continue per schedule
```

### Workflow D: Post-Delivery Lifecycle

```
Step 1: Ongoing Payments
  - Customer continues installment payments per schedule
  - Payment process same as Workflow B

Step 2: Annual Review
  - Insurance renewal verification
  - Asset revaluation (if required by policy)
  - Customer data update (address, income changes)

Step 3: Early Completion
  - Customer may pay remaining balance early
  - System calculates: remaining principal + any applicable fees
  - Upon full payment:
    → Mortgage released
    → Contract status: COMPLETED
    → Customer notification + certificate of completion

Step 4: Restructuring (if needed)
  - Customer requests payment plan modification
  - System generates restructuring scenarios
  - Approval by finance team
  - New schedule generated, old one archived

Step 5: Contract Completion
  - Final payment received
  - All obligations met (both sides)
  - Mortgage release initiated
  - Contract status: COMPLETED
  - All collateral released
  - Final statement issued to customer
  - Customer data retained per regulatory requirements (10 years minimum)
```

---

## 7. Marketplace (HelalHesap Integration)

### 7.1 Comparison Engine

The marketplace allows consumers to compare interest-free financial products across institutions:

**Comparison Parameters:**

| Parameter | Input | Used For |
|-----------|-------|----------|
| Asset Type | Dropdown: House, Car, Land, Commercial | Filter products |
| Asset Value | Numeric input | Calculate installments |
| Location | City/District | Filter available institutions |
| Desired Term | Slider: 12-240 months | Match products |
| Down Payment | Slider: 0-50% | Adjust calculations |
| Customer Age | Numeric | Eligibility check |

**Output per Product:**

```json
{
  "institution": "Fuzulev",
  "product": "Konut Tasarruf Planı",
  "monthly_installment": 13954,
  "total_cost": 1674500,
  "participation_fee_rate": 0.045,
  "admin_fee": 2500,
  "estimated_allocation_months": "36-48",
  "allocation_method": "Lottery + Merit",
  "group_size": 100,
  "min_term": 60,
  "max_term": 240,
  "rating": 4.2,
  "review_count": 1847,
  "features": ["No down payment required", "Free insurance first year"],
  "cta_url": "/apply/fuzulev/konut-standart"
}
```

### 7.2 Lead Generation

When a consumer clicks "Apply" on a product comparison:

1. Consumer fills out a structured form (name, TC Kimlik last 4, phone, email, preferences).
2. Lead is created in the marketplace database.
3. Lead is pushed to the partner institution's ERP via API.
4. Consumer receives confirmation SMS with a tracking code.
5. Institution's CRM picks up the lead within the SLA window.

### 7.3 Matching Algorithm

```
FUNCTION matchProducts(consumer_profile):
  all_products = getActiveProducts()

  matched = all_products.filter(product =>
    product.asset_types.includes(consumer.asset_type) AND
    product.min_value <= consumer.asset_value <= product.max_value AND
    product.regions.includes(consumer.location) AND
    product.min_term <= consumer.desired_term <= product.max_term AND
    product.min_age <= consumer.age <= product.max_age
  )

  FOR product IN matched:
    product.simulation = runSimulation(product, consumer_profile)
    product.relevance_score = calculateRelevance(product, consumer_profile)
    // Relevance based on: exact term match, cost efficiency, allocation speed, user reviews

  matched = matched.sortBy(relevance_score, DESC)

  // Sponsored placements: partners who pay for priority listing
  sponsored = matched.filter(p => p.is_sponsored)
  organic = matched.filter(p => !p.is_sponsored)

  RETURN interleave(sponsored, organic, ratio=1:4)
  // Every 5th result can be sponsored, clearly labeled
```

### 7.4 Partner Dashboard

Each institution partner gets a dashboard showing:

- Leads received (total, by period, by product).
- Lead quality metrics (conversion rate, response time compliance).
- Cost per lead / Cost per acquisition.
- Competitive benchmarking (anonymized).
- Product performance (views, clicks, applications).
- Billing and invoices.

### 7.5 Revenue Model

| Revenue Stream | Description |
|---------------|-------------|
| Cost Per Lead (CPL) | Institution pays per qualified lead delivered |
| Cost Per Acquisition (CPA) | Institution pays per lead that converts to contract |
| Featured Listing | Premium placement in comparison results |
| API Integration Fee | Monthly fee for ERP API access |
| Data Analytics | Premium analytics and market intelligence reports |

---

## 8. Data & Analytics

### 8.1 Key Metrics

**Commercial Metrics:**

| Metric | Formula | Target | Alert Threshold |
|--------|---------|--------|-----------------|
| Lead-to-Customer Conversion | Customers / Leads | >15% | <10% |
| Customer-to-Contract Conversion | Contracts / Customers | >60% | <40% |
| Average Contract Value | Σ Contract Values / Count | Trending up | 20% drop MoM |
| Customer Acquisition Cost | Marketing Spend / New Customers | <2000 TL | >3000 TL |
| Average Time to Contract | Avg(contract_date - lead_date) | <14 days | >30 days |

**Financial Metrics:**

| Metric | Formula | Target | Alert Threshold |
|--------|---------|--------|-----------------|
| Collection Rate | Collected / Due | >95% | <90% |
| Delinquency Rate (30+) | Delinquent Contracts / Active | <5% | >8% |
| Default Rate (90+) | Defaulted / Active | <2% | >3% |
| Pool Utilization | Allocated / Pool Balance | Optimal range | <50% or >95% |
| Refund Rate | Cancelled Contracts / Total | <10% | >15% |

**Operational Metrics:**

| Metric | Formula | Target | Alert Threshold |
|--------|---------|--------|-----------------|
| SLA Compliance (Lead Response) | On-time / Total | >90% | <80% |
| Document Processing Time | Avg time to approve docs | <24h | >48h |
| Allocation Turnaround | Allocation to Delivery days | <90 days | >180 days |
| System Uptime | Uptime / Total Time | >99.9% | <99.5% |

### 8.2 BI Layer Design

```
Source Systems                Ingestion              Data Warehouse          Presentation
┌─────────────┐           ┌──────────────┐       ┌──────────────────┐    ┌──────────────┐
│ PostgreSQL  │──CDC──────▶│              │       │                  │    │              │
│ (OLTP)      │           │              │       │  Fact Tables:    │    │  Dashboards  │
├─────────────┤           │  ETL / ELT   │──────▶│  - fact_leads    │───▶│  (Metabase   │
│ Event Store │──Stream──▶│  (dbt +      │       │  - fact_payments │    │   or Superset│
│ (Audit Logs)│           │   Airflow)   │       │  - fact_contracts│    │   or custom) │
├─────────────┤           │              │       │  - fact_allocat. │    │              │
│ External    │──API─────▶│              │       │                  │    │  Scheduled   │
│ (Findeks,   │           └──────────────┘       │  Dim Tables:     │    │  Reports     │
│  Bank APIs) │                                  │  - dim_customer  │    │  (PDF/Email) │
└─────────────┘                                  │  - dim_product   │    │              │
                                                 │  - dim_branch    │    │  Ad-hoc      │
                                                 │  - dim_time      │    │  Queries     │
                                                 └──────────────────┘    └──────────────┘
```

### 8.3 Reporting Dashboards

**Executive Dashboard:**
- Total AUM (Assets Under Management).
- Monthly new contracts (count and value).
- Collection rate trend (6 months).
- Portfolio delinquency heat map.
- Revenue vs. target.

**Sales Dashboard:**
- Pipeline value by stage.
- Conversion funnel.
- Agent leaderboard.
- Lead source effectiveness.
- Response time distribution.

**Operations Dashboard:**
- Payment collection status (today/this week/this month).
- Pending document reviews.
- Upcoming allocations.
- Unmatched payments queue.
- SLA breach alerts.

**Finance Dashboard:**
- Cash flow statement (actual vs. projected).
- Pool balance by group.
- Disbursement queue.
- Refund processing status.
- Bank reconciliation status.

**Compliance Dashboard:**
- KYC completion rates.
- Overdue document renewals.
- AML flag investigations.
- Audit log activity summary.
- Regulatory report status.

---

## 9. Compliance & Audit

### 9.1 Audit Log Architecture

Every significant action in the system generates an immutable audit event:

```json
{
  "event_id": "EVT-2026-03-22-00000451",
  "timestamp": "2026-03-22T14:30:00.123Z",
  "tenant_id": "TNT-FUZULEV",
  "actor": {
    "type": "USER",
    "user_id": "USR-0032",
    "role": "OPERATIONS_OFFICER",
    "ip_address": "192.168.1.50",
    "session_id": "SES-abc123"
  },
  "action": "CONTRACT_STATUS_CHANGE",
  "resource": {
    "type": "CONTRACT",
    "id": "CTR-2026-00234"
  },
  "details": {
    "from_status": "PENDING_SIGNATURE",
    "to_status": "ACTIVE",
    "reason": "All signatures collected"
  },
  "previous_state_hash": "sha256:abc123...",
  "current_state_hash": "sha256:def456..."
}
```

**Audit Log Properties:**
- **Immutable**: Events are append-only. No updates or deletes.
- **Tamper-proof**: Each event includes a hash of the previous event, forming a chain.
- **Complete**: Every state change, data access, and system action is logged.
- **Searchable**: Indexed by entity, actor, action type, and time range.
- **Retained**: Minimum 10 years per regulatory requirements.

### 9.2 Version Control (Entity Versioning)

Critical entities (Customer, Contract, Offer, Plan) maintain full version history:

```
Customer Record:
  Version 1 (2026-01-15): { name: "Ahmet Yılmaz", address: "Kadıköy..." }
  Version 2 (2026-03-01): { name: "Ahmet Yılmaz", address: "Beşiktaş..." }  ← Address changed
  Version 3 (2026-06-15): { name: "Ahmet Yılmaz", address: "Beşiktaş...", phone: "+90 555..." }  ← Phone added
```

Each version stores:
- The full entity state at that point.
- Who made the change.
- When the change was made.
- Why (change reason, if applicable).
- Diff from previous version.

### 9.3 Regulatory Requirements

**BDDK (Banking Regulation and Supervision Agency):**
- Capital adequacy reporting.
- Large exposure reporting.
- Consumer complaint tracking.
- Periodic returns (balance sheet, P&L).

**MASAK (Financial Crimes Investigation Board - AML):**
- Suspicious transaction reporting (STR).
- Customer due diligence (CDD) records.
- Enhanced due diligence for PEPs (Politically Exposed Persons).
- Transaction monitoring rules:
  - Cash transactions > 75,000 TL.
  - Multiple related transactions (structuring).
  - Unusual patterns (sudden large payments, third-party payments).

**KVKK (Personal Data Protection - GDPR equivalent):**
- Consent management (granular opt-in/opt-out).
- Data subject access requests (DSAR).
- Data retention policies.
- Data processing activity records.
- Breach notification procedures.

**SPK (Capital Markets Board) - if applicable:**
- Product disclosure requirements.
- Advertising compliance.
- Investor protection rules.

### 9.4 Data Traceability

Every data field in the system can be traced to its source:

```json
{
  "field": "customer.annual_income",
  "value": 450000,
  "source": "DOCUMENT",
  "source_document_id": "DOC-2026-00567",
  "source_document_type": "PAYSLIP",
  "verified_by": "USR-0044",
  "verified_at": "2026-03-20T10:30:00Z",
  "confidence": "HIGH",
  "expires_at": "2027-03-20T10:30:00Z"
}
```

---

## 10. MVP Roadmap

### MVP (V1) — Foundation

**Scope:**
- CRM with lead management (manual entry + basic import).
- Customer entity with basic KYC (manual verification).
- Single product type (fixed installment Tasarruf plan).
- Contract creation (PDF generation, manual signature).
- Installment schedule generation.
- Payment recording (manual entry).
- Basic reporting (contract list, payment status).
- Single-tenant deployment.
- Admin + Agent + Customer roles only.

**Target Users:** 1 pilot institution (e.g., small Tasarruf Finance company).

### V2 — Operational Excellence

**Scope (adds to V1):**
- Marketplace MVP (product listing, basic comparison, lead API).
- Multi-tenant architecture.
- Automated KYC (NVI integration, OCR for documents).
- Multiple plan types (fixed, increasing, flexible).
- Plan simulation engine.
- E-signature integration.
- Payment gateway integration (auto-debit, card payments).
- Bank statement reconciliation.
- Group management and allocation (lottery).
- Basic document management.
- Full role-based access control.
- Notification engine (SMS + email).
- Customer portal (view contract, make payment).
- Audit logging.

**Target Users:** 3-5 institutions.

### V3 — Scale & Intelligence

**Scope (adds to V2):**
- Full marketplace with comparison engine + partner dashboard.
- Participation finance modules (murabaha workflow, asset tracking).
- Advanced allocation (merit-based, hybrid).
- Liquidity planning and projections.
- BI layer with dashboards (Metabase/Superset integration).
- Risk scoring engine.
- Mobile app (PWA).
- API marketplace for third-party integrations.
- Advanced compliance (MASAK reporting, STR automation).
- Vendor management.
- Campaign management.
- Multi-currency support (for international expansion).
- White-label capability.

**Target Users:** 10+ institutions, 50,000+ end consumers.

---

## 11. Differentiation

### 11.1 Why Not a Generic CRM?

| Generic CRM | HelalFinans |
|-------------|-------------|
| Tracks contacts and deals | Manages entire financial lifecycle |
| No concept of installments | Full installment engine with schedules |
| No payment processing | Integrated payment collection & reconciliation |
| No regulatory compliance | Built-in audit, BDDK/MASAK compliance |
| No fund pool management | Core feature: group/pool/allocation |
| Pipeline is linear | Complex state machines with domain rules |
| No simulation engine | Plan simulation with cost comparison |
| No multi-party contracts | Supports guarantors, co-applicants, witnesses |
| No document verification | OCR + verification workflows |
| Designed for any industry | Purpose-built for Turkish interest-free finance |

### 11.2 Tailored for Islamic Finance

- **No interest calculations anywhere in the system.** All fees are transparent, disclosed upfront, and structured as service fees or profit margins — not as time-value-of-money interest.
- **Murabaha-compliant asset tracking**: The system enforces the rule that the institution must take ownership of the asset before selling to customer (constructive or actual possession).
- **Shari'ah audit trail**: Every transaction can be reviewed for compliance with Islamic finance principles.
- **Terminology**: The entire UI and system uses Shari'ah-compliant terminology (katılım payı, not faiz; hizmet bedeli, not komisyon).
- **Late fee handling**: Configurable per institution — can be donated to charity, waived, or applied as contractual penalty.

### 11.3 Hard to Replicate — Moat

1. **Deep Domain Knowledge**: Rules, edge cases, and workflows specific to Turkish Tasarruf Finance and participation banking are encoded into the system. A generic SaaS cannot replicate this without years of domain expertise.

2. **Regulatory Integration**: Pre-built compliance with BDDK, MASAK, KVKK, and SPK requirements. Building this from scratch is extremely costly and risky for competitors.

3. **Network Effects**: As more institutions join the marketplace, the comparison engine becomes more valuable to consumers, which drives more leads, which attracts more institutions.

4. **Data Moat**: Over time, the platform accumulates data on consumer preferences, conversion patterns, risk models, and market dynamics — enabling better matching, better risk scoring, and better products.

5. **Switching Costs**: Once an institution runs its operations on HelalFinans ERP, migrating away involves moving contracts, payment histories, document archives, and retraining staff — creating strong retention.

6. **Vertical Integration**: The combination of consumer-facing marketplace + back-office ERP creates a closed loop that no horizontal SaaS (just CRM, just payments, just compliance) can match.

7. **Localization**: Turkish language, Turkish regulatory framework, Turkish banking integrations (KPS, KKB, BKMS, e-Devlet) — international SaaS platforms cannot easily serve this market.
