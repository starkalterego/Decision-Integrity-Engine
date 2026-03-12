# MVP Development Plan — Decision Integrity Engine

> **Last Updated:** March 11, 2026  
> **Stack:** Next.js 16 · TypeScript · Prisma 5 · PostgreSQL (Supabase) · React 19 · Tailwind CSS 4  
> **Current Status:** ~70% of Phase 1 complete. This plan finishes Phase 1 end-to-end.

---

## Current State Summary

### ✅ Already Built
- Auth system (JWT, RBAC: PORTFOLIO_LEAD / EXECUTIVE / PMO)
- Portfolio CRUD with budget + capacity constraints
- Initiative intake with completeness validation
- Priority scoring engine (`lib/priority.ts`)
- Scenario Fund/Pause/Stop decisions with finalization lock
- Scenario comparison vs baseline
- Governance decision audit log
- Executive summary endpoint
- 15 API routes, all pages rendered

### ❌ Critical Gaps (blocks a real MVP)
- No initiative **lifecycle state machine** (`idea → approved → planned → execution → closed`)
- No **capex/opex cost split** — cost currently equals value (wrong)
- No **role-based capacity validation** — only checks total units, not per-role
- No **strategic objectives** linking initiatives to strategy
- No **risk register** per initiative
- No **execution approval gate** — initiatives can jump to execution without checks
- No **PDF export** for executive output (endpoint exists, no actual PDF)

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

## 3. Technology Stack (Actual)

* **Framework**: Next.js 16 (API routes serve as backend — no separate server)
* **Language**: TypeScript 5
* **Database**: PostgreSQL (hosted on Supabase)
* **ORM**: Prisma 5 (with pgBouncer pooler config)
* **Frontend**: React 19 + Tailwind CSS 4
* **Auth**: JWT + bcryptjs, role-based (PORTFOLIO_LEAD / EXECUTIVE / PMO)
* **Exports**: `@react-pdf/renderer` (server-side PDF, Sprint 5)
* **Hosting**: Supabase (DB) + any Node.js host (Vercel / Railway / self-hosted)

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

---

---

# ✅ IMPLEMENTATION PLAN — MVP COMPLETION

> Build order is strictly dependency-driven. Each sprint must be fully complete before the next begins.  
> All work stays within the current Next.js + Prisma + TypeScript stack.

---

## SPRINT 1 — Fix the Data Model
**Duration: 1–2 days**  
**Why first:** Every sprint after this depends on the correct schema.

### 1.1 — Update Prisma Schema

**File:** `frontend/prisma/schema.prisma`

**Changes to `Portfolio` model — add missing field:**
```
description   String?   // Portfolio description (Architecture requirement)
```

**Changes to `Initiative` model — add missing fields:**
```
lifecycleState  String   @default("IDEA")
  // IDEA | CONCEPT_APPROVED | PLANNED | EXECUTION | CLOSED | TERMINATED

capexCost       Float    @default(0)    // Capital expenditure (separate from opex)
opexCost        Float    @default(0)    // Operational expenditure (separate from capex)
costOfDelay     Float    @default(0)    // Business cost per week of delay (used in priority score)
strategyScore   Float    @default(0)    // Strategy alignment score (0–100, separate from 1–5 integer)
description     String?                 // Initiative description
objectiveId     String?                 // FK to StrategicObjective (nullable)
```

> Note: `estimatedValue` remains as the value score. `strategyScore` is added as a continuous float
> separate from `strategicAlignmentScore` (1–5 integer). This matches the architecture's
> `value_score` + `strategy_score` as distinct fields.

**New model — `StrategicObjective`:**
```prisma
model StrategicObjective {
  id          String   @id @default(uuid())
  portfolioId String
  name        String
  description String?
  priority    Int      @default(1)
  createdAt   DateTime @default(now())

  portfolio   Portfolio   @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  initiatives Initiative[]

  @@index([portfolioId])
}
```

**New model — `Role` (named role types, portfolio-scoped):**
```prisma
model Role {
  id            String   @id @default(uuid())
  name          String   // e.g. "Backend Developer", "Data Engineer"
  description   String?

  capacityBuckets RoleCapacity[]
  capacityDemands CapacityDemand[]
}
```

**New model — `RoleCapacity` (capacity buckets by role and period):**
```prisma
model RoleCapacity {
  id             String   @id @default(uuid())
  portfolioId    String
  roleId         String
  availableUnits Int
  periodStart    DateTime
  periodEnd      DateTime

  portfolio  Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  role       Role      @relation(fields: [roleId], references: [id])

  @@index([portfolioId])
  @@index([roleId])
}
```

