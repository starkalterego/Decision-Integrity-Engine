# Backend Architecture & Decision Logic (MVP)

---

## Purpose of This Document

This document provides a **concise but complete backend specification** for the Decision Integrity Engine MVP.

It is derived directly from:

* Decision Engine implementation logic
* Developer-first governance rules
* Data model specification
* Frontend and executive output requirements

This file exists to ensure **backend engineers enforce governance by design**, not by convention.

---

## Backend Philosophy (Non-Negotiable)

* Backend is the source of truth
* UI is a consumer, never an authority
* All governance rules are enforced at API level
* No rule may be bypassed by role, UI, or integration
* Every decision must be auditable

If logic is not enforced server-side, it does not exist.

---

## Core Responsibilities of the Backend

The backend must:

1. Validate initiative completeness
2. Enforce lifecycle state transitions
3. Calculate priority scores deterministically
4. Enforce capacity constraints
5. Manage scenario cloning and comparison
6. Generate executive decision outputs
7. Record immutable governance decisions

---

## Core Domain Entities

### Portfolio

* Defines the decision boundary
* Owns budget and capacity limits
* One active portfolio per MVP instance

### Initiative

* Atomic unit of decision-making
* Cannot participate in prioritization unless complete
* Carries value, risk, and capacity demand

### Scenario

* Clone of baseline portfolio state
* Holds Fund / Pause / Stop decisions
* Immutable once finalized

### Governance Decision Record

* Immutable audit entity
* Captures overrides, terminations, and approvals

---

## Initiative Completeness Enforcement

**Rule**
An initiative without value, ownership, alignment, and capacity does not exist for decision-making.

**Backend Enforcement**

* Validation on create/update
* Validation before prioritization
* Validation before lifecycle progression

Failure results in hard API rejection.

---

## Lifecycle State Enforcement

**Allowed States**

* Idea → Concept Approved → Planned → Execution → Closed
* Any state → Terminated

**Backend Rules**

* Illegal transitions rejected
* Required artifacts validated
* Role authorization enforced
* Transition logged as governance decision

---

## Prioritization Engine

**Priority Score Formula**

Priority = (Value × W1)
+ (Strategic Alignment × W2)
+ (Cost of Delay × W3)
− (Risk × W4)
− (Capacity Demand × W5)

**Rules**

* Incomplete initiatives excluded
* Scores always system-calculated
* Manual overrides require rationale
* Overrides never overwrite base score

---

## Capacity Validation Engine

**Rules**

* Capacity is role-based
* Capacity is enforced during:

  * Scenario updates
  * Scenario finalization
  * Lifecycle transition to Execution

**Behavior**

* Overcapacity allowed in draft
* Finalization blocked if breaches exist

---

## Scenario Management

### Baseline Scenario

* System-generated
* Immutable
* Used as comparison anchor

### Working Scenarios

* Must declare assumptions
* Clone baseline state
* Recalculate metrics on every change

---

## Scenario Comparison Logic

**Computed Deltas**

* Value delta vs baseline
* Risk delta vs baseline
* Capacity stress delta
* Delivery impact (qualitative in MVP)

Comparisons are always system-calculated.

---

## Executive Status Logic

**Portfolio Status Rules**

* RED if capacity breached
* RED if high-risk initiatives exist
* GREEN otherwise

No amber state is allowed.

---

## Risk Enforcement

* Risks degrade priority automatically
* Stale risks flagged by system
* Ignored risks reduce portfolio credibility

Risk is a mathematical input, not a comment field.

---

## Termination Logic

**Rules**

* Initiative may be terminated at any stage
* Rationale is mandatory
* Sunk cost is explicitly ignored

Termination is logged permanently.

---

## API Design Principles

* RESTful endpoints
* Deterministic responses
* Explicit error codes for governance violations
* Idempotent writes where applicable

---

## MVP Backend Success Criteria

* No invalid initiative enters prioritization
* No scenario finalizes under hidden overcapacity
* No executive view hides trade-offs
* Every override leaves an audit trail

If leadership cannot bypass the system, the backend is correct.

---

## Out of Scope (MVP)

* Workflow engines
* Asynchronous orchestration
* External integrations
* Multi-portfolio tenancy
* Configurable governance rules

These will be considered only after MVP validation.
