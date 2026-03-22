# HelalFinans — Workflows & State Machines

> Detailed end-to-end workflows, state machine definitions, and edge case handling.

---

## 1. State Machine Definitions

### 1.1 Lead State Machine

```
States: NEW, CONTACTED, NO_ANSWER, QUALIFIED, DISQUALIFIED, PROPOSAL_SENT, NEGOTIATION, STALLED, WON, LOST

Transitions:
  NEW → CONTACTED          [Agent makes first contact]
  NEW → NO_ANSWER          [Agent cannot reach, 3+ attempts]
  NEW → DISQUALIFIED       [Auto-disqualified by rules]
  NO_ANSWER → CONTACTED    [Customer calls back or agent reaches]
  NO_ANSWER → LOST         [After N attempts over 14 days]
  CONTACTED → QUALIFIED    [Customer meets basic criteria]
  CONTACTED → DISQUALIFIED [Customer doesn't meet criteria]
  QUALIFIED → PROPOSAL_SENT [Offer generated and sent]
  QUALIFIED → LOST         [Customer declines to proceed]
  PROPOSAL_SENT → NEGOTIATION [Customer responds with questions/changes]
  PROPOSAL_SENT → WON      [Customer accepts]
  PROPOSAL_SENT → LOST     [Customer rejects]
  NEGOTIATION → WON        [Agreement reached]
  NEGOTIATION → LOST       [Cannot agree on terms]
  NEGOTIATION → STALLED    [No activity for 14 days]
  STALLED → NEGOTIATION    [Activity resumes]
  STALLED → LOST           [After 30 days stalled]

Terminal States: WON, LOST, DISQUALIFIED

Invariants:
  - WON requires customer_id != null
  - LOST requires lost_reason != null
  - Only SALES_AGENT or BRANCH_MANAGER can transition states
  - All transitions logged to audit trail
```

**Auto-transition rules:**
```
RULE: Auto-disqualify
  WHEN lead.created_at > 90_days_ago AND lead.stage NOT IN (WON, LOST, DISQUALIFIED)
  THEN transition(lead, STALLED)
  AFTER 30 more days: transition(lead, LOST, reason='TIMED_OUT')

RULE: SLA breach alert
  WHEN lead.stage == NEW AND NOW() > lead.sla_first_contact_at
  THEN notify(lead.assigned_agent, 'SLA_BREACH')
  AND notify(branch_manager, 'SLA_BREACH_ESCALATION')
```

### 1.2 Contract State Machine

```
States: CREATED, PENDING_SIGNATURE, ACTIVE, ALLOCATED, DELIVERED, COMPLETED, DEFAULTED, CANCELLED, SUSPENDED

Transitions:
  CREATED → PENDING_SIGNATURE    [All documents collected, contract generated]
  CREATED → CANCELLED            [Customer withdraws before signing]
  PENDING_SIGNATURE → ACTIVE     [All parties signed]
  PENDING_SIGNATURE → CANCELLED  [Signature refused or expired]
  ACTIVE → ALLOCATED             [Tasarruf: customer wins allocation]
  ACTIVE → DELIVERED             [Participation: asset delivered directly]
  ACTIVE → SUSPENDED             [Payment issues, under review]
  ACTIVE → DEFAULTED             [90+ days delinquent]
  ACTIVE → CANCELLED             [Mutual termination]
  ACTIVE → COMPLETED             [All payments made, no delivery needed]
  ALLOCATED → DELIVERED          [Asset found, appraised, transferred]
  ALLOCATED → ACTIVE             [Allocation revoked - deadline missed]
  ALLOCATED → CANCELLED          [Customer cancels after allocation]
  DELIVERED → COMPLETED          [All remaining payments made]
  DELIVERED → DEFAULTED          [90+ days delinquent post-delivery]
  SUSPENDED → ACTIVE             [Issues resolved, payments resumed]
  SUSPENDED → CANCELLED          [Cannot resolve]
  DEFAULTED → ACTIVE             [All delinquent amounts cured]
  DEFAULTED → CANCELLED          [Legal termination]

Terminal States: COMPLETED, CANCELLED

Guards:
  CREATED → PENDING_SIGNATURE:
    - All required documents verified (KYC, income, address)
    - Eligibility check passed (DTI ratio, age, etc.)
    - If guarantor required: guarantor KYC completed

  PENDING_SIGNATURE → ACTIVE:
    - Customer signature collected
    - All guarantor signatures collected
    - Institution counter-signature applied

  ACTIVE → DEFAULTED:
    - Delinquent amount > 0
    - Days overdue > 90 on any installment
    - Formal notice (ihtar) has been sent

  ACTIVE → COMPLETED:
    - total_remaining == 0
    - No pending deliveries or allocations
    - All collateral release conditions met

Side Effects:
  On ACTIVE:
    - Generate installment schedule
    - Set first due date
    - Add to group queue (Tasarruf)
    - Send welcome notification

  On ALLOCATED:
    - Update contract status
    - Set asset search deadline
    - Notify customer

  On DELIVERED:
    - Register mortgage
    - Verify insurance
    - Update remaining installment schedule

  On COMPLETED:
    - Release collateral/mortgage
    - Issue completion certificate
    - Archive contract
    - Update customer segment

  On DEFAULTED:
    - Notify guarantors
    - Freeze further allocations
    - Flag for legal review

  On CANCELLED:
    - Calculate refund amount
    - Process refund
    - Release from group (Tasarruf)
    - Update pool balance
    - Archive documents
```

