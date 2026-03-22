# HelalFinans — Technical Architecture

> Infrastructure, stack decisions, database design, multi-tenancy, and scaling strategy.

---

## 1. Technology Stack

### 1.1 Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js 20 LTS (or Bun) | High concurrency, large ecosystem, team availability in Turkey |
| **Framework** | NestJS | Enterprise-grade structure, dependency injection, modular architecture, built-in support for guards/interceptors/pipes |
| **Language** | TypeScript (strict mode) | Type safety critical for financial calculations |
| **ORM** | Prisma | Type-safe database access, excellent migration tooling, multi-schema support |
| **Validation** | Zod + class-validator | Runtime validation for API inputs |
| **Authentication** | Passport.js + JWT + OAuth2 | Standards-based auth |
| **Authorization** | CASL | Attribute-based access control (ABAC), flexible permission definitions |
| **API Documentation** | Swagger / OpenAPI 3.1 | Auto-generated from decorators |
| **Task Queue** | BullMQ (Redis-backed) | Background jobs: notifications, reconciliation, report generation |
| **Event Bus** | EventEmitter2 (internal) + RabbitMQ (cross-service) | Domain events for audit logging, notifications |

### 1.2 Frontend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 19 + Next.js 15 | SSR for marketplace SEO, SPA for ERP portal |
| **Language** | TypeScript | Consistency with backend |
| **State Management** | TanStack Query + Zustand | Server state (TanStack Query) + client state (Zustand) |
| **UI Components** | shadcn/ui + Tailwind CSS 4 | Consistent design system, rapid development |
| **Forms** | React Hook Form + Zod | Performant forms with schema validation |
| **Tables** | TanStack Table | Complex data grids for contract lists, payment tables |
| **Charts** | Recharts or Tremor | Dashboard visualizations |
| **PDF Generation** | react-pdf (client) + Puppeteer (server) | Contract documents, reports |
| **Mobile** | PWA (Progressive Web App) | Customer portal, agent mobile access |

### 1.3 Infrastructure

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Database** | PostgreSQL 16 | ACID compliance essential for financial data, JSONB for flexible schemas, partitioning for audit logs |
| **Cache** | Redis 7 | Session cache, rate limiting, BullMQ backing, frequently accessed configs |
| **Object Storage** | AWS S3 / MinIO (self-hosted) | Document storage, report files |
| **Message Broker** | RabbitMQ | Reliable message delivery for cross-module events |
| **Search** | PostgreSQL full-text search (initially) → Elasticsearch (at scale) | Customer/contract search |
| **Monitoring** | Prometheus + Grafana | Metrics, alerting |
| **Logging** | Pino (structured JSON) → Loki or ELK | Centralized log aggregation |
| **Tracing** | OpenTelemetry + Jaeger | Distributed tracing for debugging |
| **CI/CD** | GitHub Actions | Automated testing, deployment |
| **Container** | Docker + Docker Compose (dev) → Kubernetes (prod) | Containerized deployment |
| **Cloud** | AWS (primary) or Hetzner Cloud (cost-sensitive) | Turkey region availability (AWS me-central-1 or eu-south-2) |
| **CDN** | CloudFront or Cloudflare | Static asset delivery, DDoS protection |
| **DNS** | Cloudflare | DNS management, WAF |
| **SSL** | Let's Encrypt (auto-renewed) | TLS for all endpoints |
| **Secrets** | AWS Secrets Manager or HashiCorp Vault | Credential management |

---

## 2. Database Design

### 2.1 Multi-Tenant Schema Strategy

```
PostgreSQL Cluster
├── Database: helalfinans
│   ├── Schema: public          (shared: tenant registry, system config)
│   ├── Schema: tenant_fuzulev  (Fuzulev's data)
│   ├── Schema: tenant_eminevim (Eminevim's data)
│   ├── Schema: tenant_katilimevim (Katılımevim's data)
│   └── Schema: audit           (shared audit log, partitioned by month)
```

**How it works:**
1. API Gateway resolves tenant from subdomain/header.
2. NestJS middleware sets `search_path` to the tenant's schema for the duration of the request.
3. All Prisma queries automatically target the correct schema.
4. Cross-tenant queries (admin dashboards, system reports) explicitly reference `public` schema.

