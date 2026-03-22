# HelalFinans — Domain Model

> Complete entity definitions, attributes, relationships, and lifecycle states for the interest-free fintech platform.

---

## Entity Relationship Overview

```
                                    ┌──────────┐
                                    │ Campaign │
                                    └────┬─────┘
                                         │ generates
                    ┌────────┐      ┌────▼────┐       ┌────────┐
                    │ Source │──────▶│  Lead   │◀──────│ Agent  │
                    └────────┘      └────┬────┘       └────┬───┘
                                         │ converts to     │ belongs to
                                    ┌────▼─────┐      ┌───▼────┐
                        ┌───────────│ Customer │      │ Branch │
                        │           └────┬─────┘      └────────┘
                        │                │
                   ┌────▼──────┐    ┌────▼──────┐
                   │ Guarantor │    │ Household │
                   └───────────┘    └───────────┘
                                         │
                                    ┌────▼─────┐      ┌─────────┐
                    ┌───────────────│  Offer   │◀─────│ Product │
                    │               └────┬─────┘      └────┬────┘
                    │                    │ accepted         │
               ┌────▼──────┐       ┌────▼──────┐     ┌────▼────┐
               │ Document  │◀──────│ Contract  │◀────│  Plan   │
               └───────────┘       └────┬──────┘     └─────────┘
                                        │
                          ┌─────────────┼──────────────┐
                          │             │              │
                   ┌──────▼─────┐ ┌────▼─────┐  ┌────▼──────┐
                   │Installment │ │  Group   │  │   Asset   │
                   └──────┬─────┘ └────┬─────┘  └────┬──────┘
                          │            │              │
                   ┌──────▼─────┐ ┌────▼─────┐  ┌────▼──────┐
                   │  Payment  │ │Allocation │  │ Collateral│
                   └───────────┘ └────┬──────┘  └───────────┘
                                      │
                                 ┌────▼─────┐
                                 │ Delivery │
                                 └──────────┘
```

---

## 1. Tenant

Represents a financial institution using the platform.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | Unique identifier |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Short code (e.g., "FUZULEV") |
| name | VARCHAR(255) | NOT NULL | Legal entity name |
| trade_name | VARCHAR(255) | | Commercial/brand name |
| tax_id | VARCHAR(11) | UNIQUE | VKN (Vergi Kimlik No) |
| license_type | ENUM | NOT NULL | TASARRUF_FINANCE, PARTICIPATION_BANK, BOTH |
| license_number | VARCHAR(50) | | BDDK license number |
| contact_email | VARCHAR(255) | NOT NULL | Primary contact |
| contact_phone | VARCHAR(20) | NOT NULL | Primary phone |
| address | JSONB | | Structured address object |
| logo_url | VARCHAR(500) | | Brand logo |
| config | JSONB | NOT NULL | Tenant-specific configuration |
| subscription_plan | ENUM | NOT NULL | STARTER, PROFESSIONAL, ENTERPRISE |
| status | ENUM | NOT NULL | ACTIVE, SUSPENDED, CHURNED |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Config JSONB Structure

```json
{
  "timezone": "Europe/Istanbul",
  "currency": "TRY",
  "fiscal_year_start": "01-01",
  "sla_lead_response_hours": 2,
  "sla_document_review_hours": 24,
  "max_agent_authority_amount": 2000000,
  "dual_approval_threshold": 5000000,
  "late_fee_policy": "CHARITY_DONATION",
  "kyc_providers": ["NVI", "KKB"],
  "sms_provider": "NETGSM",
  "email_provider": "SENDGRID",
  "e_signature_provider": "TURKCELL_EIMZA",
  "bank_integrations": ["KUVEYTTURK", "VAKIFKATILIM"]
}
```

---

## 2. Branch

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| code | VARCHAR(20) | UNIQUE per tenant | Branch code (e.g., "IST-KDK-001") |
| name | VARCHAR(255) | NOT NULL | "Kadıköy Branch" |
| type | ENUM | NOT NULL | HEAD_OFFICE, BRANCH, KIOSK, VIRTUAL |
| region | VARCHAR(100) | | Geographic region |
| city | VARCHAR(100) | NOT NULL | |
| district | VARCHAR(100) | | |
| address | JSONB | NOT NULL | Full address |
| phone | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| manager_id | UUID | FK → User | |
| geo_location | POINT | | Lat/Lng for proximity matching |
| operating_hours | JSONB | | Working hours per day |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, TEMPORARILY_CLOSED |
| created_at | TIMESTAMPTZ | NOT NULL | |

### Relationships
- Has many **Users** (agents, staff).
- Has many **Leads** (assigned to this branch).
- Has many **Contracts** (originated from this branch).
- Belongs to one **Tenant**.

---

## 3. User (Agent / Staff)

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| branch_id | UUID | FK → Branch, NULLABLE | NULL for HQ-level users |
| email | VARCHAR(255) | UNIQUE per tenant | Login email |
| phone | VARCHAR(20) | | |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| tc_kimlik | VARCHAR(11) | UNIQUE per tenant | For internal identity |
| role | ENUM | NOT NULL | SALES_AGENT, BRANCH_MANAGER, OPERATIONS, FINANCE, COMPLIANCE, ADMIN |
| specializations | VARCHAR[] | | Product types agent specializes in |
| max_authority_amount | DECIMAL(15,2) | | Max offer amount without approval |
| current_load | INTEGER | DEFAULT 0 | Active leads/tasks count |
| max_load | INTEGER | DEFAULT 50 | Maximum concurrent assignments |
| performance_score | DECIMAL(5,2) | | Calculated conversion rate |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, ON_LEAVE, TERMINATED |
| last_login_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[ACTIVE] ←→ [ON_LEAVE]
   ↓