### 1.3 Allocation State Machine

```
States: PENDING_ASSET_SELECTION, ASSET_SELECTED, APPRAISAL_IN_PROGRESS,
        APPRAISAL_APPROVED, APPRAISAL_REJECTED, DISBURSEMENT_PENDING,
        DISBURSED, DELIVERED, REVOKED, CANCELLED

Transitions:
  PENDING_ASSET_SELECTION → ASSET_SELECTED       [Customer submits asset details]
  PENDING_ASSET_SELECTION → REVOKED               [Deadline passed without selection]
  PENDING_ASSET_SELECTION → CANCELLED             [Customer voluntarily cancels]
  ASSET_SELECTED → APPRAISAL_IN_PROGRESS          [Appraisal ordered]
  ASSET_SELECTED → PENDING_ASSET_SELECTION        [Customer changes mind, picks different asset]
  APPRAISAL_IN_PROGRESS → APPRAISAL_APPROVED      [Appraiser approves]
  APPRAISAL_IN_PROGRESS → APPRAISAL_REJECTED      [Appraiser rejects]
  APPRAISAL_REJECTED → PENDING_ASSET_SELECTION    [Customer must find another asset]
  APPRAISAL_APPROVED → DISBURSEMENT_PENDING       [All documents ready for disbursement]
  DISBURSEMENT_PENDING → DISBURSED                 [Funds transferred to seller]
  DISBURSED → DELIVERED                            [Title transferred, mortgage registered]
  REVOKED → (terminal)                             [Customer re-enters pool for next draw]
  CANCELLED → (terminal)

Guards:
  → DISBURSEMENT_PENDING:
    - Appraisal approved
    - Title deed copy obtained
    - Insurance policies verified (DASK + housing)
    - Seller identity verified
    - Seller bank account verified
    - Mortgage pre-registration confirmed
    - Dual approval obtained (if amount > threshold)

  → DELIVERED:
    - Funds confirmed received by seller
    - Title deed transferred to customer
    - Mortgage registered in institution's favor
    - Customer acceptance form signed

Edge Cases:
  - Appraisal value > allocation amount:
    Customer must cover the difference from own funds.
    System creates a "top-up" payment entry.

  - Appraisal value < allocation amount:
    Only appraised amount is disbursed.
    Remaining allocation amount stays in pool.

  - Asset has existing lien/mortgage:
    Appraisal rejected with reason 'EXISTING_ENCUMBRANCE'.
    Customer must find clean-title property.

  - Seller is related party to customer:
    Flagged for compliance review.
    Requires additional approval from compliance officer.

  - Customer wants to change asset type (e.g., apartment → land):
    Allowed only if product rules permit.
    New appraisal required.
```

### 1.4 Payment State Machine

