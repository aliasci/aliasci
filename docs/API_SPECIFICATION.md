# HelalFinans — API Specification

> RESTful API design for the interest-free fintech platform.

---

## API Conventions

### Base URL

```
https://api.helalfinans.com/v1/{tenant_code}/
```

- Multi-tenant: tenant resolved via URL path segment or `X-Tenant-ID` header.
- Versioned: `/v1/`, `/v2/` etc.
- All responses are JSON.
- All timestamps are ISO 8601 in UTC.
- All monetary values are in minor units (kuruş) as integers, or decimal strings to avoid floating point issues.

### Authentication

```
Authorization: Bearer <JWT_TOKEN>

JWT payload:
{
  "sub": "USR-0032",
  "tenant_id": "TNT-FUZULEV",
  "role": "SALES_AGENT",
  "branch_id": "BRN-IST-KDK-001",
  "permissions": ["lead:read", "lead:write", "customer:read", ...],
  "exp": 1711200000
}
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-03-22T14:30:00Z"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Desired asset value exceeds maximum for this product.",
    "details": [
      {
        "field": "desired_asset_value",
        "rule": "max",
        "limit": 10000000,
        "actual": 12000000
      }
    ]
  },
  "meta": {
    "request_id": "req_abc124",
    "timestamp": "2026-03-22T14:30:01Z"
  }
}
```

### Pagination

```
GET /v1/fuzulev/leads?page=2&per_page=25&sort=-created_at

Response meta:
{
  "pagination": {
    "page": 2,
    "per_page": 25,
    "total_items": 1847,
    "total_pages": 74
  }
}
```

### Filtering

