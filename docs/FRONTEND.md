# Frontend Design & Component Specification (MVP)

---

## Purpose of This Document

This document defines the **complete frontend design, layout, and component requirements** for the Decision Integrity Engine MVP.

It is written to:

* Remove ambiguity for frontend developers
* Prevent dashboard creep
* Ensure alignment with governance-first product philosophy

This is **not a visual design mock**. It is a **component and behavior contract**.

---

## Design Philosophy (Non-Negotiable)

* Decision-first, not interaction-first
* Minimal screens, maximum signal
* Read-only by default
* No cosmetic charts without decision value
* Every editable action must change a decision outcome

If a component does not directly support a portfolio decision, it does not belong in MVP.

---

## Page Inventory (MVP)

The MVP consists of **five pages/views only**:

1. Portfolio Setup Page
2. Initiative Intake Page
3. Scenario Workspace Page
4. Scenario Comparison Page
5. Executive One-Pager (Primary Output)

No additional views are permitted in MVP.

---

## 1. Portfolio Setup Page

### Objective

Define the decision boundary.

### Components

**1.1 Page Header**

* Product name
* Portfolio status indicator (Draft / Locked)

**1.2 Portfolio Form**

* Portfolio Name (text)
* Fiscal Period (dropdown)
* Total Budget (currency input)
* Total Capacity (numeric input)

### Behavioral Rules

* All fields mandatory
* Portfolio cannot be edited once scenarios exist
* Validation errors must be explicit

---

## 2. Initiative Intake Page

### Objective

Capture decision-grade initiatives only.

### Components

**2.1 Initiative Table**

* Initiative Name
* Sponsor
* Delivery Owner
* Strategic Objective
* Estimated Value
* Risk Level
* Status (Proposed only in MVP)

**2.2 Add / Edit Initiative Modal**

Fields:

* Initiative Name
* Sponsor
* Delivery Owner
* Value Category
* Strategic Alignment Score
* Estimated Value
* Risk Score

**2.3 Capacity Demand Subsection**

* Role Name
* Required Units
* Add / Remove Role rows

### Behavioral Rules

* Save disabled until all mandatory fields are filled
* Inline validation messages
* No prioritization shown on this page

---

## 3. Scenario Workspace Page (Core Working Screen)

### Objective

Allow decision-makers to explore trade-offs under constraints.

---

### 3.1 Scenario Header

**Components**

* Scenario Name
* Scenario Status (Draft / Finalized)
* Assumptions (text area — mandatory)

**Rules**

* Baseline scenario is read-only
* Assumptions required before edits

---

### 3.2 Initiative Decision Table

| Column          | Description                |
| --------------- | -------------------------- |
| Initiative Name | Read-only                  |
| Priority Score  | System-calculated          |
| Value           | Read-only                  |
| Capacity Demand | Read-only                  |
| Risk            | Read-only                  |
| Decision        | Fund / Pause / Stop toggle |

**Rules**

* Default decision = Pause
* Changes trigger real-time recalculation

---

### 3.3 Live Metrics Panel

**Metrics Displayed**

* Total Funded Value
* Total Cost
* Capacity Utilization (%)
* Risk Exposure Score

**Visual Signals**

* Green: Within limits
* Red: Constraint breached

**Rules**

* No amber state
* Red blocks finalization

---

### 3.4 Scenario Actions

* Save Scenario
* Finalize Scenario (disabled if constraints breached)

---

## 4. Scenario Comparison Page

### Objective

Enable explicit selection of the best scenario.

### Components

**4.1 Comparison Table**

| Metric   | Baseline | Scenario A | Scenario B |
| -------- | -------- | ---------- | ---------- |
| Value    |          |            |            |
| Cost     |          |            |            |
| Capacity |          |            |            |
| Risk     |          |            |            |

**4.2 Recommendation Action**

* Mark as Recommended (single selection only)

### Behavioral Rules

* Metrics are system-calculated only
* Recommended scenario becomes read-only

---

## 5. Executive One-Pager Page (Primary Output)

### Objective

Present a board-ready portfolio decision in one page.

---

### 5.1 Header Section

* Portfolio Name
* Recommended Scenario Name
* Fiscal Period

---

### 5.2 Key Metrics Strip

| Metric               | Value | Delta vs Baseline |
| -------------------- | ----- | ----------------- |
| Total Investment     |       |                   |
| Expected Value       |       |                   |
| Capacity Utilization |       |                   |
| Risk Exposure        |       |                   |

---

### 5.3 The Decision Ask (Critical Section)

* Auto-generated decision statement
* No user editing in MVP

---

### 5.4 Initiative Decisions Summary

| Initiative | Decision | Value | Capacity | Risk |

* Funded initiatives visible by default
* Paused/Stopped collapsible

---

### 5.5 Capacity & Risk Signals

* Capacity status indicator (Green / Red)
* Risk concentration warnings

---

### 5.6 Decision Record Footer

* Recommended by
* Date
* Scenario ID

---

## Visual & UX Guidelines

* Neutral, executive-grade color palette
* Typography over icons
* Tables over charts
* White space preferred over density

---

## Explicit MVP Exclusions

* Interactive dashboards
* Gantt charts
* Drill-down analytics
* Inline executive editing
* Personalization or theming

---

## Definition of Frontend Done

* All backend rules are visually respected
* User cannot bypass governance via UI
* Executive understands decision in < 60 seconds

If the UI feels quiet, serious, and slightly uncomfortable — it is correct.