```
States: RECEIVED, PROCESSING, APPLIED, RETURNED, DISPUTED, REFUNDED

Transitions:
  RECEIVED → PROCESSING      [Payment enters matching pipeline]
  PROCESSING → APPLIED       [Successfully matched to installment]
  PROCESSING → RETURNED      [Payment bounced / insufficient funds]
  APPLIED → DISPUTED         [Customer or institution disputes]
  APPLIED → REFUNDED         [Refund processed]
  DISPUTED → APPLIED         [Dispute resolved in favor of application]
  DISPUTED → REFUNDED        [Dispute resolved, refund issued]

Edge Cases:
  - Double payment: Second payment applied to next installment or held as credit.
  - Partial payment: Installment marked PARTIALLY_PAID, remainder tracked.
  - Third-party payment: Flagged for AML review if sender doesn't match customer.
  - Payment in wrong currency: Rejected, customer notified.
  - Payment after contract cancellation: Added to refund queue.
```

### 1.5 Document Verification State Machine

```
States: UPLOADED, AUTO_VALIDATED, PENDING_REVIEW, APPROVED, REJECTED, EXPIRED

Transitions:
  UPLOADED → AUTO_VALIDATED     [Passes format/size/quality checks]
  UPLOADED → REJECTED           [Fails basic validation - wrong format, too small]
  AUTO_VALIDATED → PENDING_REVIEW [Queued for human review]
  AUTO_VALIDATED → APPROVED     [High-confidence OCR + rule match]
  PENDING_REVIEW → APPROVED     [Reviewer approves]
  PENDING_REVIEW → REJECTED     [Reviewer rejects]
  APPROVED → EXPIRED            [Document expiry date reached]
  EXPIRED → UPLOADED            [Customer uploads new version]
  REJECTED → UPLOADED           [Customer re-uploads]

Auto-Validation Rules:
  - File size: 10KB ≤ size ≤ 10MB
  - Format: PDF, JPG, PNG only
  - Image quality: min 300 DPI equivalent
  - OCR confidence: if > 90%, auto-populate fields
  - Expiry check: if document has expiry, must be > 6 months out
  - Duplicate check: hash comparison with existing documents
```

---

## 2. End-to-End Workflow Details

### 2.1 Tasarruf Finance: Complete Customer Journey