> This replaces the current single `totalCapacity: Int` on Portfolio for per-role validation.
> The portfolio-level `totalCapacity` remains as a fallback aggregate.

**Updated model — `CapacityDemand` — link to Role FK:**
```
roleId   String?   // Optional FK to Role model (null = free-text role for backward compat)
role     Role?     @relation(...)
```

**New model — `InitiativeRisk`:**
```prisma
model InitiativeRisk {
  id           String   @id @default(uuid())
  initiativeId String
  description  String
  probability  Float    // 0.0–1.0
  impact       Float    // 0.0–1.0
  exposure     Float    // Computed: probability × impact
  status       String   @default("OPEN") // OPEN | MITIGATED | CLOSED
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  initiative   Initiative @relation(fields: [initiativeId], references: [id], onDelete: Cascade)

  @@index([initiativeId])
}
```

**New model — `ScenarioMetrics` (stored, not computed on-the-fly):**
```prisma
model ScenarioMetrics {
  id            String   @id @default(uuid())
  scenarioId    String   @unique
  totalValue    Float
  totalCost     Float    // capexCost + opexCost of all FUND decisions
  totalCapacity Int      // sum of capacity units of all FUND decisions
  riskScore     Float    // average risk of FUND decisions
  updatedAt     DateTime @updatedAt

  scenario      Scenario @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
}
```

**Add to `Portfolio` model:**
```
description       String?
objectives        StrategicObjective[]
roleCapacities    RoleCapacity[]
```

**Add to `Initiative` model:**
```
risks             InitiativeRisk[]
objective         StrategicObjective? @relation(fields: [objectiveId], references: [id])
```

**Add to `Scenario` model:**
```
metrics           ScenarioMetrics?
```

### 1.2 — Write and Apply Migration
```bash
cd frontend
npx prisma migrate dev --name "add_lifecycle_costs_objectives_risks"
npx prisma generate
```

### 1.3 — Update Priority Score Formula
**File:** `frontend/lib/priority.ts`

Align to Architecture formula (weights updated from current incorrect values):
```
Priority = (estimatedValue  × 0.40)   // W1: Value contribution
         + (strategyScore   × 0.30)   // W2: Strategic alignment (continuous 0–100)
         + (costOfDelay     × 0.30)   // W3: Cost of delay (weekly business cost)
         - (riskScore       × 0.20)   // W4: Risk penalty
         - (capacityUnits   × 0.10)   // W5: Capacity consumption penalty
```

> The current formula uses weights 0.30/0.25/0.15 which don't match the architecture.
> `strategyScore` (continuous) replaces `strategicAlignmentScore` (1–5 integer) in the formula.

**Acceptance criteria:** Schema migrated, Prisma client regenerated, no TypeScript errors.

---

## SPRINT 2 — Build the Governance Engine Layer
**Duration: 1–2 days**  
**Why second:** All API routes should call this layer, not inline logic.

### 2.1 — Create Central Governance Service
**New file:** `frontend/lib/governance.ts`

This is the single source of truth for all governance rules. Implement:

**A. Lifecycle State Machine**
```typescript
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  IDEA:             ['CONCEPT_APPROVED', 'TERMINATED'],
  CONCEPT_APPROVED: ['PLANNED', 'TERMINATED'],
  PLANNED:          ['EXECUTION', 'TERMINATED'],
  EXECUTION:        ['CLOSED', 'TERMINATED'],
  CLOSED:           [],
  TERMINATED:       [],
};

function validateLifecycleTransition(current: string, target: string): void
// Throws GovernanceViolation if transition is illegal
```

**B. Initiative Completeness Gate**
```typescript
function validateInitiativeCompleteness(initiative): ValidationResult
// Required: name, sponsor, deliveryOwner, strategicAlignmentScore,
//           estimatedValue, capexCost, opexCost, riskScore, capacityDemands (≥1)
```

**C. Execution Approval Gate**
```typescript
async function validateExecutionApproval(initiativeId, db): Promise<void>
// Blocks PLANNED → EXECUTION unless:
//   1. Initiative is complete
//   2. Portfolio is not over capacity (role-by-role check)
//   3. Portfolio budget not exceeded
```