[INACTIVE]
   ↓
[TERMINATED]
```

---

## 4. Lead

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| external_id | VARCHAR(100) | | Marketplace lead ID |
| reference_code | VARCHAR(20) | UNIQUE | Human-readable (e.g., "L-2026-00451") |
| source | ENUM | NOT NULL | MARKETPLACE, WEBSITE, BRANCH, CALL_CENTER, REFERRAL, SOCIAL_MEDIA, PARTNER |
| source_detail | JSONB | | UTM params, referrer URL, campaign info |
| campaign_id | UUID | FK → Campaign, NULLABLE | |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | NOT NULL | |
| email | VARCHAR(255) | | |
| tc_kimlik_last4 | VARCHAR(4) | | Last 4 digits for dedup |
| city | VARCHAR(100) | | |
| district | VARCHAR(100) | | |
| desired_product_type | ENUM | | TASARRUF_KONUT, TASARRUF_ARAC, PARTICIPATION_KONUT, etc. |
| desired_asset_value | DECIMAL(15,2) | | |
| desired_term_months | INTEGER | | |
| desired_down_payment_pct | DECIMAL(5,2) | | |
| notes | TEXT | | Agent notes |
| stage | ENUM | NOT NULL | NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, WON, LOST, DISQUALIFIED, NO_ANSWER, STALLED |
| priority | ENUM | NOT NULL, DEFAULT 'MEDIUM' | LOW, MEDIUM, HIGH, URGENT |
| assigned_agent_id | UUID | FK → User, NULLABLE | |
| assigned_branch_id | UUID | FK → Branch, NULLABLE | |
| customer_id | UUID | FK → Customer, NULLABLE | Set when lead converts |
| lost_reason | ENUM | NULLABLE | PRICE, COMPETITOR, NOT_READY, NOT_ELIGIBLE, NO_RESPONSE, OTHER |
| lost_reason_detail | TEXT | | Free-text explanation |
| sla_first_contact_at | TIMESTAMPTZ | | When first contact must happen |
| first_contacted_at | TIMESTAMPTZ | | Actual first contact time |
| qualified_at | TIMESTAMPTZ | | |
| won_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
                          ┌──────────────┐
                          │     NEW      │
                          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
             ┌──────▼───┐ ┌─────▼────┐ ┌─────▼──────┐
             │NO_ANSWER │ │CONTACTED │ │DISQUALIFIED│
             └──────────┘ └────┬─────┘ └────────────┘
                               │
                          ┌────▼─────┐
                          │QUALIFIED │
                          └────┬─────┘
                               │
                        ┌──────▼───────┐
                        │PROPOSAL_SENT │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ NEGOTIATION  │──→ [STALLED]
                        └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │                     │
              ┌─────▼──┐           ┌─────▼──┐
              │  WON   │           │  LOST  │
              └────────┘           └────────┘
```

### Business Rules
- A lead with source=MARKETPLACE must have `external_id` populated.
- `sla_first_contact_at` is auto-set to `created_at + tenant.config.sla_lead_response_hours`.
- When stage transitions to WON, `customer_id` must be non-null.
- Leads can transition from NO_ANSWER back to CONTACTED (retry).
- Leads older than 90 days in non-terminal stages are auto-marked STALLED.

---

## 5. Campaign

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| name | VARCHAR(255) | NOT NULL | "Spring 2026 Housing Campaign" |
| code | VARCHAR(50) | UNIQUE per tenant | "SPRING2026" |
| type | ENUM | NOT NULL | DISCOUNT, BONUS, REDUCED_FEE, PROMOTIONAL |
| channel | ENUM | NOT NULL | ALL, MARKETPLACE, BRANCH, DIGITAL |
| product_ids | UUID[] | | Applicable products |
| rules | JSONB | NOT NULL | Campaign-specific rules |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | |
| budget | DECIMAL(15,2) | | Total budget |
| spent | DECIMAL(15,2) | DEFAULT 0 | Spent so far |
| lead_count | INTEGER | DEFAULT 0 | Leads generated |
| conversion_count | INTEGER | DEFAULT 0 | Leads converted |
| status | ENUM | NOT NULL | DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED |
| created_by | UUID | FK → User | |
| created_at | TIMESTAMPTZ | NOT NULL | |

### Rules JSONB Example

```json
{
  "discount_type": "ADMIN_FEE_WAIVER",
  "admin_fee_discount_pct": 100,
  "participation_fee_discount_pct": 0,
  "min_contract_value": 1000000,
  "max_discount_amount": 5000,
  "max_uses": 500,
  "current_uses": 123,
  "eligibility": {
    "new_customers_only": true,
    "min_term_months": 60,
    "product_types": ["TASARRUF_KONUT"]
  }
}
```

---