```
Timeline: Month 0 to Month N (typically 60-240 months)

Month 0: DISCOVERY
├── Customer visits HelalHesap.com
├── Compares Tasarruf Finance products across 5 institutions
├── Selects "Fuzulev Standart Konut Planı"
├── Fills out interest form → Lead created
├── Lead pushed to Fuzulev's ERP via API
└── Agent assigned within 2 hours

Month 0: ONBOARDING (Days 1-14)
├── Agent contacts customer (Day 1)
├── Qualification call: income, employment, goals (Day 1-2)
├── Customer visits branch OR completes online KYC (Day 3-5)
│   ├── TC Kimlik verification via NVI
│   ├── Income document upload + verification
│   ├── Address verification
│   └── Phone + Email verification
├── Risk assessment: DTI ratio check, internal scoring (Day 5)
├── Plan simulation: 3 scenarios presented (Day 5-7)
│   ├── Scenario A: 120 months, no down payment, 16,720 TL/month
│   ├── Scenario B: 120 months, 20% down payment, 13,933 TL/month
│   └── Scenario C: 180 months, no down payment, 11,147 TL/month
├── Customer selects Scenario B → Offer generated (Day 7)
├── Offer sent via email + SMS (Day 7)
├── Customer reviews, accepts (Day 10)
├── Contract generated with terms (Day 10)
├── E-signature: Customer + Guarantor (father) sign digitally (Day 12)
└── Contract status: ACTIVE (Day 12)

Months 1-36: PAYMENT PHASE (Pre-Allocation)
├── Monthly installment of 13,933 TL collected via auto-debit
├── Customer added to group queue immediately
├── Group formed when 100 members accumulated (e.g., Month 3)
├── First draw (lottery) at Month 6 of group
├── Customer participates in monthly draws
├── Customer portal: tracks payments, group status, draw results
├── Month 12: Customer misses a payment
│   ├── Day 1: SMS reminder
│   ├── Day 3: Email + SMS
│   ├── Day 7: Agent calls, customer promises to pay
│   ├── Day 10: Customer pays overdue + current month
│   └── Customer made ineligible for that month's draw (was late)
├── Month 13-35: All payments on time, merit score climbing
└── Month 36: ALLOCATION (customer wins lottery!)

Month 36: ALLOCATION EVENT
├── Monthly draw held (witnessed by compliance + notary)
├── 78 eligible members in pool, customer randomly selected
├── Allocation amount: 2,000,000 TL
├── Customer notified via SMS, email, agent call
├── Asset search deadline: 6 months (Month 42)
└── Contract status: ACTIVE → ALLOCATED

Months 36-39: ASSET SEARCH & APPRAISAL
├── Customer finds apartment: 3+1, 145m², Kadıköy (Month 37)
├── Submits asset details to institution (Month 37)
├── Institution orders independent appraisal (Month 37)
├── Appraiser visits property (Month 38)
├── Appraisal report: Value = 2,150,000 TL (Month 38)
│   ├── Allocation amount: 2,000,000 TL
│   ├── Customer must cover difference: 150,000 TL (from savings)
│   └── Appraisal APPROVED
├── Insurance obtained: DASK + Housing insurance (Month 38)
├── Seller identity verified, bank details confirmed (Month 38)
└── All delivery checklist items completed (Month 39)

Month 39: DELIVERY
├── Disbursement approved (dual approval: finance officer + manager)
├── 2,000,000 TL transferred to seller's bank account
├── Title deed transfer at Tapu Müdürlüğü
├── Mortgage registered in institution's favor
├── Customer signs acceptance form
├── Contract status: ALLOCATED → DELIVERED
└── Customer now owns the apartment!

Months 40-120: POST-DELIVERY PAYMENTS
├── Monthly installments continue per original schedule
├── Customer pays 13,933 TL/month for remaining 81 months
├── Annual insurance renewal verification
├── Periodic asset revaluation (if required)
├── Month 85: Customer wants early payoff
│   ├── Remaining balance: 466,267 TL (33 installments × 13,933 + fees)
│   ├── Early payoff discount: admin fee waiver = 3,300 TL saved
│   ├── Customer pays 462,967 TL in lump sum
│   ├── All obligations fulfilled
│   └── Proceed to completion
└── Month 85 (instead of 120): EARLY COMPLETION

Month 85: COMPLETION
├── Final payment confirmed
├── All obligations met by both parties
├── Mortgage release initiated at Tapu Müdürlüğü
├── Certificate of completion issued to customer
├── Contract status: DELIVERED → COMPLETED
├── Customer data retained per regulatory requirements (10 years)
└── Customer segment updated to VIP (completed customer)
```

### 2.2 Participation Finance: Complete Customer Journey

```
Month 0: DISCOVERY & APPLICATION
├── Customer needs a vehicle, visits participation bank
├── Customer identifies specific car: Toyota Corolla 2026, 1,200,000 TL
├── Dealership: ABC Otomotiv (approved vendor)
├── Customer applies for financing at the bank
├── KYC + income verification completed
├── Eligibility: approved (DTI ratio 0.35, within limit)
└── Financing offer generated

OFFER:
├── Asset: Toyota Corolla 2026 Hybrid
├── Dealer price: 1,200,000 TL
├── Bank purchase price: 1,200,000 TL (same as dealer)
├── Sale price to customer: 1,380,000 TL (15% profit margin)
├── Down payment: 276,000 TL (20%)
├── Financed amount: 1,104,000 TL
├── Term: 48 months
├── Monthly installment: 23,000 TL
├── Total cost to customer: 1,380,000 TL
├── Disclosed profit: 180,000 TL
└── All fees transparent, no hidden charges

PROCESS:
├── Customer accepts offer → Contract created
├── E-signature completed
├── Bank purchases vehicle from dealer:
│   ├── Purchase order sent to ABC Otomotiv
│   ├── Bank pays 1,200,000 TL to dealer
│   ├── Vehicle registered in bank's name (momentarily)
│   └── This step is critical for Shari'ah compliance
├── Bank sells vehicle to customer at 1,380,000 TL:
│   ├── Sales contract executed
│   ├── Vehicle registration transferred to customer
│   ├── Insurance arranged
│   └── Pledge (rehin) registered for bank
├── Customer takes delivery of vehicle
└── Monthly payments begin

PAYMENT PHASE (Months 1-48):
├── Auto-debit of 23,000 TL/month
├── Month 24: Customer faces financial difficulty
│   ├── Requests restructuring
│   ├── Options presented:
│   │   ├── Option A: Extend term to 60 months (lower monthly)
│   │   ├── Option B: Payment holiday for 3 months (added to end)
│   │   └── Option C: No change (maintain current)
│   ├── Customer selects Option A
│   ├── Restructuring approved by finance committee
│   ├── New schedule: 36 remaining months → 48 remaining months
│   └── New monthly: 23,000 → 18,400 TL (principal redistribution, no additional profit)
├── Months 25-72: Payments continue per restructured schedule
└── Month 72: Final payment → COMPLETED

COMPLETION:
├── All payments received
├── Pledge (rehin) released
├── Vehicle registration updated (no encumbrance)
├── Completion certificate issued
└── Customer relationship continues for future financing needs
```

