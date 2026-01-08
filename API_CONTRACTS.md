# API Contracts — Decision Integrity Engine (MVP)

---

## Purpose of This Document

This document defines the **authoritative API contracts** between frontend and backend for the Decision Integrity Engine MVP.

It is derived from:

* Backend governance logic
* Data model specification
* Frontend component requirements
* Executive output structure

These contracts are **non-negotiable**. If the frontend requires data not defined here, the backend model—not the UI—must be revisited.

---

## API Design Principles

* Backend is the sole decision authority
* All calculations are server-side
* Explicit error codes for governance violations
* No silent failures or partial success
* Deterministic, auditable responses

---

## Authentication & Roles (MVP)

**Roles**

* `PORTFOLIO_LEAD`
* `EXECUTIVE` (read-only)

Auth mechanism is intentionally minimal in MVP.

---

## Common Response Envelope

```json
{
  "success": true,
  "data": {},
  "errors": []
}
```

On failure:

```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "GOVERNANCE_VIOLATION",
      "message": "Human-readable explanation"
    }
  ]
}
```

---

## 1. Portfolio APIs

### Create Portfolio

`POST /api/portfolios`

**Request**

```json
{
  "name": "FY26 Growth Portfolio",
  "fiscalPeriod": "FY26",
  "totalBudget": 120000000,
  "totalCapacity": 450
}
```

**Response**

```json
{
  "portfolioId": "prt_001",
  "status": "DRAFT"
}
```

---

### Get Portfolio

`GET /api/portfolios/{portfolioId}`

Returns portfolio context and constraint boundaries.

---

## 2. Initiative APIs

### Create Initiative

`POST /api/initiatives`

**Request**

```json
{
  "portfolioId": "prt_001",
  "name": "CRM Modernization",
  "sponsor": "CRO",
  "deliveryOwner": "IT",
  "strategicAlignmentScore": 4,
  "estimatedValue": 35000000,
  "riskScore": 3,
  "capacityDemand": [
    { "role": "Engineer", "units": 40 },
    { "role": "QA", "units": 10 }
  ]
}
```

**Validation Errors**

* `INITIATIVE_INCOMPLETE`

---

### Get Initiatives

`GET /api/initiatives?portfolioId=prt_001`

Returns all initiatives with completeness status.

---

## 3. Baseline APIs

### Get Baseline Metrics

`GET /api/portfolios/{portfolioId}/baseline`

**Response**

```json
{
  "totalValue": 185000000,
  "totalCost": 120000000,
  "capacityUtilization": 1.12,
  "riskExposure": 7.5
}
```

Baseline is immutable.

---

## 4. Prioritization APIs

### Get Priority Ranking

`GET /api/portfolios/{portfolioId}/priorities`

Returns initiatives sorted by system-calculated priority score.

---

### Override Priority

`POST /api/initiatives/{initiativeId}/override-priority`

**Request**

```json
{
  "newRank": 1,
  "rationale": "Regulatory deadline override"
}
```

Requires `PORTFOLIO_LEAD` role.

---

## 5. Scenario APIs

### Create Scenario

`POST /api/scenarios`

**Request**

```json
{
  "portfolioId": "prt_001",
  "name": "Aggressive Growth",
  "assumptions": "Accelerated hiring in Q2"
}
```

---

### Update Scenario Decisions

`POST /api/scenarios/{scenarioId}/decisions`

**Request**

```json
{
  "decisions": [
    { "initiativeId": "init_01", "decision": "FUND" },
    { "initiativeId": "init_02", "decision": "PAUSE" }
  ]
}
```

Triggers recalculation.

---

### Finalize Scenario

`POST /api/scenarios/{scenarioId}/finalize`

Fails if capacity is breached.

---

## 6. Scenario Comparison APIs

### Compare Scenarios

`GET /api/scenarios/compare?baselineId=base&scenarioId=sc_001`

**Response**

```json
{
  "valueDelta": 25000000,
  "riskDelta": -1.2,
  "capacityDelta": -0.08
}
```

---

## 7. Executive Output APIs

### Generate Executive One-Pager

`POST /api/scenarios/{scenarioId}/export`

**Response**

```json
{
  "documentId": "doc_789",
  "downloadUrl": "/exports/doc_789.pdf"
}
```

---

## 8. Governance Decision Log APIs

### Get Decision Log

`GET /api/decisions?portfolioId=prt_001`

Returns immutable decision records.

---

## Error Codes (Standardized)

* `INITIATIVE_INCOMPLETE`
* `INVALID_LIFECYCLE_TRANSITION`
* `CAPACITY_EXCEEDED`
* `RATIONALE_REQUIRED`
* `UNAUTHORIZED_ACTION`

---

## MVP Contract Guarantees

* No incomplete initiative can be prioritized
* No scenario can finalize under hidden constraints
* No executive output without locked scenario
* No override without rationale

If an API allows bypassing these rules, it is a defect.