**Migration strategy:**
- Shared migrations run on all tenant schemas.
- Tenant-specific config stored in JSONB columns (no schema divergence).
- Schema creation automated when a new tenant is onboarded.

### 2.2 Key Tables and Indexes

```sql
-- Tenant Schema: tenant_fuzulev

-- Contracts table with strategic indexes
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(20) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    asset_value DECIMAL(15,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    next_due_date DATE,
    delinquent_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT contracts_reference_unique UNIQUE (reference_code)
);

CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_next_due ON contracts(next_due_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_contracts_delinquent ON contracts(delinquent_amount) WHERE delinquent_amount > 0;
CREATE INDEX idx_contracts_group ON contracts(group_id) WHERE group_id IS NOT NULL;

-- Installments table: most queried table
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    installment_no INTEGER NOT NULL,
    due_date DATE NOT NULL,
    total_due DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT installments_contract_no_unique UNIQUE (contract_id, installment_no)
);

CREATE INDEX idx_installments_due ON installments(due_date, status);
CREATE INDEX idx_installments_overdue ON installments(due_date)
    WHERE status IN ('PENDING', 'PARTIALLY_PAID') AND due_date < CURRENT_DATE;

-- Audit events: partitioned by month, append-only
CREATE TABLE audit.events (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_type VARCHAR(20) NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    current_hash VARCHAR(64) NOT NULL,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Auto-create monthly partitions
CREATE TABLE audit.events_2026_01 PARTITION OF audit.events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit.events_2026_02 PARTITION OF audit.events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... automated via pg_partman or cron job

CREATE INDEX idx_audit_resource ON audit.events(tenant_id, resource_type, resource_id);
CREATE INDEX idx_audit_actor ON audit.events(tenant_id, actor_id, timestamp);
CREATE INDEX idx_audit_action ON audit.events(tenant_id, action, timestamp);
```

### 2.3 Financial Calculation Safety

All monetary values are stored as `DECIMAL(15,2)` — never `FLOAT` or `DOUBLE`. In application code:

```typescript
import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

function calculateInstallment(
  financedAmount: Decimal,
  participationFeeRate: Decimal,
  adminFee: Decimal,
  termMonths: number
): Decimal {
  const totalParticipationFee = financedAmount.mul(participationFeeRate);
  const totalCost = financedAmount.add(totalParticipationFee).add(adminFee);
  const monthlyInstallment = totalCost.div(termMonths).toDecimalPlaces(2);
  return monthlyInstallment;
}
```

---

## 3. Application Architecture

### 3.1 Modular Monolith (Initial Architecture)