## 6. Customer

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "C-2026-00234" |
| type | ENUM | NOT NULL | INDIVIDUAL, CORPORATE |
| tc_kimlik | VARCHAR(11) | UNIQUE per tenant | For individuals |
| vkn | VARCHAR(10) | UNIQUE per tenant | For corporates (Vergi Kimlik No) |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| birth_date | DATE | | |
| gender | ENUM | | MALE, FEMALE |
| nationality | VARCHAR(3) | DEFAULT 'TUR' | ISO 3166-1 alpha-3 |
| marital_status | ENUM | | SINGLE, MARRIED, DIVORCED, WIDOWED |
| education_level | ENUM | | PRIMARY, SECONDARY, BACHELOR, MASTER, PHD |
| employment_type | ENUM | | SALARIED, SELF_EMPLOYED, RETIRED, UNEMPLOYED, STUDENT |
| employer_name | VARCHAR(255) | | |
| monthly_income | DECIMAL(15,2) | | |
| annual_income | DECIMAL(15,2) | | |
| income_verified | BOOLEAN | DEFAULT false | |
| phone_primary | VARCHAR(20) | NOT NULL | |
| phone_secondary | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| address_residential | JSONB | | Current address |
| address_work | JSONB | | Work address |
| segment | ENUM | DEFAULT 'STANDARD' | NEW, STANDARD, PREMIUM, VIP, CORPORATE |
| risk_score | DECIMAL(5,2) | | Internal risk score (0-100) |
| findeks_score | INTEGER | | External credit score |
| kyc_status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, IN_PROGRESS, VERIFIED, FAILED, EXPIRED |
| kyc_verified_at | TIMESTAMPTZ | | |
| kyc_expires_at | TIMESTAMPTZ | | |
| aml_status | ENUM | DEFAULT 'CLEAR' | CLEAR, FLAGGED, UNDER_REVIEW, BLOCKED |
| pep_status | BOOLEAN | DEFAULT false | Politically Exposed Person |
| consent_marketing | BOOLEAN | DEFAULT false | KVKK marketing consent |
| consent_data_processing | BOOLEAN | NOT NULL | KVKK data processing consent |
| consent_third_party | BOOLEAN | DEFAULT false | KVKK third-party sharing |
| source_lead_id | UUID | FK → Lead, NULLABLE | Original lead |
| notes | TEXT | | Internal notes |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, BLOCKED, DECEASED |
| version | INTEGER | NOT NULL, DEFAULT 1 | For optimistic locking & versioning |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Address JSONB Structure

```json
{
  "street": "Caferağa Mah. Moda Cad. No:15/3",
  "district": "Kadıköy",
  "city": "İstanbul",
  "postal_code": "34710",
  "country": "TR",
  "verified": true,
  "verified_source": "E_DEVLET",
  "verified_at": "2026-03-20T10:00:00Z"
}
```

### Lifecycle States

```
[ACTIVE] ←→ [INACTIVE]
   ↓
[BLOCKED] (AML flag / court order)
   ↓
[DECEASED]
```

### KYC States

```
[PENDING] → [IN_PROGRESS] → [VERIFIED] → [EXPIRED] → [IN_PROGRESS] (re-verification)
                  ↓
              [FAILED] → [IN_PROGRESS] (retry with new documents)
```

---

## 7. Guarantor

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| customer_id | UUID | FK → Customer | The primary customer |
| contract_id | UUID | FK → Contract | The contract being guaranteed |
| tc_kimlik | VARCHAR(11) | NOT NULL | |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| relationship | ENUM | NOT NULL | SPOUSE, PARENT, SIBLING, RELATIVE, FRIEND, COLLEAGUE, OTHER |
| guarantee_type | ENUM | NOT NULL | JOINT_AND_SEVERAL (müteselsil), LIMITED |
| guarantee_limit | DECIMAL(15,2) | | For LIMITED type only |
| phone | VARCHAR(20) | NOT NULL | |
| email | VARCHAR(255) | | |
| address | JSONB | | |
| monthly_income | DECIMAL(15,2) | | |
| kyc_status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, VERIFIED, FAILED |
| signature_status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, SIGNED, REFUSED |
| signed_at | TIMESTAMPTZ | | |
| status | ENUM | NOT NULL | ACTIVE, RELEASED, DEFAULTED |
| created_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[ACTIVE] → [RELEASED] (when contract completes or guarantor is replaced)
   ↓
[DEFAULTED] (when guarantee is called upon)
```

---

## 8. Household

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| customer_id | UUID | FK → Customer | Head of household |
| member_name | VARCHAR(200) | NOT NULL | |
| relationship | ENUM | NOT NULL | SPOUSE, CHILD, PARENT, SIBLING, OTHER |
| birth_date | DATE | | |
| is_dependent | BOOLEAN | DEFAULT true | Financially dependent |
| monthly_income | DECIMAL(15,2) | | If not dependent |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

Used for calculating household income, expense ratios (DTI), and eligibility.

---

## 9. Product

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| code | VARCHAR(50) | UNIQUE per tenant | "TSF-KONUT-STD" |
| name | VARCHAR(255) | NOT NULL | "Standart Konut Tasarruf Planı" |
| description | TEXT | | Marketing description |
| category | ENUM | NOT NULL | TASARRUF, PARTICIPATION |
| subcategory | ENUM | NOT NULL | KONUT (housing), ARAC (vehicle), ARSA (land), TICARI (commercial) |
| asset_types | ENUM[] | NOT NULL | Allowed asset types |
| rules | JSONB | NOT NULL | Full rule configuration (see below) |
| min_term_months | INTEGER | NOT NULL | |
| max_term_months | INTEGER | NOT NULL | |
| min_asset_value | DECIMAL(15,2) | NOT NULL | |
| max_asset_value | DECIMAL(15,2) | NOT NULL | |
| participation_fee_rate | DECIMAL(8,6) | NOT NULL | e.g., 0.045000 (4.5%) |
| admin_fee | DECIMAL(15,2) | NOT NULL | Flat admin fee |
| is_marketplace_visible | BOOLEAN | DEFAULT true | Show on HelalHesap |
| marketplace_priority | INTEGER | DEFAULT 0 | Sorting weight |
| status | ENUM | NOT NULL | DRAFT, ACTIVE, PAUSED, DISCONTINUED |
| effective_from | DATE | NOT NULL | |
| effective_to | DATE | | NULL = no end date |
| version | INTEGER | NOT NULL, DEFAULT 1 | |
| created_by | UUID | FK → User | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Rules JSONB

```json
{
  "installment_types": ["FIXED", "INCREASING"],
  "escalation_rates": [0.02, 0.03, 0.05],
  "down_payment": {
    "required": false,
    "min_pct": 0.0,
    "max_pct": 0.40
  },
  "group": {
    "size": 100,
    "formation_method": "FIFO",
    "draw_delay_months": 3,
    "draw_frequency": "MONTHLY",
    "allocations_per_draw": 2,
    "allocation_methods": ["LOTTERY", "MERIT"],
    "lottery_ratio": 0.5
  },
  "eligibility": {
    "min_age": 18,
    "max_age": 65,
    "min_income": 10000,
    "max_dti_ratio": 0.50,
    "citizenship": ["TUR"],
    "guarantor_required_above": 2000000
  },
  "fees": {
    "late_payment_penalty_rate": 0.02,
    "early_termination_fee_rate": 0.03,
    "allocation_cancellation_fee": 5000,
    "reallocation_fee": 2500
  },
  "delivery": {
    "asset_search_deadline_months": 6,
    "appraisal_required": true,
    "insurance_required": ["DASK", "HOUSING"],
    "mortgage_required": true
  }
}
```

### Lifecycle States

```
[DRAFT] → [ACTIVE] → [PAUSED] → [ACTIVE]
              ↓
         [DISCONTINUED]