**D. Role-Based Capacity Validation**
```typescript
async function validateRoleCapacity(portfolioId, scenarioId, db): CapacityReport
// Joins RoleCapacity (available) with CapacityDemand (demanded) per roleId
// Returns per-role breakdown:
// { roleId: string, roleName: string, demanded: number, available: number, breached: boolean }[]
// Falls back to portfolio.totalCapacity aggregate if no RoleCapacity rows exist
```

**E.1 — ScenarioMetrics Recalculation**
```typescript
async function recalculateScenarioMetrics(scenarioId, db): void
// Called after every decision change (Fund/Pause/Stop)
// Upserts into ScenarioMetrics table — never computed on-the-fly
// totalCost = sum(capexCost + opexCost) for FUND decisions only
```

**E. Budget Validation**
```typescript
async function validateBudget(portfolioId, scenarioId, db): BudgetReport
// totalCapex + totalOpex vs portfolio.totalBudget
```

**F. Governance Violation Error Class**
```typescript
class GovernanceViolation extends Error {
  constructor(public code: string, message: string) { ... }
}
```

### 2.2 — Update Priority Score to Use New Fields
Update `lib/priority.ts` to accept and use `capexCost`, `opexCost`, `costOfDelay`.

**Acceptance criteria:** `lib/governance.ts` exports all functions with TypeScript types. No business logic lives directly in route handlers.

---

## SPRINT 3 — Fix and Complete API Endpoints
**Duration: 2–3 days**  
**Why third:** Routes are the public contract. Fix after data model and engine are correct.

### 3.1 — Fix `POST /api/initiatives`
**File:** `frontend/app/api/initiatives/route.ts`

Changes:
- Accept and save `capexCost`, `opexCost`, `costOfDelay`, `description`, `objectiveId`
- Set `lifecycleState: 'IDEA'` on creation
- Call `governance.validateInitiativeCompleteness()` instead of inline validation
- Recalculate priority score using updated formula

### 3.2 — Fix `GET /api/portfolios/[id]/baseline`
**File:** `frontend/app/api/portfolios/[id]/baseline/route.ts`

Fix critical bug:
```typescript
// WRONG (current):
const totalCost = initiatives.reduce((sum, i) => sum + i.estimatedValue, 0);

// CORRECT:
const totalCost = initiatives.reduce((sum, i) => sum + i.capexCost + i.opexCost, 0);
```

Also add:
- Per-role capacity breakdown in response
- Budget utilization percentage

### 3.3 — Add `POST /api/initiatives/[id]/lifecycle`
**New file:** `frontend/app/api/initiatives/[id]/lifecycle/route.ts`

```
POST /api/initiatives/[id]/lifecycle
Body: { targetState: "CONCEPT_APPROVED" | "PLANNED" | "EXECUTION" | "CLOSED" | "TERMINATED", rationale?: string }
```

Logic:
1. Call `governance.validateLifecycleTransition()`
2. If target is `EXECUTION` → call `governance.validateExecutionApproval()`
3. Update `lifecycleState` in DB
4. Write `GovernanceDecisionRecord` with rationale
5. Return updated initiative

### 3.4 — Fix `POST /api/scenarios/[id]/finalize`
**File:** `frontend/app/api/scenarios/[id]/finalize/route.ts`

Replace inline capacity check with:
- Call `governance.validateRoleCapacity()` — per-role, not just total
- Call `governance.validateBudget()` — capex+opex vs budget
- Write finalization record to governance log

### 3.5 — Add Risks CRUD
**New file:** `frontend/app/api/initiatives/[id]/risks/route.ts`

```
GET    /api/initiatives/[id]/risks         — list all risks
POST   /api/initiatives/[id]/risks         — create risk
PATCH  /api/initiatives/[id]/risks/[rid]   — update status
DELETE /api/initiatives/[id]/risks/[rid]   — delete risk
```

Auto-compute `exposure = probability × impact` on save.

### 3.6 — Add Strategic Objectives CRUD
**New file:** `frontend/app/api/portfolios/[id]/objectives/route.ts`

```
GET  /api/portfolios/[id]/objectives   — list objectives
POST /api/portfolios/[id]/objectives   — create objective
```

### 3.7 — Add Role Capacity CRUD
**New file:** `frontend/app/api/portfolios/[id]/roles/route.ts`

```
GET  /api/portfolios/[id]/roles              — list roles + current capacity buckets
POST /api/portfolios/[id]/roles              — define a role (name, description)
POST /api/portfolios/[id]/roles/[rid]/capacity — add capacity bucket (availableUnits, periodStart, periodEnd)
```