```
src/
├── main.ts
├── app.module.ts
├── common/                        # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   │   └── tenant.middleware.ts   # Resolves tenant, sets DB schema
│   ├── pipes/
│   └── utils/
│       ├── decimal.util.ts
│       └── reference-code.util.ts
├── config/
│   └── configuration.ts
├── modules/
│   ├── auth/                      # Authentication & authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── api-key.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── tenant/                    # Tenant management
│   │   ├── tenant.module.ts
│   │   ├── tenant.service.ts
│   │   └── tenant.resolver.ts
│   ├── crm/                       # CRM & Lead Management
│   │   ├── crm.module.ts
│   │   ├── controllers/
│   │   │   └── lead.controller.ts
│   │   ├── services/
│   │   │   ├── lead.service.ts
│   │   │   └── lead-assignment.service.ts
│   │   ├── entities/
│   │   │   └── lead.entity.ts
│   │   └── events/
│   │       ├── lead-created.event.ts
│   │       └── lead-stage-changed.event.ts
│   ├── customer/                  # Customer & KYC
│   │   ├── customer.module.ts
│   │   ├── controllers/
│   │   │   ├── customer.controller.ts
│   │   │   └── guarantor.controller.ts
│   │   ├── services/
│   │   │   ├── customer.service.ts
│   │   │   ├── kyc.service.ts
│   │   │   └── guarantor.service.ts
│   │   └── integrations/
│   │       ├── nvi.integration.ts
│   │       └── kkb.integration.ts
│   ├── product/                   # Product & Plan Engine
│   │   ├── product.module.ts
│   │   ├── controllers/
│   │   │   ├── product.controller.ts
│   │   │   └── plan.controller.ts
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   ├── plan.service.ts
│   │   │   └── simulation.engine.ts
│   │   └── rules/
│   │       └── plan-rule.engine.ts
│   ├── offer/                     # Offer Management
│   │   ├── offer.module.ts
│   │   ├── offer.controller.ts
│   │   └── offer.service.ts
│   ├── contract/                  # Contract Management
│   │   ├── contract.module.ts
│   │   ├── controllers/
│   │   │   └── contract.controller.ts
│   │   ├── services/
│   │   │   ├── contract.service.ts
│   │   │   ├── contract-lifecycle.service.ts
│   │   │   └── e-signature.service.ts
│   │   └── state-machine/
│   │       └── contract.state-machine.ts
│   ├── payment/                   # Payment & Collection
│   │   ├── payment.module.ts
│   │   ├── controllers/
│   │   │   ├── payment.controller.ts
│   │   │   └── installment.controller.ts
│   │   ├── services/
│   │   │   ├── payment.service.ts
│   │   │   ├── installment.service.ts
│   │   │   ├── reconciliation.service.ts
│   │   │   └── delinquency.service.ts
│   │   └── jobs/
│   │       ├── overdue-check.job.ts
│   │       ├── reconciliation.job.ts
│   │       └── payment-reminder.job.ts
│   ├── group/                     # Tasarruf Group Management
│   │   ├── group.module.ts
│   │   ├── controllers/
│   │   │   ├── group.controller.ts
│   │   │   └── allocation.controller.ts
│   │   ├── services/
│   │   │   ├── group.service.ts
│   │   │   ├── pool.service.ts
│   │   │   ├── allocation.service.ts
│   │   │   ├── lottery.service.ts
│   │   │   ├── merit.service.ts
│   │   │   └── liquidity.service.ts
│   │   └── state-machine/
│   │       └── allocation.state-machine.ts
│   ├── asset/                     # Asset & Delivery
│   │   ├── asset.module.ts
│   │   ├── controllers/
│   │   │   ├── asset.controller.ts
│   │   │   ├── delivery.controller.ts
│   │   │   └── vendor.controller.ts
│   │   ├── services/
│   │   │   ├── asset.service.ts
│   │   │   ├── delivery.service.ts
│   │   │   ├── disbursement.service.ts
│   │   │   └── vendor.service.ts
│   │   └── state-machine/
│   │       └── delivery.state-machine.ts
│   ├── document/                  # Document Management
│   │   ├── document.module.ts
│   │   ├── document.controller.ts
│   │   ├── services/
│   │   │   ├── document.service.ts
│   │   │   ├── ocr.service.ts
│   │   │   └── storage.service.ts
│   │   └── integrations/
│   │       └── s3.integration.ts
│   ├── notification/              # Notifications
│   │   ├── notification.module.ts
│   │   ├── notification.service.ts
│   │   ├── channels/
│   │   │   ├── sms.channel.ts
│   │   │   ├── email.channel.ts
│   │   │   └── push.channel.ts
│   │   └── templates/
│   │       └── template.service.ts
│   ├── audit/                     # Audit & Compliance
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts
│   │   ├── audit.interceptor.ts   # Auto-logs controller actions
│   │   └── audit.subscriber.ts   # Listens to domain events
│   ├── marketplace/               # Marketplace Integration
│   │   ├── marketplace.module.ts
│   │   ├── marketplace.controller.ts
│   │   ├── services/
│   │   │   ├── comparison.service.ts
│   │   │   ├── matching.service.ts
│   │   │   └── partner.service.ts
│   │   └── webhooks/
│   │       └── webhook.service.ts
│   └── reporting/                 # Reports & Analytics
│       ├── reporting.module.ts
│       ├── reporting.controller.ts
│       ├── services/
│       │   ├── dashboard.service.ts
│       │   ├── report-generator.service.ts
│       │   └── metrics.service.ts
│       └── queries/
│           ├── lead-metrics.query.ts
│           ├── collection-metrics.query.ts
│           └── portfolio-metrics.query.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── test/
    ├── e2e/
    └── unit/
```