```
GET /v1/fuzulev/leads?stage=QUALIFIED&source=MARKETPLACE&created_after=2026-01-01
GET /v1/fuzulev/contracts?status=ACTIVE&delinquent=true&min_value=1000000
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Request body/params validation failed |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | State conflict (e.g., lead already converted) |
| 422 | BUSINESS_RULE_VIOLATION | Business rule check failed |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Endpoint Reference

### 1. Lead Management

#### Create Lead

```
POST /v1/{tenant}/leads
```

**Request Body:**
```json
{
  "source": "MARKETPLACE",
  "external_id": "HH-2026-00451",
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "phone": "+905551234567",
  "email": "ahmet@example.com",
  "tc_kimlik_last4": "7890",
  "city": "İstanbul",
  "district": "Kadıköy",
  "desired_product_type": "TASARRUF_KONUT",
  "desired_asset_value": 2000000,
  "desired_term_months": 120,
  "desired_down_payment_pct": 20,
  "campaign_code": "SPRING2026",
  "source_detail": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "konut_tasarruf_2026",
    "referrer_url": "https://helalhesap.com/karsilastir/konut"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "reference_code": "L-2026-00451",
    "stage": "NEW",
    "priority": "HIGH",
    "assigned_agent_id": "660e8400-e29b-41d4-a716-446655440001",
    "assigned_branch_id": "770e8400-e29b-41d4-a716-446655440002",
    "sla_first_contact_at": "2026-03-22T16:30:00Z",
    "created_at": "2026-03-22T14:30:00Z"
  }
}
```

**Permissions:** `lead:write`

#### List Leads

```
GET /v1/{tenant}/leads?stage=NEW,CONTACTED&source=MARKETPLACE&assigned_agent_id=me&sort=-priority,-created_at&page=1&per_page=25
```

**Permissions:** `lead:read` (filtered by role — agents see only their own, managers see branch)

#### Get Lead

```
GET /v1/{tenant}/leads/{lead_id}
```

#### Update Lead Stage

```
PATCH /v1/{tenant}/leads/{lead_id}/stage
```

**Request Body:**
```json
{
  "stage": "CONTACTED",
  "notes": "Spoke with customer, interested in 3+1 apartment in Kadıköy area."
}
```

**Business Rules:**
- Only valid stage transitions are allowed (see state machine).
- If transitioning to WON, `customer_id` must be provided.
- If transitioning to LOST, `lost_reason` must be provided.

#### Assign Lead

```
POST /v1/{tenant}/leads/{lead_id}/assign
```

**Request Body:**
```json
{
  "agent_id": "660e8400-e29b-41d4-a716-446655440001",
  "reason": "Product specialization match"
}
```

**Permissions:** `lead:assign` (branch managers and above)

#### Convert Lead to Customer

```
POST /v1/{tenant}/leads/{lead_id}/convert
```

**Request Body:**
```json
{
  "tc_kimlik": "12345678901",
  "birth_date": "1990-05-15",
  "gender": "MALE",
  "employment_type": "SALARIED",
  "monthly_income": 35000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "customer_id": "880e8400-e29b-41d4-a716-446655440003",
    "customer_reference": "C-2026-00234",
    "kyc_status": "PENDING",
    "lead_stage": "WON"
  }
}
```

---

### 2. Customer Management

#### Create Customer

```
POST /v1/{tenant}/customers
```

**Request Body:**
```json
{
  "type": "INDIVIDUAL",
  "tc_kimlik": "12345678901",
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "birth_date": "1990-05-15",
  "gender": "MALE",
  "phone_primary": "+905551234567",
  "email": "ahmet@example.com",
  "nationality": "TUR",
  "marital_status": "MARRIED",
  "employment_type": "SALARIED",
  "employer_name": "ABC Teknoloji A.Ş.",
  "monthly_income": 35000,
  "address_residential": {
    "street": "Caferağa Mah. Moda Cad. No:15/3",
    "district": "Kadıköy",
    "city": "İstanbul",
    "postal_code": "34710",
    "country": "TR"
  },
  "consent_data_processing": true,
  "consent_marketing": false,
  "source_lead_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Permissions:** `customer:write`

#### Get Customer

```
GET /v1/{tenant}/customers/{customer_id}
```

**Response includes:** Full customer profile, KYC status, linked contracts summary, household members.

#### Update Customer

```
PATCH /v1/{tenant}/customers/{customer_id}
```

Partial update. Creates a new version in the audit trail.

#### List Customer Contracts

```
GET /v1/{tenant}/customers/{customer_id}/contracts
```

#### Initiate KYC

```
POST /v1/{tenant}/customers/{customer_id}/kyc/initiate
```

**Request Body:**
```json
{
  "checks": ["NVI_IDENTITY", "ADDRESS_VERIFICATION", "PHONE_OTP"],
  "priority": "NORMAL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kyc_session_id": "KYC-2026-00567",
    "checks": [
      { "type": "NVI_IDENTITY", "status": "PENDING" },
      { "type": "ADDRESS_VERIFICATION", "status": "PENDING" },
      { "type": "PHONE_OTP", "status": "PENDING", "otp_sent_to": "+90555***4567" }
    ]
  }
}
```

#### Add Guarantor

```
POST /v1/{tenant}/customers/{customer_id}/guarantors
```

**Request Body:**
```json
{
  "contract_id": "990e8400-e29b-41d4-a716-446655440004",
  "tc_kimlik": "98765432109",
  "first_name": "Mehmet",
  "last_name": "Yılmaz",
  "relationship": "PARENT",
  "guarantee_type": "JOINT_AND_SEVERAL",
  "phone": "+905559876543",
  "monthly_income": 45000
}
```

---

### 3. Product & Plan Engine

#### List Products

```
GET /v1/{tenant}/products?category=TASARRUF&subcategory=KONUT&status=ACTIVE
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "code": "TSF-KONUT-STD",
      "name": "Standart Konut Tasarruf Planı",
      "category": "TASARRUF",
      "subcategory": "KONUT",
      "min_term_months": 60,
      "max_term_months": 240,
      "min_asset_value": 500000,
      "max_asset_value": 10000000,
      "participation_fee_rate": 0.045,
      "admin_fee": 2500,
      "installment_types": ["FIXED", "INCREASING"],
      "status": "ACTIVE"
    }
  ]
}
```

#### Generate Plan (Simulation)

```
POST /v1/{tenant}/plans/simulate
```

**Request Body:**
```json
{
  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "asset_value": 2000000,
  "down_payment": 400000,
  "term_months": 120,
  "installment_type": "FIXED",
  "campaign_code": "SPRING2026"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "is_simulation": true,
    "summary": {
      "asset_value": 2000000,
      "down_payment": 400000,
      "financed_amount": 1600000,
      "participation_fee": 72000,
      "admin_fee": 2500,
      "campaign_discount": 2500,
      "total_cost": 1672000,
      "monthly_installment": 13933.33,
      "effective_cost_rate": 0.045
    },
    "eligibility": {
      "eligible": true,
      "min_required_income": 27866.67,
      "dti_ratio_at_income": null,
      "guarantor_required": false,
      "warnings": []
    },
    "estimated_allocation": {
      "best_case_months": 24,
      "average_months": 40,
      "worst_case_months": 72
    },
    "installment_schedule": [
      { "no": 1, "due_date": "2026-04-15", "amount": 13933.33, "principal": 13333.33, "fee": 600.00, "cumulative": 13933.33 },
      { "no": 2, "due_date": "2026-05-15", "amount": 13933.33, "principal": 13333.33, "fee": 600.00, "cumulative": 27866.67 }
    ],
    "valid_until": "2026-03-29T14:30:00Z"
  }
}
```

#### Compare Plans

```
POST /v1/{tenant}/plans/compare
```

**Request Body:**
```json
{
  "scenarios": [
    { "product_id": "...", "asset_value": 2000000, "down_payment": 400000, "term_months": 120, "installment_type": "FIXED" },
    { "product_id": "...", "asset_value": 2000000, "down_payment": 400000, "term_months": 120, "installment_type": "INCREASING", "escalation_rate": 0.03 },
    { "product_id": "...", "asset_value": 2000000, "down_payment": 0, "term_months": 180, "installment_type": "FIXED" }
  ]
}
```

**Response:** Array of plan simulations side-by-side.

---

### 4. Offer Management

#### Create Offer

```
POST /v1/{tenant}/offers
```

**Request Body:**
```json
{
  "customer_id": "880e8400-e29b-41d4-a716-446655440003",
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "plan_id": "bb0e8400-e29b-41d4-a716-446655440006",
  "valid_days": 7,
  "notes": "Customer prefers Kadıköy area, 3+1 apartment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "reference_code": "OFR-2026-00112",
    "status": "DRAFT",
    "requires_approval": false,
    "valid_until": "2026-03-29T14:30:00Z"
  }
}
```

#### Submit Offer for Approval

```
POST /v1/{tenant}/offers/{offer_id}/submit
```

Transitions status: DRAFT → PENDING_APPROVAL (if requires_approval) or DRAFT → APPROVED.

#### Approve / Reject Offer

```
POST /v1/{tenant}/offers/{offer_id}/approve
POST /v1/{tenant}/offers/{offer_id}/reject
```

**Permissions:** `offer:approve` (branch managers)

#### Send Offer to Customer

```
POST /v1/{tenant}/offers/{offer_id}/send
```

**Request Body:**
```json
{
  "channels": ["EMAIL", "SMS"],
  "message": "Dear Ahmet Bey, please review our offer for your housing plan."
}
```

#### Record Customer Response

```
POST /v1/{tenant}/offers/{offer_id}/respond
```

**Request Body:**
```json
{
  "response": "ACCEPTED"
}
```

Or for rejection/counter-offer:
```json
{
  "response": "COUNTER_OFFER",
  "requested_changes": {
    "desired_term_months": 144,
    "desired_down_payment_pct": 25,
    "notes": "Customer wants longer term and higher down payment to reduce monthly."
  }
}
```

---

### 5. Contract Management

#### Create Contract

```
POST /v1/{tenant}/contracts
```

**Request Body:**
```json
{
  "offer_id": "cc0e8400-e29b-41d4-a716-446655440007",
  "start_date": "2026-04-01",
  "payment_day": 15,
  "auto_debit": true,
  "auto_debit_iban": "TR330006100519786457841326"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "reference_code": "CTR-2026-00234",
    "status": "CREATED",
    "document_checklist": [
      { "type": "TC_KIMLIK_COPY", "status": "COLLECTED" },
      { "type": "INCOME_PROOF", "status": "COLLECTED" },
      { "type": "ADDRESS_PROOF", "status": "MISSING" },
      { "type": "GUARANTOR_ID", "status": "MISSING" }
    ],
    "next_step": "Collect remaining documents, then initiate e-signature"
  }
}
```

#### Get Contract

```
GET /v1/{tenant}/contracts/{contract_id}
```

Full contract details including installment schedule, payment summary, status history.

#### Initiate E-Signature

```
POST /v1/{tenant}/contracts/{contract_id}/sign/initiate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signing_session_id": "SGN-2026-00123",
    "signing_url": "https://sign.helalfinans.com/session/SGN-2026-00123",
    "signers": [
      { "role": "CUSTOMER", "name": "Ahmet Yılmaz", "status": "PENDING", "sms_sent": true },
      { "role": "GUARANTOR", "name": "Mehmet Yılmaz", "status": "PENDING", "sms_sent": true }
    ],
    "expires_at": "2026-03-25T14:30:00Z"
  }
}
```

#### Update Contract Status

```
PATCH /v1/{tenant}/contracts/{contract_id}/status
```

**Request Body:**
```json
{
  "status": "ACTIVE",
  "reason": "All signatures collected, contract now in force."
}
```

**Business Rules:**
- Only valid transitions allowed.
- Moving to CANCELLED requires `cancellation_reason`.
- Moving to DEFAULTED triggers notification to guarantors.

#### Get Contract Installment Schedule

```
GET /v1/{tenant}/contracts/{contract_id}/installments
```

#### Get Contract Payment History

```
GET /v1/{tenant}/contracts/{contract_id}/payments
```

---

### 6. Payment & Collection

#### Record Payment

```
POST /v1/{tenant}/payments
```

**Request Body:**
```json
{
  "contract_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "installment_id": "ee0e8400-e29b-41d4-a716-446655440009",
  "amount": 13933.33,
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "PORTAL",
  "transaction_reference": "EFT-2026-0000451",
  "received_at": "2026-04-14T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "ff0e8400-e29b-41d4-a716-446655440010",
    "reference_code": "PAY-2026-0000451",
    "status": "APPLIED",
    "installment_status": "PAID",
    "contract_summary": {
      "total_paid": 13933.33,
      "total_remaining": 1658066.67,
      "installments_paid": 1,
      "installments_remaining": 119,
      "next_due_date": "2026-05-15",
      "next_due_amount": 13933.33
    }
  }
}
```

#### Process Refund

```
POST /v1/{tenant}/payments/{payment_id}/refund
```

**Request Body:**
```json
{
  "amount": 13933.33,
  "reason": "CONTRACT_CANCELLATION",
  "refund_to_iban": "TR330006100519786457841326",
  "notes": "Customer requested cancellation before first allocation."
}
```

**Permissions:** `payment:refund` (finance team)

#### Get Overdue Installments

```
GET /v1/{tenant}/installments?status=OVERDUE&sort=days_overdue&per_page=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "installment_id": "...",
      "contract_id": "...",
      "contract_reference": "CTR-2026-00234",
      "customer_name": "Ahmet Yılmaz",
      "installment_no": 3,
      "due_date": "2026-06-15",
      "total_due": 13933.33,
      "paid_amount": 0,
      "remaining": 13933.33,
      "days_overdue": 7,
      "assigned_agent": "USR-0032",
      "last_contact_attempt": "2026-06-18T09:00:00Z"
    }
  ]
}
```

#### Import Bank Statement

```
POST /v1/{tenant}/bank-statements/import
Content-Type: multipart/form-data

bank_name=KUVEYTTURK
account_iban=TR330006100519786457841326
file=@statement_2026_03.csv
```

#### Run Reconciliation

```
POST /v1/{tenant}/bank-statements/{statement_id}/reconcile
```

Triggers automated matching of bank transactions to installments.

---

### 7. Group & Allocation (Tasarruf)

#### List Groups

```
GET /v1/{tenant}/groups?product_id={id}&status=ACTIVE
```

#### Get Group Details

```
GET /v1/{tenant}/groups/{group_id}
```

Includes: member list, pool balance, allocation history, upcoming draw date.

#### Get Group Pool Ledger

```
GET /v1/{tenant}/groups/{group_id}/pool?from=2026-01-01&to=2026-03-31
```

#### Get Eligible Members for Allocation

```
GET /v1/{tenant}/groups/{group_id}/eligible-members
```

**Response:**
```json
{
  "success": true,
  "data": {
    "group_id": "...",
    "next_draw_date": "2026-04-01",
    "pool_available_balance": 11000000,
    "next_allocation_amount": 2000000,
    "can_allocate": true,
    "eligible_members": [
      {
        "contract_id": "...",
        "customer_name": "Ali Demir",
        "payments_on_time_pct": 100,
        "total_contributed": 167200,
        "tenure_months": 12,
        "merit_score": 92.5,
        "merit_rank": 1
      }
    ],
    "ineligible_members": [
      {
        "contract_id": "...",
        "customer_name": "Veli Kaya",
        "ineligibility_reason": "OVERDUE_PAYMENT",
        "details": "2 installments overdue (total: 27,866 TL)"
      }
    ]
  }
}
```

#### Run Lottery

```
POST /v1/{tenant}/groups/{group_id}/lottery
```

**Request Body:**
```json
{
  "draw_date": "2026-04-01",
  "witnessed_by": ["USR-COMPLIANCE-001", "USR-COMPLIANCE-002"],
  "notary_present": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lottery_session_id": "...",
    "draw_number": 8,
    "eligible_count": 78,
    "winner": {
      "contract_id": "...",
      "customer_name": "Fatma Özkan",
      "allocation_id": "ALC-2026-00089",
      "allocation_amount": 2000000,
      "asset_search_deadline": "2026-10-01"
    },
    "random_seed": "sha256:abc123...",
    "audit_hash": "sha256:def456..."
  }
}
```

**Permissions:** `allocation:execute` (operations + compliance must both be present)

#### Run Merit Allocation

```
POST /v1/{tenant}/groups/{group_id}/merit-allocation
```

#### Get Allocation Details

```
GET /v1/{tenant}/allocations/{allocation_id}
```

#### Update Allocation (Asset Selection)

```
PATCH /v1/{tenant}/allocations/{allocation_id}
```

**Request Body:**
```json
{
  "asset": {
    "type": "REAL_ESTATE",
    "subtype": "APARTMENT",
    "description": "3+1, 145m², Kadıköy",
    "address": { "city": "İstanbul", "district": "Kadıköy", "street": "..." },
    "vendor_id": "VND-0045",
    "requested_price": 2100000
  }
}
```

#### Approve Appraisal

```
POST /v1/{tenant}/allocations/{allocation_id}/appraisal/approve
```

**Request Body:**
```json
{
  "appraisal_value": 2150000,
  "appraisal_report_document_id": "DOC-...",
  "appraiser_name": "XYZ Gayrimenkul Değerleme A.Ş.",
  "notes": "Asset meets all criteria."
}
```

#### Initiate Disbursement

```
POST /v1/{tenant}/allocations/{allocation_id}/disburse
```

---

### 8. Document Management

#### Upload Document

```
POST /v1/{tenant}/documents
Content-Type: multipart/form-data

entity_type=CUSTOMER
entity_id=880e8400-e29b-41d4-a716-446655440003
category=IDENTITY
type=TC_KIMLIK_COPY
file=@kimlik.pdf
expiry_date=2031-05-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "DOC-2026-00567",
    "file_name": "kimlik.pdf",
    "file_size_bytes": 245000,
    "mime_type": "application/pdf",
    "file_hash": "sha256:abc123...",
    "verification_status": "UPLOADED",
    "ocr_status": "PROCESSING"
  }
}
```

#### Get Document

```
GET /v1/{tenant}/documents/{document_id}
```

#### Download Document

```
GET /v1/{tenant}/documents/{document_id}/download
```

Returns a signed URL (valid for 5 minutes) or streams the file.

#### Review Document

```
POST /v1/{tenant}/documents/{document_id}/review
```

**Request Body:**
```json
{
  "action": "APPROVE",
  "notes": "Identity document verified against NVI records."
}
```

Or for rejection:
```json
{
  "action": "REJECT",
  "reason": "Document is blurry and unreadable. Please re-upload a clear copy."
}
```

#### List Documents for Entity

```
GET /v1/{tenant}/documents?entity_type=CUSTOMER&entity_id={customer_id}&category=IDENTITY
```

---

### 9. Marketplace API (HelalHesap ↔ ERP)

These endpoints are exposed for marketplace integration. They use API key authentication instead of JWT.

#### Push Lead from Marketplace

```
POST /v1/{tenant}/marketplace/leads
X-API-Key: mk_live_abc123...

Request Body:
{
  "marketplace_lead_id": "HH-2026-00451",
  "source_platform": "HELALHESAP",
  "customer": {
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "phone": "+905551234567",
    "email": "ahmet@example.com",
    "city": "İstanbul",
    "district": "Kadıköy"
  },
  "interest": {
    "product_code": "TSF-KONUT-STD",
    "asset_type": "KONUT",
    "asset_value": 2000000,
    "desired_term_months": 120,
    "down_payment_pct": 20
  },
  "tracking": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "session_id": "sess_xyz789",
    "comparison_id": "cmp_456"
  },
  "consent": {
    "data_processing": true,
    "marketing": false,
    "timestamp": "2026-03-22T14:25:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead_id": "L-2026-00451",
    "status": "ACCEPTED",
    "assigned_branch": "Kadıköy Şubesi",
    "estimated_contact_within_hours": 2
  }
}
```

#### Get Lead Status (Marketplace Polling)

```
GET /v1/{tenant}/marketplace/leads/{marketplace_lead_id}/status
X-API-Key: mk_live_abc123...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "marketplace_lead_id": "HH-2026-00451",
    "erp_lead_id": "L-2026-00451",
    "current_stage": "QUALIFIED",
    "first_contact_at": "2026-03-22T15:10:00Z",
    "sla_met": true,
    "conversion_status": "IN_PROGRESS"
  }
}
```

#### List Products for Marketplace

```
GET /v1/{tenant}/marketplace/products?asset_type=KONUT
X-API-Key: mk_live_abc123...
```

Returns publicly shareable product information for comparison engine.

#### Webhook Configuration

```
POST /v1/{tenant}/marketplace/webhooks
```

**Request Body:**
```json
{
  "events": ["lead.stage_changed", "lead.converted", "lead.lost"],
  "url": "https://helalhesap.com/webhooks/erp-updates",
  "secret": "whsec_abc123..."
}
```

Marketplace receives real-time updates on lead progress for their analytics.

---

### 10. Reporting & Analytics

#### Get Dashboard Metrics

```
GET /v1/{tenant}/analytics/dashboard?period=LAST_30_DAYS
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-02-20", "to": "2026-03-22" },
    "leads": {
      "total": 450,
      "by_source": { "MARKETPLACE": 280, "BRANCH": 100, "WEBSITE": 50, "REFERRAL": 20 },
      "conversion_rate": 0.156,
      "avg_response_time_hours": 1.8,
      "sla_compliance_rate": 0.92
    },
    "contracts": {
      "new": 42,
      "total_value": 84000000,
      "avg_value": 2000000,
      "by_product": { "TSF-KONUT-STD": 30, "TSF-KONUT-ART": 8, "TSF-ARAC-STD": 4 }
    },
    "collections": {
      "due_amount": 12500000,
      "collected_amount": 11875000,
      "collection_rate": 0.95,
      "delinquent_30_plus": 45,
      "delinquent_60_plus": 12,
      "delinquent_90_plus": 3
    },
    "allocations": {
      "this_period": 8,
      "total_disbursed": 16000000,
      "avg_allocation_to_delivery_days": 75
    }
  }
}
```

#### Generate Report

```
POST /v1/{tenant}/reports/generate
```

**Request Body:**
```json
{
  "report_type": "COLLECTION_SUMMARY",
  "period": { "from": "2026-01-01", "to": "2026-03-31" },
  "group_by": "BRANCH",
  "format": "PDF",
  "delivery": "EMAIL",
  "recipients": ["finance@fuzulev.com"]
}
```

#### Get Audit Trail

```
GET /v1/{tenant}/audit-events?resource_type=CONTRACT&resource_id={id}&from=2026-01-01&to=2026-03-31&per_page=100
```

**Permissions:** `audit:read` (compliance officers and admin only)

---

### 11. Notification Management

#### Send Notification

```
POST /v1/{tenant}/notifications
```

**Request Body:**
```json
{
  "recipient_type": "CUSTOMER",
  "recipient_id": "880e8400-e29b-41d4-a716-446655440003",
  "channel": "SMS",
  "template_code": "PAYMENT_REMINDER_3DAY",
  "variables": {
    "customer_name": "Ahmet Bey",
    "amount": "13,933.33 TL",
    "due_date": "15 Nisan 2026",
    "contract_reference": "CTR-2026-00234"
  },
  "scheduled_at": "2026-04-12T09:00:00Z"
}
```

#### List Notification Templates

```
GET /v1/{tenant}/notification-templates
```

---

### 12. System Administration

#### List Users

```
GET /v1/{tenant}/users?role=SALES_AGENT&branch_id={id}&status=ACTIVE
```

#### Create User

```
POST /v1/{tenant}/users
```

#### Update User Role / Permissions

```
PATCH /v1/{tenant}/users/{user_id}
```

#### Get System Health

```
GET /v1/system/health
```

**Response:**
```json
{
  "status": "HEALTHY",
  "services": {
    "database": "UP",
    "cache": "UP",
    "message_broker": "UP",
    "storage": "UP",
    "sms_provider": "UP",
    "email_provider": "UP",
    "e_signature_provider": "UP"
  },
  "metrics": {
    "uptime_seconds": 2592000,
    "active_connections": 145,
    "queue_depth": 23,
    "avg_response_time_ms": 85
  }
}
```

---

## Rate Limiting

| Endpoint Category | Rate Limit | Window |
|-------------------|-----------|--------|
| Public (marketplace) | 100 req | Per minute |
| Authenticated (read) | 1000 req | Per minute |
| Authenticated (write) | 200 req | Per minute |
| Bulk operations | 10 req | Per minute |
| File uploads | 50 req | Per hour |
| Report generation | 20 req | Per hour |

Rate limit headers included in every response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1711200060
```

---

## Webhook Events

Events that can be subscribed to:

| Event | Payload Summary |
|-------|----------------|
| `lead.created` | Lead ID, source, product interest |
| `lead.stage_changed` | Lead ID, from_stage, to_stage |
| `lead.converted` | Lead ID, customer ID |
| `customer.kyc_completed` | Customer ID, KYC status |
| `offer.sent` | Offer ID, customer ID |
| `offer.responded` | Offer ID, response type |
| `contract.created` | Contract ID, value, product |
| `contract.signed` | Contract ID, signed_at |
| `contract.status_changed` | Contract ID, from_status, to_status |
| `payment.received` | Payment ID, amount, contract ID |
| `payment.overdue` | Installment ID, days_overdue |
| `allocation.completed` | Allocation ID, winner, method |
| `delivery.completed` | Delivery ID, contract ID |
| `document.uploaded` | Document ID, entity |
| `document.reviewed` | Document ID, status |