### 2.3 Delinquency Management Workflow

```
TRIGGER: Installment due date passes without full payment

Day 1: AUTOMATED RESPONSE
├── System marks installment status: PENDING → OVERDUE
├── SMS sent: "Sayın {name}, {amount} TL tutarındaki taksitiniz vadesi geçmiştir."
├── Email sent with payment details and portal link
├── Contract.delinquent_amount updated
└── Contract.delinquent_installments incremented

Day 3: SECOND REMINDER
├── SMS: "Sayın {name}, {amount} TL ödemesi 3 gündür gecikmiştir."
├── Push notification (if mobile app installed)
└── Event: PaymentOverdueEvent emitted

Day 7: AGENT INTERVENTION
├── Agent notified via dashboard alert
├── Agent calls customer
├── Possible outcomes:
│   ├── Customer promises to pay → note recorded, follow-up scheduled
│   ├── Customer in financial difficulty → escalate to restructuring
│   └── Customer unreachable → schedule retry in 2 days
├── Call attempt logged
└── If Tasarruf: customer flagged as ineligible for next draw

Day 15: FORMAL NOTICE
├── System generates İhtar Mektubu (formal warning letter)
├── Letter content:
│   ├── Outstanding amount
│   ├── Days overdue
│   ├── Contractual penalty clause reference
│   ├── Consequences of continued non-payment
│   └── Deadline for payment (15 more days)
├── Sent via registered mail (taahhütlü mektup) + email
├── Letter delivery tracked
└── Penalty calculation begins (if tenant's policy applies)

Day 30: ESCALATION
├── Contract status discussion: potential SUSPENDED
├── Collections team assigned
├── Guarantor contacted:
│   ├── SMS: "Kefil olduğunuz sözleşme kapsamında ödeme gecikmiştir."
│   ├── Formal notice sent to guarantor
│   └── Guarantor given 15 days to cure
├── Customer's other contracts reviewed for cross-default
└── Penalty applied: cezai_sart amount calculated per contract terms

Day 60: SEVERE DELINQUENCY
├── Second formal notice sent
├── Guarantor formal notice sent
├── Customer marked as high-risk in internal scoring
├── If Tasarruf: allocation eligibility permanently affected
│   (until all arrears cleared + 6 months of regular payment)
├── Branch manager and finance team review case
├── Decision: continue collection efforts OR prepare legal
└── All collection efforts documented with timestamps

Day 90: DEFAULT
├── Contract status: ACTIVE → DEFAULTED
├── Legal team notified
├── Decision tree:
│   ├── IF customer has delivered asset (mortgage exists):
│   │   ├── Demand letter sent by lawyer
│   │   ├── If no response in 30 days → court filing
│   │   └── Foreclosure proceedings if judgment obtained
│   ├── IF customer pre-delivery (Tasarruf):
│   │   ├── Contract termination notice sent
│   │   ├── Refund calculated (payments minus penalties minus fees)
│   │   ├── Customer removed from group
│   │   └── Refund processed after legal clearance
│   └── IF guarantor can cover:
│       ├── Guarantor given final notice to pay
│       └── If guarantor pays: contract cured, status → ACTIVE
├── Credit bureau notification (negative record)
└── All documents preserved for litigation

CURE PATH:
├── At any point before legal filing:
│   ├── Customer pays ALL overdue amounts + penalties
│   ├── Contract status: DEFAULTED → ACTIVE
│   ├── Eligibility for draws restored after 6 months of on-time payments
│   ├── Customer's risk score permanently affected
│   └── Guarantor obligations reset
```