This is required before role-based capacity validation in Sprint 2 can work end-to-end.
Roles are global (e.g. "Backend Developer") but capacity buckets are portfolio+period scoped.

### 3.8 — Trigger ScenarioMetrics on Decision Update
**File:** `frontend/app/api/scenarios/[id]/decisions/route.ts`

After saving decisions, call `governance.recalculateScenarioMetrics(scenarioId, prisma)`.
This keeps the `ScenarioMetrics` table always up to date.

### 3.9 — Fix Executive Summary Endpoint
**File:** `frontend/app/api/scenarios/[id]/executive-summary/route.ts`

Enrich response to include:
- Correct cost figures (capex + opex) — read from `ScenarioMetrics` table, not computed inline
- Per-role capacity breakdown from `RoleCapacity` vs `CapacityDemand`
- Risk concentration: top 2 initiatives by `InitiativeRisk.exposure`
- Funded / Paused / Stopped initiative counts
- Lifecycle state distribution of funded initiatives

**Acceptance criteria:** All 15 existing routes pass + 5 new routes added. No route contains governance logic inline.

---

## SPRINT 4 — Fix the UI
**Duration: 2–3 days**  
**Why fourth:** UI reflects the fixed backend. Don't build UI against broken data.

### 4.1 — Fix Initiative Form
**File:** `frontend/app/portfolio/[id]/initiatives/page.tsx`

Add fields to the Add/Edit modal:
- `description` (textarea)
- `capexCost` (number input)
- `opexCost` (number input)
- `costOfDelay` (number input, per week)
- `objectiveId` (dropdown from portfolio objectives)

Remove: any field that used `estimatedValue` as cost proxy.

### 4.2 — Add Lifecycle State Display + Transition Controls
**File:** `frontend/app/portfolio/[id]/initiatives/page.tsx`

In the initiative table, add:
- `lifecycleState` badge column (colour-coded: IDEA=grey, PLANNED=blue, EXECUTION=green, TERMINATED=red)
- Dropdown/button per row: "Advance State" → shows allowed next states
- On transition to `EXECUTION`: prompt for rationale (required field)
- Blocked transitions show a locked icon with reason

### 4.3 — Add Risk Register Panel
**File:** `frontend/app/portfolio/[id]/initiatives/page.tsx` (or new sub-page)

Below each initiative (expand row or drawer):
- List current risks with probability, impact, exposure
- Add risk form: description, probability (slider 0–1), impact (slider 0–1)
- Status toggle: OPEN / MITIGATED / CLOSED
- Risk exposure badge (computed: probability × impact × 100)

### 4.4 — Add Strategic Objectives Section
**File:** `frontend/app/portfolio/[id]/setup/page.tsx`

Add a section:
- List current objectives for the portfolio
- Add objective form: name, description, priority
- Objective count shown in portfolio summary header

### 4.4b — Add Role Capacity Management
**File:** `frontend/app/portfolio/[id]/setup/page.tsx`

Add a second section on the setup page:
- Define roles for this portfolio (e.g. "Backend Developer", "Data Engineer")
- Per role: set available capacity units and period (Q1, Q2, etc.)
- Show a capacity summary table: Role | Available Units | Demanded (live)
- Without defining roles, capacity validation falls back to `totalCapacity` aggregate
- This is what enables per-role breach detection in the scenario workspace

### 4.5 — Fix Scenario Workspace — Capacity View
**File:** `frontend/app/portfolio/[id]/scenarios/[scenarioId]/page.tsx`

Replace total-only capacity bar with:
- Per-role capacity table: Role | Demanded | Portfolio Limit | Status
- Red highlight rows where `demanded > limit`
- Budget display: Total CapEx + OpEx vs Portfolio Budget (not value vs budget)

### 4.6 — Fix Executive Output Page
**File:** `frontend/app/portfolio/[id]/output/page.tsx`

Update to show:
- Correct cost breakdown (CapEx / OpEx separately)
- Funded / Paused / Stopped initiative counts
- Risk concentration callout
- Per-role capacity summary

**Acceptance criteria:** End-to-end flow works: create portfolio → add objective → add initiative → advance lifecycle → create scenario → finalize → view executive output. Zero broken UI states.

---

## SPRINT 5 — PDF Export + Hardening
**Duration: 1–2 days**

### 5.1 — PDF Generation
Install and implement server-side PDF:

```bash
cd frontend && npm install @react-pdf/renderer
```

