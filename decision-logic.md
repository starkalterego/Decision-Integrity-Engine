# Decision Logic — Governance & Enforcement Model (MVP)

---

## Purpose of This Document

This document explains **why each decision rule exists** and **how it is enforced** in the Decision Integrity Engine.

Unlike API or backend specs, this file is written in **plain, executive-readable language** while remaining precise enough for engineers.

It answers one question:

> *How does the system ensure that portfolio decisions are rational, defensible, and impossible to quietly compromise?*

---

## Core Design Philosophy

### 1. Decisions precede delivery

Projects do not earn the right to exist because they are already underway. They exist only if they survive structured decision scrutiny.

### 2. Governance must be structural

If governance can be bypassed through UI behavior, roles, or exceptions, it is theater—not control.

### 3. Trade-offs must be explicit

Every funded initiative displaces capacity, money, or attention from something else. The system exists to surface those trade-offs.

### 4. Discomfort is a signal

If the system feels restrictive, it is functioning correctly.

---

## 1. Initiative Completeness Logic

### Why this rule exists

Incomplete initiatives distort prioritization by injecting optimism without accountability. Historically, these initiatives survive because no system stops them.

### Rule

An initiative **cannot participate in prioritization or scenario modeling** unless it declares:

* Ownership
* Value
* Strategic alignment
* Capacity demand
* Confidence level

### Enforcement

* Validated on create and update
* Re-validated before prioritization
* Re-validated before lifecycle progression

### Outcome

Initiatives that cannot explain themselves **do not exist** for decision-making.

---

## 2. Lifecycle State Transition Logic

### Why this rule exists

Uncontrolled state changes allow initiatives to drift into execution without evidence or approval.

### Rule

Only predefined lifecycle transitions are allowed:

* Idea → Concept Approved → Planned → Execution → Closed
* Any state → Terminated

### Enforcement

* Illegal transitions rejected
* Required evidence validated
* Approver role verified
* Transition recorded permanently

### Outcome

No initiative advances without explicit, auditable approval.

---

## 3. Prioritization Logic

### Why this rule exists

Human prioritization consistently undervalues risk and overestimates value.

### Rule

Priority is calculated using a deterministic formula combining:

* Value
* Strategic alignment
* Cost of delay
* Risk (penalty)
* Capacity demand (penalty)

### Enforcement

* System-calculated only
* Incomplete initiatives excluded
* Manual overrides require rationale
* Overrides logged without altering base score

### Outcome

Priority reflects feasibility, not aspiration.

---

## 4. Capacity Enforcement Logic

### Why this rule exists

Organizations routinely approve more work than they can execute, creating hidden failure.

### Rule

Capacity is a **hard constraint**, not an aspiration.

### Enforcement

* Capacity validated during scenario updates
* Capacity validated before finalization
* Execution blocked under unresolved breaches

### Outcome

Overcommitment is visible and owned, never silent.

---

## 5. Scenario Modeling Logic

### Why this rule exists

Decisions made without comparison default to inertia.

### Rule

All decisions must be evaluated against a baseline using explicit assumptions.

### Enforcement

* Baseline is immutable
* Scenarios must declare assumptions
* All metrics recalculated automatically

### Outcome

Leaders choose between futures, not opinions.

---

## 6. Scenario Comparison Logic

### Why this rule exists

Without quantified comparison, scenario selection becomes subjective.

### Rule

Scenarios are compared exclusively against the baseline using:

* Value delta
* Risk delta
* Capacity delta

### Enforcement

* Comparison is system-generated
* User-entered deltas are prohibited

### Outcome

Trade-offs are numerical, not rhetorical.

---

## 7. Executive Status Logic

### Why this rule exists

Ambiguous status reporting delays decisions and diffuses accountability.

### Rule

Portfolio status is binary:

* GREEN: No blocking issues
* RED: Decision required

### Enforcement

* RED triggered automatically by breaches
* RED always linked to a specific constraint

### Outcome

Executives know exactly when action is required.

---

## 8. Risk Enforcement Logic

### Why this rule exists

Risk registers without consequences encourage neglect.

### Rule

Risk directly degrades priority and portfolio credibility.

### Enforcement

* Risk contributes to priority penalty
* Stale risks flagged automatically

### Outcome

Ignoring risk has measurable consequences.

---

## 9. Termination Logic

### Why this rule exists

Sunk cost bias keeps failing initiatives alive.

### Rule

Any initiative may be terminated at any stage with rationale.

### Enforcement

* Rationale mandatory
* Termination logged permanently
* Initiative archived, not deleted

### Outcome

Stopping work is normalized and defensible.

---

## 10. Audit & Accountability Model

### Why this rule exists

Decisions without memory repeat mistakes.

### Rule

Every override, approval, and termination is logged immutably.

### Enforcement

* Governance Decision Record created for every action
* Records are non-editable

### Outcome

Decisions remain explainable months or years later.

---

## What This System Explicitly Rejects

* Silent overrides
* Implicit assumptions
* Dashboard-driven optimism
* Political exception handling
* Retrospective justification

---

## Definition of Decision Integrity

A decision has integrity when:

* Constraints are acknowledged
* Trade-offs are explicit
* Accountability is recorded
* Reversal is possible without blame

This system exists to enforce that standard—consistently, unemotionally, and at scale.