### 2.4 Refund Processing Workflow

```
TRIGGER: Contract cancellation approved

Step 1: REFUND CALCULATION
├── Identify all payments made by customer
├── Subtract:
│   ├── Administration fee (per contract terms)
│   ├── Participation fee earned (pro-rata if applicable)
│   ├── Early termination penalty (if applicable)
│   ├── Outstanding penalties/late fees
│   └── Processing costs
├── Calculate net refund amount
├── Generate refund breakdown document
└── Example:
    Total payments made:     167,200 TL (12 months × 13,933.33 TL)
    - Administration fee:      2,500 TL
    - Participation fee (earned): 7,200 TL (12 months × 600 TL)
    - Early termination penalty:  4,800 TL (3% of financed amount)
    - Outstanding late fees:       0 TL
    = Net refund amount:     152,700 TL

Step 2: APPROVAL
├── Refund request created in system
├── Finance officer reviews calculation
├── If amount > single approval limit → dual approval required
├── Compliance review (AML check on refund recipient)
├── Approval chain completed
└── Refund status: PENDING → APPROVED

Step 3: PROCESSING
├── Refund IBAN verified (must match customer's verified account)
├── If IBAN is different → additional verification required
├── Disbursement scheduled for next business day
├── Bank transfer executed
├── Transaction reference recorded
└── Refund status: APPROVED → PROCESSED

Step 4: POST-REFUND
├── Customer notified (SMS + email) with refund details
├── Contract status finalized: CANCELLED
├── Group updated (if Tasarruf): member removed, pool balance adjusted
├── Documents archived
├── Audit trail finalized
└── Refund processing time: 10-15 business days (contractual obligation)

EDGE CASES:
├── Customer deceased:
│   ├── Refund to legal heirs (requires inheritance document - veraset ilamı)
│   └── Additional processing time for legal documentation
├── Customer has multiple contracts:
│   ├── Refund from one cannot be applied to another without consent
│   └── Each contract processed independently
├── Partial cancellation:
│   ├── Not supported — contract is all-or-nothing
│   └── Customer must fully cancel and re-apply if terms change
└── Refund to guarantor:
    ├── Only if customer is unreachable AND guarantor paid on behalf
    └── Requires legal documentation proving guarantor's claim
```

---

## 3. Reconciliation Workflow

