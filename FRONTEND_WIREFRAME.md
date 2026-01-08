# Frontend Wireframe Analysis & UI Specification

---

## Purpose of This Document

This document translates the uploaded Excel wireframe into a **clear, build-ready frontend specification** for the Decision Integrity Engine MVP.

The Excel is **not a dashboard mock**. It is a **one-page executive decision artifact**. The UI exists to *produce this page*, not to distract from it.

---

## Core Insight from the Excel Wireframe

The Excel represents the **final executive output**, not an operational screen.

Everything in the product flows toward answering one question:

> **What decision is being asked, and what evidence supports it?**

This is the anchor principle for the entire frontend.

---

## Page Hierarchy (MVP)

The MVP frontend consists of **four functional views** and **one output view**.

1. Portfolio Context Header
2. Scenario Workspace
3. Scenario Comparison View
4. Decision Confirmation View
5. Executive One-Pager Output (Excel-derived)

No additional pages are required for MVP.

---

## 1. Executive One-Pager (Primary Output)

This is a **pixel-faithful digital version** of the Excel file.

### 1.1 Header Section — Portfolio Context

**Fields**

* Portfolio Name
* Scenario Name (Recommended)
* Fiscal Period

**Behavior**

* Read-only
* Pulled from locked scenario metadata

---

### 1.2 Top Metrics Strip (From Excel)

| Metric           | Value             | Delta vs Baseline |
| ---------------- | ----------------- | ----------------- |
| Total Investment | System calculated | +/- %             |
| Expected Value   | System calculated | +/- %             |

**Rules**

* Values are computed, never editable
* Delta is always relative to baseline
* Negative deltas shown explicitly (no soft language)

---

### 1.3 SECTION 1: THE ASK (Critical)

**Content**

* Single declarative decision statement

**Example**

> *Approve Scenario B: ₹120 Cr funded portfolio delivering ₹185 Cr value with controlled capacity risk.*

**Rules**

* Auto-generated from scenario state
* No free-text editing in MVP

---

### 1.4 SECTION 2: Executive Snapshot

**Table Structure**

| Metric               | Selected Scenario | Delta vs Baseline |
| -------------------- | ----------------- | ----------------- |
| Portfolio Value      |                   |                   |
| Total Cost           |                   |                   |
| Capacity Utilization |                   |                   |
| Risk Exposure        |                   |                   |

**Rules**

* Delta column is mandatory
* Any negative trade-off must be visible

---

### 1.5 SECTION 3: Initiative Decisions Summary

**Table Structure**

| Initiative | Decision | Value | Capacity | Risk |
| ---------- | -------- | ----- | -------- | ---- |

**Rules**

* Only initiatives marked Fund appear by default
* Paused / Stopped initiatives expandable
* Decisions are read-only (locked scenario)

---

### 1.6 SECTION 4: Capacity & Risk Signals

**Visual Indicators**

* Capacity status: Green / Red
* Risk concentration warning if applicable

**Rules**

* Red status always includes reason text
* No amber state

---

### 1.7 Footer — Decision Record

**Fields**

* Recommended By
* Decision Date
* Scenario ID

**Purpose**

* Audit trail
* Board defensibility

---

## 2. Scenario Workspace (Input UI)

This UI exists **only** to generate the one-pager.

### Components

* Initiative list with Fund / Pause / Stop toggles
* Live recalculated metrics panel
* Capacity breach indicator

### Constraints

* Cannot edit baseline
* Cannot finalize if overcapacity

---

## 3. Scenario Comparison View

**Layout**

* Baseline vs Scenario (side-by-side)

**Metrics Compared**

* Value
* Cost
* Capacity stress
* Risk exposure

**Rules**

* System-calculated only
* One scenario can be marked Recommended

---

## 4. Decision Confirmation View

**Purpose**

* Explicit moment of accountability

**Components**

* Final scenario summary
* Confirmation checkbox
* Finalize button

**Rule**

* Once finalized, scenario becomes immutable

---

## UX Philosophy (Derived from Excel)

* Fewer screens, heavier meaning
* Read-only wherever possible
* Numbers over narratives
* One decision per page

If users want more charts, they are not the target user.

---

## What the Excel Explicitly Tells Us NOT to Build

* No interactive dashboards
* No drill-down rabbit holes
* No operational timelines
* No editable executive views

The UI is a **decision lens**, not an analytics playground.

---

## MVP UI Success Criteria

* The digital one-pager matches the Excel intent exactly
* An executive understands the decision in under 60 seconds
* Every number has a system-owned source

If the UI feels "quiet but serious", it is correct.

---

## Next Recommended Files

* `/docs/decision-logic.md`
* `/docs/api-contracts.md`
* `/docs/executive-output-spec.md`

These will lock alignment between backend, frontend, and stakeholders.
