# MVP Development Plan — Decision Integrity Engine

---

## 1. MVP Objective

Ship a **production‑credible MVP** that enforces portfolio decision integrity and produces an executive‑ready decision artifact.

This MVP must prove:

* Governance can be enforced in software
* Trade‑offs can be made explicit
* Bad initiatives can be blocked systematically

---

## 2. Development Principles

* Backend‑first implementation
* Opinionated logic (no configuration UI)
* Single‑portfolio focus
* Scenario‑driven decisions
* Auditability over convenience

---

## 3. Technology Stack (Recommended)

* **Backend**: Node.js (NestJS)
* **Database**: PostgreSQL 
* **ORM**: Prisma / SQLAlchemy
* **Frontend**: Next.js (minimal UI)
* **Auth**: Basic role‑based (Portfolio Lead, Executive)
* **Exports**: Server‑side PDF generation
* **Hosting**: Single cloud environment

---

## 4. Functional Milestones

### Milestone 1 — Portfolio Setup

**Features**

* Create portfolio with budget, capacity, fiscal period
* Mandatory fields enforced
* Status defaults to Draft

**Acceptance Criteria**

* Portfolio cannot exist without constraints

---

### Milestone 2 — Initiative Intake & Completeness Gate

**Features**

* Initiative creation with mandatory fields
* Role‑based capacity demand
* Block incomplete initiatives

**Acceptance Criteria**

* Incomplete initiatives cannot be prioritized or modeled

---

### Milestone 3 — Baseline Calculation Engine

**Features**

* Immutable baseline calculation
* Aggregate value, cost, capacity, risk

**Acceptance Criteria**

* Baseline is read‑only and system‑owned

---

### Milestone 4 — Prioritization Engine

**Features**

* Weighted priority score
* Risk and capacity penalties
* Manual override with mandatory rationale

**Acceptance Criteria**

* All overrides leave an audit trail

---

### Milestone 5 — Scenario Modeling

**Features**

* Clone baseline to scenario
* Mandatory assumptions
* Fund / Pause / Stop per initiative
* Live recalculation

**Acceptance Criteria**

* Multiple scenarios supported

---

### Milestone 6 — Capacity Enforcement

**Features**

* Capacity validation on scenario updates
* Block scenario finalization on breach

**Acceptance Criteria**

* No execution under unresolved overcapacity

---

### Milestone 7 — Scenario Comparison & Recommendation

**Features**

* Compare scenario vs baseline
* Value, risk, capacity deltas
* Lock recommended scenario

**Acceptance Criteria**

* Only one recommended scenario allowed

---

### Milestone 8 — Executive Output & Decision Logging

**Features**

* One‑page executive PDF
* Decision logging with owner and timestamp

**Acceptance Criteria**

* Decision artifact is board‑ready

---

## 5. Timeline (6 Weeks)

| Week | Focus                   |
| ---- | ----------------------- |
| 1    | Portfolio + initiatives |
| 2    | Completeness + baseline |
| 3    | Prioritization          |
| 4    | Scenarios + capacity    |
| 5    | Comparison + locking    |
| 6    | Exec output + hardening |

---

## 6. Definition of Done (MVP)

* No incomplete initiative can influence decisions
* Capacity violations are visible and blocking
* Every decision is auditable
* Executive output generated in one click

---

## 7. Post‑MVP (Out of Scope)

* Multi‑portfolio management
* Integrations
* Workflow approvals
* Scheduling and timelines
* Advanced configuration

These will be evaluated only after real usage feedback.

---

## 8. Operating Philosophy

This system is intentionally strict.

If users feel friction, governance is working.