```

---

## 10. Plan

A specific configuration of a Product for a customer's scenario.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| product_id | UUID | FK → Product | |
| customer_id | UUID | FK → Customer, NULLABLE | NULL for simulations |
| offer_id | UUID | FK → Offer, NULLABLE | |
| asset_value | DECIMAL(15,2) | NOT NULL | |
| down_payment | DECIMAL(15,2) | DEFAULT 0 | |
| financed_amount | DECIMAL(15,2) | NOT NULL | asset_value - down_payment |
| term_months | INTEGER | NOT NULL | |
| installment_type | ENUM | NOT NULL | FIXED, INCREASING, BALLOON, FLEXIBLE |
| escalation_rate | DECIMAL(5,4) | | For INCREASING type |
| participation_fee | DECIMAL(15,2) | NOT NULL | Calculated |
| admin_fee | DECIMAL(15,2) | NOT NULL | |
| total_cost | DECIMAL(15,2) | NOT NULL | financed + participation + admin |
| monthly_installment | DECIMAL(15,2) | NOT NULL | First month (or fixed) |
| installment_schedule | JSONB | NOT NULL | Full schedule array |
| campaign_id | UUID | FK → Campaign, NULLABLE | |
| campaign_discount | DECIMAL(15,2) | DEFAULT 0 | |
| is_simulation | BOOLEAN | DEFAULT true | False when attached to offer/contract |
| created_at | TIMESTAMPTZ | NOT NULL | |

### Installment Schedule JSONB

```json
[
  { "no": 1, "due_date": "2026-04-15", "amount": 13954.17, "principal": 13254.17, "fee": 600.00, "admin": 100.00 },
  { "no": 2, "due_date": "2026-05-15", "amount": 13954.17, "principal": 13254.17, "fee": 600.00, "admin": 100.00 }
]
```

---

## 11. Offer

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "OFR-2026-00112" |
| customer_id | UUID | FK → Customer | |
| lead_id | UUID | FK → Lead, NULLABLE | |
| plan_id | UUID | FK → Plan | |
| product_id | UUID | FK → Product | |
| agent_id | UUID | FK → User | Creating agent |
| version | INTEGER | NOT NULL, DEFAULT 1 | Offer version |
| parent_offer_id | UUID | FK → Offer, NULLABLE | Previous version |
| total_amount | DECIMAL(15,2) | NOT NULL | |
| monthly_amount | DECIMAL(15,2) | NOT NULL | |
| terms_summary | JSONB | NOT NULL | Key terms for display |
| valid_until | TIMESTAMPTZ | NOT NULL | Expiry date |
| requires_approval | BOOLEAN | DEFAULT false | |
| approved_by | UUID | FK → User, NULLABLE | |
| approved_at | TIMESTAMPTZ | | |
| sent_at | TIMESTAMPTZ | | When sent to customer |
| sent_via | ENUM | | EMAIL, SMS, PORTAL, IN_PERSON |
| customer_response | ENUM | | PENDING, ACCEPTED, REJECTED, COUNTER_OFFER, EXPIRED |
| customer_responded_at | TIMESTAMPTZ | | |
| rejection_reason | TEXT | | |
| status | ENUM | NOT NULL | DRAFT, PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, REJECTED, EXPIRED, SUPERSEDED |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[DRAFT] → [PENDING_APPROVAL] → [APPROVED] → [SENT] → [ACCEPTED]
                                                  ↓        ↓
                                              [EXPIRED] [REJECTED]
                                                          ↓
                                                    [SUPERSEDED] (new version created)
```

---