### 3.2 Event-Driven Communication

Internal domain events drive cross-module communication:

```typescript
// Event definitions
class LeadCreatedEvent {
  constructor(
    public readonly leadId: string,
    public readonly tenantId: string,
    public readonly source: string,
    public readonly timestamp: Date,
  ) {}
}

class ContractStatusChangedEvent {
  constructor(
    public readonly contractId: string,
    public readonly tenantId: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly changedBy: string,
    public readonly timestamp: Date,
  ) {}
}

class PaymentReceivedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly contractId: string,
    public readonly tenantId: string,
    public readonly amount: string,
    public readonly timestamp: Date,
  ) {}
}
```

**Event Subscribers:**

| Event | Subscribers |
|-------|-----------|
| `LeadCreatedEvent` | AuditService, NotificationService (SMS to agent), MetricsService |
| `LeadStageChangedEvent` | AuditService, WebhookService (marketplace callback) |
| `CustomerCreatedEvent` | AuditService, KYCService (auto-initiate) |
| `ContractSignedEvent` | AuditService, InstallmentService (generate schedule), GroupService (add to queue), NotificationService (welcome SMS) |
| `PaymentReceivedEvent` | AuditService, InstallmentService (update status), PoolService (update balance), MetricsService |
| `PaymentOverdueEvent` | AuditService, NotificationService (reminder SMS), DelinquencyService |
| `AllocationCompletedEvent` | AuditService, NotificationService (winner SMS), ContractService (update status), DeliveryService (initiate) |

### 3.3 Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `OverdueCheckJob` | Every hour | Scans installments past due date, updates status, triggers reminders |
| `PaymentReminderJob` | Daily at 09:00 | Sends reminders for installments due in 3 days, 1 day |
| `ReconciliationJob` | Daily at 22:00 | Processes bank statements, auto-matches payments |
| `GroupFormationJob` | Daily at 06:00 | Checks if any product has enough pending contracts to form a group |
| `SLAMonitorJob` | Every 30 min | Checks for SLA breaches (lead response time, document review time) |
| `KYCExpiryJob` | Daily at 07:00 | Flags customers with expiring KYC documents |
| `ReportGenerationJob` | Configurable | Generates and delivers scheduled reports |
| `LiquidityProjectionJob` | Weekly | Projects pool liquidity for next 12 months per group |
| `AuditPartitionJob` | Monthly | Creates next month's audit log partition |

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
Client → API Gateway → JWT Validation → Tenant Resolution → Role Check → Controller
                                              ↓
                                   Set PostgreSQL search_path
                                   to tenant schema
```

**Token Refresh:**
- Access token: 15-minute expiry.
- Refresh token: 7-day expiry, stored in httpOnly cookie.
- Token rotation: each refresh invalidates the old refresh token.

### 4.2 Authorization Model (CASL)

```typescript
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