```
DAILY BANK RECONCILIATION (runs at 22:00)

Step 1: IMPORT STATEMENTS
├── Fetch bank statements via API (for integrated banks)
├── OR process uploaded CSV/MT940 files (for others)
├── Parse transactions: date, amount, sender, reference, IBAN
├── Store in bank_statement_transactions table
└── Log: "Imported 347 transactions from Kuveyt Türk, 22 March 2026"

Step 2: AUTO-MATCH (Pass 1 - Reference Code)
├── For each transaction:
│   ├── Search reference field for patterns: CTR-YYYY-NNNNN, PAY-YYYY-NNNNN
│   ├── If match found → link to contract/installment
│   ├── Verify amount matches expected installment amount
│   └── If amount matches → APPLIED
├── Result: ~70-80% of transactions matched
└── Log: "Auto-matched 278/347 transactions (80.1%)"

Step 3: AUTO-MATCH (Pass 2 - Fuzzy)
├── For remaining unmatched:
│   ├── Extract sender name → search customers by name
│   ├── Extract IBAN → search contracts by registered IBAN
│   ├── If unique customer match found:
│   │   ├── Get next pending installment for their active contract
│   │   ├── Compare amount (exact or within 1% tolerance)
│   │   └── If match → mark as MATCHED (confidence: HIGH)
│   ├── If multiple possible matches:
│   │   └── Add to manual review queue with suggestions
│   └── If no match:
│       └── Add to UNMATCHED queue
├── Result: ~10-15% additional matches
└── Log: "Fuzzy-matched 45/69 remaining transactions (65.2%)"

Step 4: MANUAL REVIEW QUEUE
├── 24 transactions remain unmatched
├── Operations team reviews each morning:
│   ├── View transaction details + suggested matches
│   ├── Match manually OR mark as:
│   │   ├── UNRELATED (non-customer payment, internal transfer)
│   │   ├── DUPLICATE (same payment recorded twice)
│   │   ├── RETURN (payment to be returned to sender)
│   │   └── HOLD (needs investigation)
├── Target: all resolved within 24 hours
└── Escalation: unresolved items flagged to finance manager after 48 hours

Step 5: RECONCILIATION REPORT
├── Generate daily reconciliation summary:
│   ├── Total transactions: 347
│   ├── Auto-matched: 278 (80.1%)
│   ├── Fuzzy-matched: 45 (13.0%)
│   ├── Manually matched: 20 (5.8%)
│   ├── Unmatched: 4 (1.1%)
│   ├── Total amount: 4,837,450 TL
│   ├── Matched amount: 4,782,100 TL
│   └── Discrepancy: 55,350 TL (under investigation)
├── Report sent to finance team
└── Bank statement status: COMPLETED or PARTIALLY_RECONCILED
```

---

## 4. Group Formation & Draw Workflow

```
GROUP FORMATION (Daily job at 06:00)

FOR each active product with group rules:
  pending = contracts WHERE status = 'ACTIVE' AND group_id IS NULL
  pending = pending.sortBy(signed_date, ASC)

  WHILE pending.count >= product.rules.group_size:
    batch = pending.take(product.rules.group_size)
    pending = pending.skip(product.rules.group_size)

    group = CREATE Group(
      product_id: product.id,
      target_size: product.rules.group_size,
      current_size: batch.count,
      formation_date: TODAY(),
      first_draw_date: TODAY() + product.rules.draw_delay_months,
      draw_frequency: product.rules.draw_frequency,
      status: 'ACTIVE'
    )

    FOR contract IN batch:
      contract.group_id = group.id
      contract.SAVE()

    NOTIFY all members: "Grubunuz oluşturulmuştur. İlk kura tarihi: {first_draw_date}"

DRAW EXECUTION (on scheduled draw dates)

FOR each group WHERE next_draw_date = TODAY() AND status = 'ACTIVE':
  
  // Pre-checks
  IF pool_balance < allocation_target_amount:
    LOG "Insufficient pool balance for group {group.id}"
    NOTIFY operations: "Group {group.reference} draw postponed - insufficient funds"
    group.next_draw_date += 1_month
    CONTINUE

  eligible = getEligibleMembers(group)
  // Eligible = all payments current, not already allocated, documents valid

  IF eligible.count == 0:
    LOG "No eligible members for group {group.id}"
    NOTIFY operations: "Group {group.reference} draw - no eligible members"
    group.next_draw_date += 1_month
    CONTINUE

  // Execute allocations per rules
  allocations_this_draw = product.rules.allocations_per_draw  // e.g., 2
  lottery_count = CEIL(allocations_this_draw * product.rules.lottery_ratio)  // e.g., 1
  merit_count = allocations_this_draw - lottery_count  // e.g., 1

  results = []

  // Lottery allocation(s)
  FOR i IN 1..lottery_count:
    IF pool_balance >= allocation_target:
      winner = secureRandomSelect(eligible)
      allocation = createAllocation(winner, 'LOTTERY', allocation_target)
      eligible.remove(winner)
      pool_balance -= allocation_target
      results.append(allocation)

  // Merit allocation(s)
  FOR i IN 1..merit_count:
    IF pool_balance >= allocation_target AND eligible.count > 0:
      FOR member IN eligible:
        member.merit_score = calculateMerit(member)
      eligible.sortBy(merit_score, DESC)
      winner = eligible[0]
      allocation = createAllocation(winner, 'MERIT', allocation_target)
      eligible.remove(winner)
      pool_balance -= allocation_target
      results.append(allocation)

  // Update group
  group.total_allocations += results.count
  group.pool_balance = pool_balance
  group.last_draw_date = TODAY()
  group.next_draw_date = calculateNextDrawDate(group)

  IF group.remaining_allocations == 0:
    group.status = 'COMPLETED'
  
  group.SAVE()

  // Notify all members of results
  NOTIFY group members: "Kura sonuçları: {results.count} üye tahsisat kazandı."
  FOR winner IN results:
    NOTIFY winner: "Tebrikler! Tahsisat kazandınız. Tutar: {amount} TL. Konut arama süreniz: {deadline}."

MERIT SCORE CALCULATION:

FUNCTION calculateMerit(member):
  // Weight: Payment regularity (40%)
  total_installments = countInstallments(member.contract_id, status IN ('PAID', 'OVERDUE'))
  on_time = countInstallments(member.contract_id, status='PAID', paid_date <= due_date)
  regularity_score = (on_time / total_installments) * 40

  // Weight: Contribution ratio (30%)
  total_paid = sumPayments(member.contract_id)
  total_expected = member.contract.total_cost
  contribution_score = (total_paid / total_expected) * 30

  // Weight: Tenure (20%)
  months_in_group = monthsBetween(member.group_join_date, TODAY())
  max_tenure = maxTenure(group)
  tenure_score = (months_in_group / max_tenure) * 20

  // Weight: Extra payments bonus (10%)
  advance_payments = countAdvancePayments(member.contract_id)
  extra_score = MIN(advance_payments * 2, 10)  // Cap at 10

  RETURN regularity_score + contribution_score + tenure_score + extra_score
  // Range: 0-100
```

