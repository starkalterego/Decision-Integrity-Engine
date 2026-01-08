# Decision Integrity Engine (MVP)

> **A backend‑enforced portfolio decision platform that forces clarity, exposes trade‑offs, and prevents bad initiatives from being approved.**

---

## 1. What This Product Is

Decision Integrity Engine is **not** a project management tool.

It is a **portfolio‑level decision system** designed to answer one question:

> *Given limited budget and capacity, which initiatives should we fund, pause, or terminate — and why?*

The system enforces strict governance rules at the **API level**, making it impossible to:

* Prioritize incomplete initiatives
* Ignore capacity constraints
* Hide risk behind dashboards
* Override decisions without accountability

Discomfort is intentional. Governance is the product.

---

## 2. Who This Is For

**Primary users**

* Portfolio Leads
* PMO Heads
* Strategy Owners

**Secondary users**

* Executives and Steering Committees consuming the decision output

**Not built for**

* Task management
* Delivery execution
* Resource scheduling
* Operational tracking

---

## 3. Core Principles (Non‑Negotiable)

* Backend enforcement only — UI never decides
* Incomplete initiatives do not exist
* Capacity is reality, not a suggestion
* Scenarios must declare assumptions
* All overrides require rationale and audit
* Red status always means decision required

---

## 4. MVP Scope

### Included

* Portfolio creation with fixed budget and capacity
* Initiative intake with completeness validation
* Baseline portfolio calculation (immutable)
* Priority scoring with risk and capacity penalties
* Scenario modeling (Fund / Pause / Stop)
* Capacity enforcement and execution blocking
* Scenario comparison vs baseline
* Executive one‑page PDF output
* Permanent decision audit log

### Explicitly Excluded

* Scheduling and timelines
* Task management
* Resource‑level assignments
* Workflow approvals
* Integrations (Jira, SAP, etc.)
* Custom governance configuration

---

## 5. High‑Level Workflow

1. Create portfolio (budget + capacity)
2. Add initiatives (mandatory economics & capacity)
3. System calculates immutable baseline
4. Create scenarios from baseline
5. Make Fund / Pause / Stop decisions
6. Enforce capacity constraints
7. Compare scenarios
8. Recommend and lock one scenario
9. Generate executive decision output
10. Log decision permanently

---

## 6. Architecture Overview

**Backend**

* API‑first, rule‑driven decision engine
* All validations enforced server‑side

**Frontend**

* Thin UI layer
* No client‑side business logic

**Data Store**

* PostgreSQL

**Outputs**

* System‑generated executive PDF

---

## 7. Success Criteria

The MVP is successful if:

* A bad initiative cannot be approved
* Capacity violations cannot be hidden
* An executive can make a decision without a meeting
* Every decision can be defended six months later

If users say *“this is strict, but fair”*, the system is working.

---