function defineAbilitiesFor(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  switch (user.role) {
    case 'SALES_AGENT':
      can('read', 'Lead', { assigned_agent_id: user.id });
      can('update', 'Lead', { assigned_agent_id: user.id });
      can('create', 'Lead');
      can('read', 'Customer', { assigned_agent_id: user.id });
      can('create', 'Customer');
      can('create', 'Offer', { amount: { $lte: user.max_authority_amount } });
      can('read', 'Contract', { originating_agent_id: user.id });
      cannot('delete', 'all');
      break;

    case 'BRANCH_MANAGER':
      can('manage', 'Lead', { assigned_branch_id: user.branch_id });
      can('manage', 'Customer');
      can('approve', 'Offer');
      can('read', 'Contract', { originating_branch_id: user.branch_id });
      can('assign', 'Lead');
      break;

    case 'COMPLIANCE':
      can('read', 'all');
      can('read', 'AuditEvent');
      can('manage', 'KYC');
      can('block', 'Customer');
      cannot('create', 'Contract');
      cannot('create', 'Payment');
      break;

    case 'ADMIN':
      can('manage', 'all');
      break;
  }

  return build();
}
```

### 4.3 Data Encryption

| Data | At Rest | In Transit |
|------|---------|-----------|
| Database | AES-256 (PostgreSQL TDE or volume encryption) | TLS 1.3 |
| Documents (S3) | AES-256 server-side encryption | TLS 1.3 |
| TC Kimlik | Application-level encryption (AES-256-GCM) | TLS 1.3 |
| Passwords | bcrypt (cost factor 12) | TLS 1.3 |
| API Keys | SHA-256 hash stored, prefix visible | TLS 1.3 |
| Audit Logs | Immutable + hash chain integrity | TLS 1.3 |

### 4.4 API Security

- **Rate limiting**: Per-tenant, per-endpoint limits.
- **Input validation**: Zod schemas for every endpoint.
- **SQL injection**: Prevented by Prisma parameterized queries.
- **XSS**: React auto-escaping + CSP headers.
- **CSRF**: SameSite cookies + CSRF tokens for state-changing operations.
- **CORS**: Whitelist per-tenant allowed origins.
- **Request size limit**: 10MB (configurable for file uploads).
- **Helmet.js**: Security headers (HSTS, X-Frame-Options, etc.).

---

## 5. Scaling Strategy

### 5.1 Phase 1: Single Instance (MVP, 1-3 tenants)

```
                  ┌─────────────┐
                  │   Nginx     │
                  │   (Reverse  │
                  │    Proxy)   │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │   NestJS    │
                  │   App       │
                  │   (1 inst.) │
                  └──────┬──────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
        ┌─────▼───┐ ┌───▼───┐ ┌───▼───┐
        │Postgres │ │ Redis │ │  S3   │
        │ (1 inst)│ │(1 ins)│ │       │
        └─────────┘ └───────┘ └───────┘
```

### 5.2 Phase 2: Horizontal Scale (5-15 tenants)

```
                  ┌──────────────┐
                  │  CloudFront  │
                  │  / CDN       │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │  ALB / Nginx │
                  │  (Load Bal.) │
                  └──────┬───────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
        ┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐
        │ NestJS  │ │ NestJS │ │ NestJS │
        │ App #1  │ │ App #2 │ │ App #3 │
        └────┬────┘ └───┬────┘ └───┬────┘
             │          │          │
        ┌────▼──────────▼──────────▼────┐
        │         Redis Cluster         │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │    PostgreSQL (Primary)       │
        │    + Read Replicas (2x)       │
        └───────────────────────────────┘
```

### 5.3 Phase 3: Microservices (15+ tenants, 50K+ users)

```
                  ┌─────────────────┐
                  │   API Gateway   │
                  │   (Kong / AWS   │
                  │    API Gateway) │
                  └────────┬────────┘
                           │
     ┌─────────────┬───────┼───────┬──────────────┐
     │             │       │       │              │
┌────▼────┐  ┌────▼────┐ ┌▼─────┐ ┌▼─────┐  ┌───▼─────┐
│ CRM     │  │Customer │ │Contra│ │Payme │  │ Group & │
│ Service │  │Service  │ │ct    │ │nt    │  │Allocat. │
│         │  │         │ │Svc   │ │Svc   │  │ Service │
└────┬────┘  └────┬────┘ └──┬───┘ └──┬───┘  └────┬────┘
     │            │         │        │            │
     └────────────┴─────────┴────────┴────────────┘
                            │
                     ┌──────▼──────┐
                     │  RabbitMQ   │
                     │  (Events)   │
                     └──────┬──────┘
                            │
              ┌─────────────┼──────────────┐
              │             │              │
        ┌─────▼───┐  ┌─────▼───┐  ┌──────▼──────┐
        │Notific. │  │ Audit   │  │  Reporting  │
        │Service  │  │ Service │  │  Service    │
        └─────────┘  └─────────┘  └─────────────┘