---

## 5. Notification Templates

### Template Registry

| Code | Channel | Trigger | Content (Turkish) |
|------|---------|---------|-------------------|
| `LEAD_ASSIGNED` | SMS | Lead assigned to agent | "Yeni müşteri adayınız var: {name}. Lütfen {sla_deadline}'e kadar iletişime geçin." |
| `WELCOME` | SMS+Email | Contract signed | "HelalFinans'a hoş geldiniz! Sözleşmeniz ({ref}) aktif hale gelmiştir. İlk taksit tarihiniz: {date}." |
| `PAYMENT_REMINDER_5D` | SMS | 5 days before due | "Sayın {name}, {amount} TL tutarındaki taksitinizin vadesi {date}'dir." |
| `PAYMENT_REMINDER_1D` | SMS | 1 day before due | "Sayın {name}, yarın {amount} TL tutarında taksit ödemesi bulunmaktadır." |
| `PAYMENT_RECEIVED` | SMS | Payment applied | "Ödemeniz alınmıştır: {amount} TL. Kalan borç: {remaining} TL." |
| `PAYMENT_OVERDUE_1D` | SMS | 1 day overdue | "Sayın {name}, {amount} TL tutarındaki taksitiniz vadesi geçmiştir. Lütfen en kısa sürede ödeyiniz." |
| `PAYMENT_OVERDUE_7D` | SMS+Email | 7 days overdue | Extended message with penalty warning |
| `GROUP_FORMED` | SMS | Group formation | "Grubunuz oluşturulmuştur! Grup no: {group_ref}. İlk kura tarihi: {draw_date}." |
| `LOTTERY_RESULT` | SMS | After draw | "Kura sonuçları açıklanmıştır. Detaylar için müşteri portalını ziyaret ediniz." |
| `ALLOCATION_WON` | SMS+Email+Call | Customer wins allocation | "Tebrikler! {amount} TL tutarında tahsisat kazandınız! Konut arama süreniz: {deadline}." |
| `FORMAL_NOTICE` | Email+Mail | 15 days overdue | Formal İhtar Mektubu with legal language |
| `CONTRACT_COMPLETED` | SMS+Email | All obligations met | "Tebrikler! {ref} numaralı sözleşmeniz başarıyla tamamlanmıştır." |