## 12. Contract

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "CTR-2026-00234" |
| customer_id | UUID | FK → Customer | |
| offer_id | UUID | FK → Offer | |
| plan_id | UUID | FK → Plan | |
| product_id | UUID | FK → Product | |
| originating_branch_id | UUID | FK → Branch | |
| originating_agent_id | UUID | FK → User | |
| type | ENUM | NOT NULL | TASARRUF, PARTICIPATION |
| asset_type | ENUM | NOT NULL | KONUT, ARAC, ARSA, TICARI |
| asset_value | DECIMAL(15,2) | NOT NULL | |
| financed_amount | DECIMAL(15,2) | NOT NULL | |
| total_cost | DECIMAL(15,2) | NOT NULL | |
| term_months | INTEGER | NOT NULL | |
| monthly_installment | DECIMAL(15,2) | NOT NULL | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | Scheduled completion |
| actual_end_date | DATE | | Actual completion |
| group_id | UUID | FK → Group, NULLABLE | For Tasarruf |
| asset_id | UUID | FK → Asset, NULLABLE | |
| collateral_id | UUID | FK → Collateral, NULLABLE | |
| campaign_id | UUID | FK → Campaign, NULLABLE | |
| total_paid | DECIMAL(15,2) | DEFAULT 0 | Running total |
| total_remaining | DECIMAL(15,2) | | total_cost - total_paid |
| installments_paid | INTEGER | DEFAULT 0 | |
| installments_remaining | INTEGER | | |
| delinquent_amount | DECIMAL(15,2) | DEFAULT 0 | |
| delinquent_installments | INTEGER | DEFAULT 0 | |
| last_payment_date | DATE | | |
| next_due_date | DATE | | |
| next_due_amount | DECIMAL(15,2) | | |
| contract_document_id | UUID | FK → Document, NULLABLE | Signed contract PDF |
| e_signature_id | VARCHAR(100) | | External e-signature reference |
| signed_at | TIMESTAMPTZ | | |
| status | ENUM | NOT NULL | CREATED, PENDING_SIGNATURE, ACTIVE, ALLOCATED, DELIVERED, COMPLETED, DEFAULTED, CANCELLED, SUSPENDED |
| cancellation_reason | TEXT | | |
| cancellation_date | DATE | | |
| version | INTEGER | NOT NULL, DEFAULT 1 | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[CREATED] → [PENDING_SIGNATURE] → [ACTIVE] → [ALLOCATED] → [DELIVERED] → [COMPLETED]
                                      ↓                          ↓
                                  [SUSPENDED]               [DEFAULTED]
                                      ↓                          ↓
                                  [CANCELLED]               [CANCELLED]
```

### Indexes
- `(tenant_id, customer_id)` — find all contracts for a customer.
- `(tenant_id, status)` — filter by status.
- `(tenant_id, group_id)` — find contracts in a group.
- `(tenant_id, next_due_date)` — find upcoming payments.
- `(tenant_id, delinquent_amount)` WHERE `delinquent_amount > 0` — delinquent contracts.

---

## 13. Installment

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| contract_id | UUID | FK → Contract | |
| installment_no | INTEGER | NOT NULL | 1-based sequence |
| due_date | DATE | NOT NULL | |
| principal_amount | DECIMAL(15,2) | NOT NULL | |
| participation_fee | DECIMAL(15,2) | NOT NULL | |
| admin_fee | DECIMAL(15,2) | DEFAULT 0 | |
| total_due | DECIMAL(15,2) | NOT NULL | Sum of above |
| paid_amount | DECIMAL(15,2) | DEFAULT 0 | |
| remaining_amount | DECIMAL(15,2) | | total_due - paid_amount |
| penalty_amount | DECIMAL(15,2) | DEFAULT 0 | Late fee if applicable |
| paid_date | DATE | | Date of final full payment |
| days_overdue | INTEGER | DEFAULT 0 | |
| status | ENUM | NOT NULL | SCHEDULED, PENDING, PAID, PARTIALLY_PAID, OVERDUE, WAIVED, REFUNDED |
| payment_ids | UUID[] | | Linked payment records |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[SCHEDULED] → [PENDING] (due date approaching, ≤5 days) → [PAID]
                                                              ↑
                   [OVERDUE] (due date passed) → [PARTIALLY_PAID] → [PAID]
                        ↓
                   [WAIVED] (management decision)
```

---