```

### 5.4 Database Scaling Strategy

| Load Level | Strategy |
|------------|----------|
| < 1M records | Single PostgreSQL instance, no partitioning |
| 1M - 50M records | Primary + 2 read replicas, audit log partitioning |
| 50M+ records | Consider tenant-per-database for largest tenants, connection pooling (PgBouncer) |

**Connection Pooling:**
- PgBouncer in front of PostgreSQL.
- Transaction-level pooling.
- Max 20 connections per NestJS instance → PgBouncer multiplexes to ~100 actual DB connections.

### 5.5 Caching Strategy

| Data | Cache TTL | Invalidation |
|------|----------|-------------|
| Product catalog | 1 hour | On product update |
| Tenant config | 5 minutes | On config change |
| User session | 15 minutes | On logout / token refresh |
| Dashboard metrics | 5 minutes | Time-based |
| Rate limit counters | 1 minute | Sliding window |

---

## 6. Deployment

### 6.1 Environment Strategy

| Environment | Purpose | Infrastructure |
|-------------|---------|---------------|
| Local | Developer machines | Docker Compose |
| Dev | Integration testing | Single-node Kubernetes |
| Staging | Pre-production validation | Mirrors production |
| Production | Live system | Multi-node Kubernetes |

### 6.2 CI/CD Pipeline

```
[Push to branch] → [Lint + Type Check] → [Unit Tests] → [Build Docker Image]
                                                              ↓
[Deploy to Dev] → [Integration Tests] → [Deploy to Staging] → [E2E Tests]
                                                                    ↓
                                              [Manual Approval] → [Deploy to Prod]
                                                                    ↓
                                                              [Smoke Tests]
                                                                    ↓
                                                          [Monitor for 30 min]
                                                                    ↓
                                                         [Auto-rollback if errors > threshold]
```

### 6.3 Docker Compose (Development)

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/helalfinans
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
    depends_on:
      - db
      - redis
      - minio
      - rabbitmq

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: helalfinans
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  pgdata:
```

---

## 7. Observability

### 7.1 Health Checks

```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      checks: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        rabbitmq: await this.checkRabbitMQ(),
        storage: await this.checkS3(),
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 7.2 Key Metrics (Prometheus)

```
# Business metrics
helalfinans_leads_created_total{tenant, source}
helalfinans_contracts_created_total{tenant, product}
helalfinans_payments_received_total{tenant, method}
helalfinans_allocations_completed_total{tenant, method}
helalfinans_collection_rate{tenant}

# Technical metrics
helalfinans_http_request_duration_seconds{method, path, status}
helalfinans_db_query_duration_seconds{query_type}
helalfinans_queue_depth{queue_name}
helalfinans_active_connections{tenant}
```

### 7.3 Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| API Error Rate High | 5xx rate > 1% for 5 min | Critical | PagerDuty |
| Database Connection Pool Exhausted | Available connections < 5 | Critical | PagerDuty |
| Payment Queue Backup | Queue depth > 1000 | Warning | Slack |
| SLA Breach Rate High | SLA compliance < 80% | Warning | Email to ops |
| Collection Rate Drop | Collection rate < 85% | Warning | Email to finance |
| Disk Usage High | > 85% | Warning | Slack + auto-scale |

---

## 8. Disaster Recovery

### 8.1 Backup Strategy

| Data | Frequency | Retention | Method |
|------|-----------|----------|--------|
| PostgreSQL | Continuous (WAL streaming) + Daily full | 30 days | pg_basebackup + WAL archival to S3 |
| Redis | Hourly snapshot | 7 days | RDB snapshots to S3 |
| Documents (S3) | Real-time replication | Indefinite | S3 cross-region replication |
| Application configs | On every change | Indefinite | Git repository |

### 8.2 Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | < 1 minute (WAL streaming) |
| RTO (Recovery Time Objective) | < 30 minutes |
| Availability Target | 99.9% (8.76 hours downtime/year max) |

### 8.3 Failover

- **Database**: Automatic failover via Patroni or AWS RDS Multi-AZ.
- **Application**: Kubernetes automatically reschedules pods.
- **Cache**: Redis Sentinel for automatic failover.
- **Message Broker**: RabbitMQ cluster with mirrored queues.
