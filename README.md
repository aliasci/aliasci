# HelalFinans — Interest-Free Fintech Platform

A comprehensive, production-ready SaaS platform designed for **interest-free (Islamic / participation finance)** institutions in Turkey.

---

## Overview

HelalFinans combines two layers into one integrated system:

1. **Marketplace (HelalHesap)** — A consumer-facing comparison and lead generation platform where customers compare interest-free financial products across institutions.

2. **Core ERP / Operating System** — A full back-office system that manages the entire customer lifecycle: CRM, KYC, product configuration, contracts, payments, group management, allocation/lottery, asset delivery, and compliance.

### Target Customers

- **Tasarruf Finansman (Savings Finance)** companies: Fuzulev, Eminevim, Katılımevim, and similar
- **Participation Banks** (Islamic finance institutions): Kuveyt Türk, Vakıf Katılım, Ziraat Katılım, etc.

---

## Documentation

| Document | Description |
|----------|-------------|
| [System Design](docs/SYSTEM_DESIGN.md) | Full system architecture, all core modules (CRM, KYC, Product Engine, Payments, etc.), Tasarruf and Participation finance modules, user roles, marketplace design, analytics, compliance, MVP roadmap, and differentiation strategy |
| [Domain Model](docs/DOMAIN_MODEL.md) | Complete entity definitions with attributes, relationships, lifecycle states, and JSONB schemas for all 26 core entities |
| [API Specification](docs/API_SPECIFICATION.md) | RESTful API design with endpoints for leads, customers, plans, contracts, payments, groups, allocations, documents, marketplace integration, and webhooks |
| [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) | Technology stack (NestJS, React, PostgreSQL), multi-tenant database design, modular monolith structure, security, scaling strategy, deployment, and disaster recovery |
| [Workflows](docs/WORKFLOWS.md) | End-to-end workflows (lead-to-completion), state machines for all entities, delinquency handling, reconciliation, group formation, and notification templates |

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────┐
│              CONSUMER LAYER                      │
│  Marketplace  │  Customer Portal  │  Mobile PWA  │
├─────────────────────────────────────────────────┤
│              API GATEWAY / BFF                   │
│  Auth (JWT) │ Tenant Resolution │ Rate Limiting  │
├─────────────────────────────────────────────────┤
│              CORE ERP LAYER                      │
│  CRM │ KYC │ Products │ Contracts │ Payments     │
│  Groups │ Allocation │ Delivery │ Documents      │
├─────────────────────────────────────────────────┤
│        COMPLIANCE & INTELLIGENCE                 │
│  Audit Engine │ BI/Reporting │ Risk │ Notif.     │
├─────────────────────────────────────────────────┤
│              INFRASTRUCTURE                      │
│  PostgreSQL │ Redis │ S3 │ RabbitMQ              │
└─────────────────────────────────────────────────┘
```

---

## Core Modules

- **CRM & Lead Management** — Multi-source lead capture, pipeline stages, auto-assignment, SLA tracking
- **Customer & KYC** — Identity verification (NVI), document OCR, risk scoring, guarantor management
- **Product & Plan Engine** — Configurable rule engine, multiple plan types, simulation engine
- **Offer & Contract Management** — Offer versioning, e-signature, contract lifecycle state machine
- **Payment & Collection** — Installment tracking, multi-channel collection, bank reconciliation, delinquency handling
- **Document Management** — Upload, OCR, verification workflows, audit trail
- **Tasarruf Finance** — Group management, pool/fund tracking, lottery & merit allocation, delivery workflows
- **Participation Finance** — Murabaha workflow, asset tracking, vendor management, collateral tracking
- **Marketplace** — Product comparison, lead generation, partner dashboard, matching algorithm

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Frontend | React 19 + Next.js 15 + Tailwind CSS |
| Database | PostgreSQL 16 (multi-tenant schemas) |
| Cache | Redis 7 |
| Queue | BullMQ + RabbitMQ |
| Storage | AWS S3 / MinIO |
| Auth | JWT + OAuth2 + CASL |

---

## Multi-Tenancy

Each financial institution operates as an isolated tenant with its own PostgreSQL schema. Tenant resolution happens at the API gateway via subdomain (`fuzulev.helalfinans.com`) or header. Data isolation is enforced at the database level with no cross-tenant data leakage.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) for full setup including Docker Compose configuration.

---

## License

Proprietary. All rights reserved.