**New file:** `frontend/app/api/scenarios/[id]/export-pdf/route.ts`

Generate a single-page PDF containing:
- Portfolio name, fiscal period
- Recommended scenario name + assumptions
- Metrics table: total value, capex, opex, capacity utilization, avg risk
- Initiative list: funded (green) / paused (amber) / stopped (red)
- Governance sign-off block: finalized by, timestamp, audit ID

**UI trigger:** "Export PDF" button on the executive output page.

### 5.2 — Rate Limit Config Fix
**File:** `frontend/lib/rateLimit.ts`

Increase login attempts for dev to avoid lockout:
```typescript
login: {
  windowMs: 15 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50
}
```

### 5.3 — Error Handling Hardening
- All API routes must return consistent `{ success, data, errors[] }` shape
- Add global error boundary to catch Prisma connection drops
- Add retry logic (1 retry) to Prisma client for transient pooler errors

### 5.4 — End-to-End Test Checklist
Manually verify each flow:

| Flow | Expected |
|---|---|
| Create portfolio (with description) | Redirects to setup page |
| Define roles + capacity buckets | Appears in capacity table |
| Add strategic objective | Appears in dropdown on initiative form |
| Add initiative (incomplete) | Blocked, shows validation errors |
| Add initiative (complete, with capex/opex) | Created with IDEA state, priority score shown |
| Advance IDEA → CONCEPT_APPROVED | Succeeds, logged in governance trail |
| Advance PLANNED → EXECUTION (over role capacity) | Blocked with per-role breakdown |
| Create scenario | Clones all complete initiatives as PAUSE |
| Fund initiative (over budget) | Real-time block: capex+opex exceeds budget |
| Add risk to initiative | Exposure = probability × impact computed |
| Finalize scenario (no assumptions) | Blocked with governance error |
| Finalize scenario (valid) | Locked, ScenarioMetrics stored, can't edit |
| Compare 2 scenarios | Deltas read from ScenarioMetrics, not recomputed |
| Export PDF | Downloads single-page PDF with correct costs |
| View governance log (PMO/Executive only) | All decisions listed chronologically |

**Acceptance criteria:** All 15 flows pass. Zero 500 errors in normal usage.

---

## SPRINT 6 — Deployment
**Duration: 1 day**

### 6.1 — Environment
- Ensure `.env` has all required vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`
- Set `NODE_ENV=production`

### 6.2 — Build Verification
```bash
cd frontend
npm run build     # Must produce 0 errors
npm run start     # Must serve on port 3000
```

### 6.3 — Database Final State
```bash
npx prisma migrate deploy   # Apply all migrations via DIRECT_URL
node --env-file=.env scripts/createAdmins.js   # Seed admin users
```

### 6.4 — Smoke Test on Production Build
- Login with each role
- Complete one full portfolio decision cycle
- Export PDF

---

## Full Implementation Order

```
Sprint 1 — Schema & Migration          (2 days)
  └─ Add description to Portfolio
  └─ Add lifecycleState, capexCost, opexCost, costOfDelay, strategyScore to Initiative
  └─ Add StrategicObjective model
  └─ Add Role + RoleCapacity models (per-role capacity buckets)
  └─ Add roleId FK to CapacityDemand
  └─ Add InitiativeRisk model
  └─ Add ScenarioMetrics model
  └─ Run migration → npx prisma migrate dev

Sprint 2 — Governance Engine Layer     (2 days)
  └─ lib/governance.ts
  └─ GovernanceViolation error class
  └─ Lifecycle state machine + transition validator
  └─ Completeness gate (updated required fields)
  └─ Execution approval gate
  └─ Role-based capacity validator (uses RoleCapacity table)
  └─ Budget validator (capex + opex vs totalBudget)
  └─ ScenarioMetrics recalculation function
  └─ Update lib/priority.ts formula weights

Sprint 3 — API Fixes + New Routes      (3 days)
  └─ Fix initiatives POST (new fields, call governance layer)
  └─ Fix baseline GET (cost = capex + opex, not value)
  └─ NEW: POST /api/initiatives/[id]/lifecycle
  └─ Fix finalize (role-based capacity + budget check)
  └─ NEW: /api/initiatives/[id]/risks CRUD
  └─ NEW: /api/portfolios/[id]/objectives CRUD
  └─ NEW: /api/portfolios/[id]/roles + capacity CRUD
  └─ Fix decisions route to trigger ScenarioMetrics update
  └─ Fix executive summary (reads ScenarioMetrics, adds risk concentration)