## 14. Payment

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(30) | UNIQUE per tenant | "PAY-2026-0000451" |
| contract_id | UUID | FK → Contract, NULLABLE | NULL if unmatched |
| installment_id | UUID | FK → Installment, NULLABLE | NULL if unmatched |
| customer_id | UUID | FK → Customer, NULLABLE | |
| amount | DECIMAL(15,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'TRY' | |
| payment_method | ENUM | NOT NULL | BANK_TRANSFER, DIRECT_DEBIT, CREDIT_CARD, DEBIT_CARD, CASH, BKM_EXPRESS, OTHER |
| payment_channel | ENUM | NOT NULL | BRANCH, PORTAL, MOBILE, AUTO_DEBIT, BANK_API |
| transaction_reference | VARCHAR(100) | | Bank transaction ref |
| sender_name | VARCHAR(255) | | |
| sender_iban | VARCHAR(34) | | |
| received_at | TIMESTAMPTZ | NOT NULL | When payment was received |
| processed_at | TIMESTAMPTZ | | When matched and applied |
| bank_statement_id | UUID | FK → BankStatement, NULLABLE | |
| reconciliation_status | ENUM | NOT NULL | PENDING, MATCHED, UNMATCHED, MANUALLY_MATCHED, DISPUTED |
| type | ENUM | NOT NULL | INSTALLMENT, DOWN_PAYMENT, PENALTY, ADVANCE, REFUND, OTHER |
| status | ENUM | NOT NULL | RECEIVED, PROCESSING, APPLIED, RETURNED, DISPUTED, REFUNDED |
| applied_by | UUID | FK → User, NULLABLE | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[RECEIVED] → [PROCESSING] → [APPLIED]
                  ↓              ↓
             [UNMATCHED]    [DISPUTED]
                  ↓              ↓
          [MANUALLY_MATCHED] [REFUNDED]
                  ↓
             [APPLIED]
```

---

## 15. Group

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "GRP-2026-00015" |
| product_id | UUID | FK → Product | |
| name | VARCHAR(255) | | "Konut Grubu #15" |
| target_size | INTEGER | NOT NULL | From product rules |
| current_size | INTEGER | NOT NULL, DEFAULT 0 | |
| formation_date | DATE | | When group was formed (reached target) |
| first_draw_date | DATE | | |
| last_draw_date | DATE | | |
| next_draw_date | DATE | | |
| draw_frequency | ENUM | NOT NULL | MONTHLY, QUARTERLY |
| total_allocations | INTEGER | DEFAULT 0 | |
| remaining_allocations | INTEGER | | current_size - total_allocations |
| pool_balance | DECIMAL(15,2) | DEFAULT 0 | Current pool balance |
| total_collected | DECIMAL(15,2) | DEFAULT 0 | |
| total_disbursed | DECIMAL(15,2) | DEFAULT 0 | |
| total_refunded | DECIMAL(15,2) | DEFAULT 0 | |
| status | ENUM | NOT NULL | FORMING, ACTIVE, ALLOCATING, SUSPENDED, COMPLETED |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[FORMING] → [ACTIVE] → [ALLOCATING] → [COMPLETED]
                ↓
          [SUSPENDED]
                ↓
          [ACTIVE] or [COMPLETED]
```

---

## 16. Allocation

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "ALC-2026-00089" |
| group_id | UUID | FK → Group | |
| contract_id | UUID | FK → Contract | |
| customer_id | UUID | FK → Customer | |
| method | ENUM | NOT NULL | LOTTERY, MERIT, MANUAL |
| lottery_session_id | UUID | FK → LotterySession, NULLABLE | |
| merit_score | DECIMAL(5,2) | | For merit-based |
| merit_rank | INTEGER | | Rank among eligible members |
| amount | DECIMAL(15,2) | NOT NULL | Allocation amount |
| allocated_at | TIMESTAMPTZ | NOT NULL | |
| asset_search_deadline | DATE | NOT NULL | |
| asset_id | UUID | FK → Asset, NULLABLE | |
| appraisal_status | ENUM | | PENDING, APPROVED, REJECTED |
| appraisal_value | DECIMAL(15,2) | | |
| disbursement_id | UUID | FK → Disbursement, NULLABLE | |
| disbursed_at | TIMESTAMPTZ | | |
| delivery_id | UUID | FK → Delivery, NULLABLE | |
| status | ENUM | NOT NULL | PENDING_ASSET_SELECTION, ASSET_SELECTED, APPRAISAL_IN_PROGRESS, APPRAISAL_APPROVED, APPRAISAL_REJECTED, DISBURSEMENT_PENDING, DISBURSED, DELIVERED, REVOKED, CANCELLED |
| revocation_reason | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[PENDING_ASSET_SELECTION]
    ↓
[ASSET_SELECTED] → [APPRAISAL_IN_PROGRESS] → [APPRAISAL_APPROVED] → [DISBURSEMENT_PENDING] → [DISBURSED] → [DELIVERED]
                                                    ↓
                                              [APPRAISAL_REJECTED] → [PENDING_ASSET_SELECTION] (retry)
    ↓ (deadline passed)
[REVOKED]
```

---

## 17. Lottery Session

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| group_id | UUID | FK → Group | |
| draw_date | DATE | NOT NULL | |
| draw_number | INTEGER | NOT NULL | Sequential per group |
| eligible_member_count | INTEGER | NOT NULL | |
| eligible_member_ids | UUID[] | NOT NULL | Snapshot of eligible members |
| method | ENUM | NOT NULL | RANDOM_DRAW, WEIGHTED_RANDOM |
| random_seed | VARCHAR(64) | | For auditability |
| winner_contract_id | UUID | FK → Contract, NULLABLE | |
| allocation_id | UUID | FK → Allocation, NULLABLE | |
| witnessed_by | UUID[] | | Compliance officers present |
| notary_present | BOOLEAN | DEFAULT false | |
| video_recording_url | VARCHAR(500) | | If recorded |
| status | ENUM | NOT NULL | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_ELIGIBLE_MEMBERS, INSUFFICIENT_FUNDS |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## 18. Asset

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| contract_id | UUID | FK → Contract | |
| type | ENUM | NOT NULL | REAL_ESTATE, VEHICLE, LAND, COMMERCIAL_PROPERTY |
| subtype | ENUM | | APARTMENT, DETACHED_HOUSE, VILLA, CAR, SUV, TRUCK, etc. |
| description | TEXT | | |
| address | JSONB | | For real estate |
| registration_no | VARCHAR(100) | | Tapu no / Plaka no |
| vendor_id | UUID | FK → Vendor, NULLABLE | |
| purchase_price | DECIMAL(15,2) | | Institution's purchase price |
| appraisal_value | DECIMAL(15,2) | | Independent appraisal |
| sale_price | DECIMAL(15,2) | | Sale price to customer (for participation) |
| profit_margin | DECIMAL(8,6) | | For participation finance |
| ownership_status | ENUM | NOT NULL | VENDOR_OWNED, INSTITUTION_OWNED, CUSTOMER_OWNED |
| title_deed_no | VARCHAR(50) | | Tapu no |
| title_transfer_date | DATE | | |
| insurance_policies | JSONB | | Array of policy details |
| details | JSONB | | Asset-specific details (m², rooms, year, etc.) |
| status | ENUM | NOT NULL | IDENTIFIED, APPRAISING, APPROVED, PURCHASED, TRANSFERRED, DELIVERED |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Details JSONB (Real Estate Example)

```json
{
  "area_sqm": 145,
  "rooms": "3+1",
  "floor": 5,
  "total_floors": 10,
  "building_age": 3,
  "has_elevator": true,
  "has_parking": true,
  "heating_type": "CENTRAL_GAS",
  "ada_no": "1234",
  "parsel_no": "56",
  "site_name": "Moda Residence"
}
```

---

## 19. Vendor

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| name | VARCHAR(255) | NOT NULL | |
| type | ENUM | NOT NULL | CONSTRUCTION_COMPANY, DEALERSHIP, INDIVIDUAL, REAL_ESTATE_AGENT |
| tax_id | VARCHAR(11) | | VKN or TCKN |
| contact_person | VARCHAR(255) | | |
| phone | VARCHAR(20) | | |
| email | VARCHAR(255) | | |
| address | JSONB | | |
| bank_accounts | JSONB | | Array of bank account details |
| kyb_status | ENUM | NOT NULL | PENDING, VERIFIED, REJECTED |
| performance_score | DECIMAL(5,2) | | |
| total_transactions | INTEGER | DEFAULT 0 | |
| total_volume | DECIMAL(15,2) | DEFAULT 0 | |
| is_blacklisted | BOOLEAN | DEFAULT false | |
| blacklist_reason | TEXT | | |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, BLACKLISTED |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## 20. Collateral

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| contract_id | UUID | FK → Contract | |
| asset_id | UUID | FK → Asset | |
| type | ENUM | NOT NULL | MORTGAGE (ipotek), PLEDGE (rehin), GUARANTEE (kefalet) |
| registration_no | VARCHAR(100) | | |
| registration_date | DATE | | |
| registration_authority | VARCHAR(255) | | Tapu Müdürlüğü, etc. |
| collateral_value | DECIMAL(15,2) | NOT NULL | |
| ltv_ratio | DECIMAL(5,4) | | Loan-to-Value |
| last_valuation_date | DATE | | |
| next_valuation_date | DATE | | |
| insurance_coverage | DECIMAL(15,2) | | |
| release_conditions | TEXT | | |
| released_at | DATE | | |
| released_by | UUID | FK → User, NULLABLE | |
| status | ENUM | NOT NULL | PENDING_REGISTRATION, REGISTERED, ACTIVE, RELEASED, FORECLOSED |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[PENDING_REGISTRATION] → [REGISTERED] → [ACTIVE] → [RELEASED]
                                            ↓
                                       [FORECLOSED]
```

---

## 21. Delivery

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| contract_id | UUID | FK → Contract | |
| allocation_id | UUID | FK → Allocation, NULLABLE | For Tasarruf |
| asset_id | UUID | FK → Asset | |
| customer_id | UUID | FK → Customer | |
| delivery_type | ENUM | NOT NULL | TASARRUF_ALLOCATION, PARTICIPATION_PURCHASE, DIRECT |
| scheduled_date | DATE | | |
| actual_date | DATE | | |
| title_transfer_date | DATE | | |
| mortgage_registration_date | DATE | | |
| insurance_verification_date | DATE | | |
| disbursement_amount | DECIMAL(15,2) | | |
| disbursement_date | DATE | | |
| disbursement_to | VARCHAR(255) | | Vendor/seller name |
| disbursement_iban | VARCHAR(34) | | |
| checklist | JSONB | NOT NULL | Delivery checklist items |
| completed_by | UUID | FK → User | |
| status | ENUM | NOT NULL | INITIATED, DOCUMENTS_PENDING, DOCUMENTS_COMPLETE, DISBURSEMENT_APPROVED, DISBURSED, TITLE_TRANSFERRED, COMPLETED, FAILED |
| failure_reason | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

### Checklist JSONB

```json
[
  { "item": "Title deed copy", "required": true, "status": "DONE", "completed_at": "2026-03-20" },
  { "item": "DASK policy", "required": true, "status": "DONE", "completed_at": "2026-03-20" },
  { "item": "Housing insurance", "required": true, "status": "PENDING", "completed_at": null },
  { "item": "Mortgage registration", "required": true, "status": "PENDING", "completed_at": null },
  { "item": "Appraisal report", "required": true, "status": "DONE", "completed_at": "2026-03-18" },
  { "item": "Customer acceptance form", "required": true, "status": "PENDING", "completed_at": null }
]
```

---

## 22. Document

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| entity_type | ENUM | NOT NULL | CUSTOMER, CONTRACT, GUARANTOR, ASSET, ALLOCATION, DELIVERY |
| entity_id | UUID | NOT NULL | FK to the relevant entity |
| category | ENUM | NOT NULL | IDENTITY, ADDRESS, INCOME, ASSET, CONTRACT, INSURANCE, COMPLIANCE, OTHER |
| type | VARCHAR(100) | NOT NULL | "TC_KIMLIK_COPY", "PAYSLIP", "TITLE_DEED", etc. |
| file_name | VARCHAR(500) | NOT NULL | Original filename |
| file_path | VARCHAR(1000) | NOT NULL | S3/Minio path |
| file_size_bytes | BIGINT | NOT NULL | |
| mime_type | VARCHAR(100) | NOT NULL | |
| file_hash | VARCHAR(64) | NOT NULL | SHA-256 hash for integrity |
| ocr_extracted_data | JSONB | | Extracted text/fields |
| ocr_confidence | DECIMAL(5,2) | | 0-100 |
| expiry_date | DATE | | For identity docs, insurance |
| uploaded_by | UUID | FK → User | |
| uploaded_at | TIMESTAMPTZ | NOT NULL | |
| reviewed_by | UUID | FK → User, NULLABLE | |
| reviewed_at | TIMESTAMPTZ | | |
| review_notes | TEXT | | |
| verification_status | ENUM | NOT NULL | UPLOADED, AUTO_VALIDATED, PENDING_REVIEW, APPROVED, REJECTED, EXPIRED |
| rejection_reason | TEXT | | |
| is_deleted | BOOLEAN | DEFAULT false | Soft delete |
| deleted_by | UUID | FK → User, NULLABLE | |
| deleted_at | TIMESTAMPTZ | | |
| deletion_reason | TEXT | | |
| version | INTEGER | DEFAULT 1 | |
| created_at | TIMESTAMPTZ | NOT NULL | |

### Lifecycle States

```
[UPLOADED] → [AUTO_VALIDATED] → [PENDING_REVIEW] → [APPROVED]
                   ↓                                     ↓
              [REJECTED] ←──────────────────────── [EXPIRED]
                   ↓
         [UPLOADED] (re-upload)
```

---

## 23. Disbursement

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| reference_code | VARCHAR(20) | UNIQUE per tenant | "DSB-2026-00034" |
| contract_id | UUID | FK → Contract | |
| allocation_id | UUID | FK → Allocation, NULLABLE | |
| delivery_id | UUID | FK → Delivery | |
| vendor_id | UUID | FK → Vendor, NULLABLE | |
| amount | DECIMAL(15,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'TRY' | |
| recipient_name | VARCHAR(255) | NOT NULL | |
| recipient_iban | VARCHAR(34) | NOT NULL | |
| recipient_bank | VARCHAR(255) | | |
| scheduled_date | DATE | NOT NULL | |
| executed_date | DATE | | |
| bank_reference | VARCHAR(100) | | |
| approved_by | UUID[] | | Approval chain |
| approval_status | ENUM | NOT NULL | PENDING, PARTIALLY_APPROVED, FULLY_APPROVED, REJECTED |
| status | ENUM | NOT NULL | DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, EXECUTED, FAILED, REVERSED |
| failure_reason | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

---

## 24. Notification

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| recipient_type | ENUM | NOT NULL | CUSTOMER, USER |
| recipient_id | UUID | NOT NULL | |
| channel | ENUM | NOT NULL | SMS, EMAIL, PUSH, IN_APP |
| template_code | VARCHAR(100) | NOT NULL | "PAYMENT_REMINDER_3DAY" |
| subject | VARCHAR(500) | | For email |
| body | TEXT | NOT NULL | Rendered content |
| metadata | JSONB | | Template variables used |
| scheduled_at | TIMESTAMPTZ | | |
| sent_at | TIMESTAMPTZ | | |
| delivered_at | TIMESTAMPTZ | | |
| read_at | TIMESTAMPTZ | | |
| status | ENUM | NOT NULL | QUEUED, SENDING, SENT, DELIVERED, FAILED, BOUNCED |
| failure_reason | TEXT | | |
| provider_reference | VARCHAR(100) | | SMS/Email provider ID |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## 25. Audit Event

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | NOT NULL | |
| event_id | VARCHAR(50) | UNIQUE | "EVT-2026-03-22-00000451" |
| timestamp | TIMESTAMPTZ | NOT NULL | |
| actor_type | ENUM | NOT NULL | USER, SYSTEM, API, CUSTOMER |
| actor_id | UUID | | |
| actor_role | VARCHAR(50) | | |
| actor_ip | INET | | |
| session_id | VARCHAR(100) | | |
| action | VARCHAR(100) | NOT NULL | "CONTRACT_STATUS_CHANGE" |
| resource_type | VARCHAR(50) | NOT NULL | "CONTRACT" |
| resource_id | UUID | NOT NULL | |
| details | JSONB | NOT NULL | Action-specific data |
| previous_state | JSONB | | Snapshot before change |
| new_state | JSONB | | Snapshot after change |
| previous_hash | VARCHAR(64) | | Chain integrity |
| current_hash | VARCHAR(64) | NOT NULL | |

**Storage**: Append-only table. No UPDATE or DELETE operations allowed. Partitioned by month for performance.

---

## 26. Bank Statement

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → Tenant | |
| bank_name | VARCHAR(100) | NOT NULL | |
| account_iban | VARCHAR(34) | NOT NULL | |
| statement_date | DATE | NOT NULL | |
| opening_balance | DECIMAL(15,2) | NOT NULL | |
| closing_balance | DECIMAL(15,2) | NOT NULL | |
| total_credits | DECIMAL(15,2) | | |
| total_debits | DECIMAL(15,2) | | |
| transaction_count | INTEGER | | |
| file_id | UUID | FK → Document, NULLABLE | |
| import_method | ENUM | NOT NULL | API, FILE_UPLOAD, MANUAL |
| reconciliation_status | ENUM | NOT NULL | PENDING, IN_PROGRESS, COMPLETED, PARTIALLY_RECONCILED |
| reconciled_by | UUID | FK → User, NULLABLE | |
| reconciled_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## Key Relationship Summary

| From | To | Cardinality | Description |
|------|-----|-------------|-------------|
| Tenant | Branch | 1:N | A tenant has many branches |
| Tenant | User | 1:N | A tenant has many users |
| Tenant | Product | 1:N | A tenant has many products |
| Branch | User | 1:N | A branch has many agents |
| Lead | Customer | 1:0..1 | A lead may convert to a customer |
| Lead | Campaign | N:0..1 | A lead may come from a campaign |
| Customer | Contract | 1:N | A customer may have multiple contracts |
| Customer | Guarantor | 1:N | A customer may have guarantors |
| Customer | Household | 1:N | A customer has household members |
| Product | Plan | 1:N | A product has many plan instances |
| Customer | Offer | 1:N | A customer may receive multiple offers |
| Offer | Contract | 1:0..1 | An accepted offer becomes a contract |
| Contract | Installment | 1:N | A contract has many installments |
| Contract | Payment | 1:N | A contract receives many payments |
| Contract | Group | N:0..1 | A contract belongs to one group (Tasarruf) |
| Group | Allocation | 1:N | A group has many allocations |
| Contract | Asset | 1:0..1 | A contract may have an asset |
| Contract | Collateral | 1:0..1 | A contract may have collateral |
| Allocation | Delivery | 1:0..1 | An allocation leads to a delivery |
| Contract | Document | 1:N | A contract has many documents |
| Customer | Document | 1:N | A customer has many documents |
| Delivery | Disbursement | 1:1 | A delivery has one disbursement |