Sprint 4 — UI Fixes                    (3 days)
  └─ Fix initiative form (new fields: capex, opex, costOfDelay, strategyScore)
  └─ Add lifecycle state badge + transition controls
  └─ Add risk register panel per initiative
  └─ Add strategic objectives section on setup page
  └─ Add role capacity management on setup page
  └─ Fix scenario workspace (per-role capacity table)
  └─ Fix executive output (correct costs, risk concentration)

Sprint 5 — PDF + Hardening             (2 days)
  └─ PDF export endpoint + UI button
  └─ Rate limit fix (dev vs prod)
  └─ Consistent error response shapes
  └─ Prisma retry logic for pooler transients
  └─ End-to-end test checklist (14 flows)

Sprint 6 — Deployment                  (1 day)
  └─ Production build (npm run build — 0 errors)
  └─ npx prisma migrate deploy
  └─ Admin seed
  └─ Smoke test all 3 roles

Total: ~14 development days
```

---

## Post-MVP Roadmap (Phase 2 & 3)

> Do not start until Phase 1 MVP is live and validated by real users.

### Phase 2 — Scenario Intelligence (Optimization)
**Goal:** System recommends the optimal portfolio configuration automatically.

- Model portfolio selection as a **knapsack problem**
- Implement optimizer: `lib/optimizer.ts` using a greedy or branch-and-bound algorithm
  - `maximize: sum(estimatedValue) for FUND decisions`
  - `subject to: totalCost ≤ budget AND totalCapacity ≤ available AND avgRisk ≤ threshold`
- Add `POST /api/portfolios/[id]/optimize` — returns ranked initiative selection
- Add **Portfolio Efficiency Score** (value delivered per unit of capacity consumed)
- Add **Risk Concentration Alert** — flags when >50% risk is in ≤2 initiatives
- Add scenario auto-generation from optimizer output
- Add trade-off visualization in scenario comparison UI

Python equivalent (if migrating to FastAPI): `PuLP` / `Google OR-Tools`  
TypeScript equivalent: custom greedy solver or `javascript-lp-solver` npm package

### Phase 3 — AI Predictive System
**Goal:** System predicts outcomes and generates executive insights.

- **Value Prediction Model**: Train on historical initiative data → predict ROI + success probability
  - Input features: initiative type, team size, complexity, budget, industry
  - Tools: Python microservice with scikit-learn / XGBoost
- **Delivery Risk Prediction**: Predict delay / cost overrun / termination likelihood
  - Training data: `InitiativeRisk` table + `GovernanceDecisionRecord` history
- **AI Executive Advisor**: LLM-generated natural language insights per scenario
  - e.g. "Scenario B concentrates 65% risk in 2 initiatives — historically volatile"
  - Tools: LangChain + OpenAI API, called from a Python sidecar service
- **Data Layer**: Export `GovernanceDecisionRecord` + `ScenarioMetrics` to a data store
  (Supabase Analytics / BigQuery) as training data for ML models

> The `ScenarioMetrics` and `InitiativeRisk` tables added in Sprint 1 are the AI training data foundation.

---

## Definition of Done (MVP)

- [ ] No incomplete initiative can enter prioritization or scenario modeling
- [ ] Initiatives must progress through defined lifecycle states — illegal transitions rejected at API level
- [ ] Execution cannot start if any **role** is over its capacity bucket
- [ ] Scenarios enforce both budget (capex+opex vs `totalBudget`) and role-based capacity
- [ ] Every lifecycle transition and override is logged in `GovernanceDecisionRecord` with rationale
- [ ] `ScenarioMetrics` stored in DB — scenario comparison never recomputes from scratch
- [ ] Risk register captures probability, impact, and computed exposure per initiative
- [ ] Strategic objectives link initiatives to portfolio strategy
- [ ] Role capacity buckets enable per-role validation, not just aggregate total
- [ ] Priority score uses correct formula: value(0.40) + strategy(0.30) + delay(0.30) − risk(0.20) − capacity(0.10)
- [ ] Scenario comparison shows accurate deltas vs immutable baseline
- [ ] Executive PDF generated in one click with correct capex/opex figures
- [ ] All 3 roles (PORTFOLIO_LEAD, EXECUTIVE, PMO) can complete their workflows
- [ ] Zero governance rules enforced only in UI — all rules enforced in `lib/governance.ts` called by API routes
