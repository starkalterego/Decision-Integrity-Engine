# Manual API Testing Guide

This guide provides curl commands to manually test all API endpoints.

## Setup
```bash
# Set your base URL
BASE_URL="http://localhost:3000"

# Or if using production
# BASE_URL="https://your-production-url.com"
```

## 1. Portfolio APIs

### Create Portfolio
```bash
curl -X POST ${BASE_URL}/api/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FY26 Growth Portfolio",
    "fiscalPeriod": "FY26-Q1",
    "totalBudget": 120000000,
    "totalCapacity": 450
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "uuid-here",
    "status": "DRAFT"
  },
  "errors": []
}
```

### Get All Portfolios
```bash
curl ${BASE_URL}/api/portfolios
```

### Get Portfolio by ID
```bash
PORTFOLIO_ID="your-portfolio-id-here"
curl ${BASE_URL}/api/portfolios/${PORTFOLIO_ID}
```

### Get Baseline Metrics
```bash
curl ${BASE_URL}/api/portfolios/${PORTFOLIO_ID}/baseline
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 185000000,
    "totalCost": 185000000,
    "capacityUtilization": 0.94,
    "riskExposure": 3.2,
    "initiativeCount": 5
  },
  "errors": []
}
```

### Get Priority Ranking
```bash
curl ${BASE_URL}/api/portfolios/${PORTFOLIO_ID}/priorities
```

---

## 2. Initiative APIs

### Create Complete Initiative
```bash
curl -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "CRM Modernization",
    "sponsor": "CRO",
    "deliveryOwner": "IT Team",
    "strategicAlignmentScore": 4,
    "estimatedValue": 35000000,
    "riskScore": 3,
    "capacityDemand": [
      { "role": "Engineer", "units": 40 },
      { "role": "QA", "units": 10 }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "CRM Modernization",
    "priorityScore": 42.5,
    "isComplete": true,
    ...
  },
  "errors": []
}
```

### Test Incomplete Initiative (Should Fail)
```bash
curl -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Incomplete Initiative"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "data": null,
  "errors": [{
    "code": "INITIATIVE_INCOMPLETE",
    "message": "Sponsor is required, Delivery owner is required, ..."
  }]
}
```

### Get Initiatives for Portfolio
```bash
curl "${BASE_URL}/api/initiatives?portfolioId=${PORTFOLIO_ID}"
```

### Get Initiative by ID
```bash
INITIATIVE_ID="your-initiative-id-here"
curl ${BASE_URL}/api/initiatives/${INITIATIVE_ID}
```

### Update Initiative
```bash
curl -X PUT ${BASE_URL}/api/initiatives/${INITIATIVE_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Modernization v2",
    "estimatedValue": 40000000
  }'
```

---

## 3. Scenario APIs

### Create Scenario
```bash
curl -X POST ${BASE_URL}/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Aggressive Growth",
    "assumptions": "Accelerated hiring in Q2, additional budget approved"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Aggressive Growth",
    "assumptions": "Accelerated hiring in Q2, additional budget approved",
    "isFinalized": false
  },
  "errors": []
}
```

### Test Scenario Without Assumptions (Should Fail)
```bash
curl -X POST ${BASE_URL}/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "No Assumptions",
    "assumptions": ""
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "data": null,
  "errors": [{
    "code": "VALIDATION_ERROR",
    "message": "Scenario assumptions are mandatory per governance rules"
  }]
}
```

### Get Scenarios for Portfolio
```bash
curl "${BASE_URL}/api/scenarios?portfolioId=${PORTFOLIO_ID}"
```

### Get Scenario by ID
```bash
SCENARIO_ID="your-scenario-id-here"
curl ${BASE_URL}/api/scenarios/${SCENARIO_ID}
```

### Update Scenario Decisions
```bash
curl -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      { "initiativeId": "'${INITIATIVE_ID}'", "decision": "FUND" }
    ]
  }'
```

### Finalize Scenario
```bash
curl -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/finalize
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "isFinalized": true
  },
  "errors": []
}
```

**Failure (Capacity Breach):**
```json
{
  "success": false,
  "data": null,
  "errors": [{
    "code": "CAPACITY_EXCEEDED",
    "message": "Cannot finalize: Capacity constraint breached. Total capacity demand (500) exceeds limit (450)"
  }]
}
```

### Test Modifying Finalized Scenario (Should Fail)
```bash
curl -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      { "initiativeId": "'${INITIATIVE_ID}'", "decision": "STOP" }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "data": null,
  "errors": [{
    "code": "INVALID_LIFECYCLE_TRANSITION",
    "message": "Cannot modify decisions for finalized scenario"
  }]
}
```

---

## 4. Scenario Comparison API

### Compare Two Scenarios
```bash
BASELINE_ID="baseline-scenario-id"
SCENARIO_ID="comparison-scenario-id"

curl "${BASE_URL}/api/scenarios/compare?baselineId=${BASELINE_ID}&scenarioId=${SCENARIO_ID}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "baseline": {
      "name": "Baseline",
      "totalValue": 185000000,
      "capacityUtilization": 0.94,
      "avgRisk": 3.2
    },
    "scenario": {
      "name": "Aggressive Growth",
      "totalValue": 210000000,
      "capacityUtilization": 0.89,
      "avgRisk": 3.0
    },
    "deltas": {
      "valueDelta": 25000000,
      "riskDelta": -0.2,
      "capacityDelta": -0.05
    }
  },
  "errors": []
}
```

---

## 5. Executive Output API

### Get Executive Summary
```bash
curl ${BASE_URL}/api/scenarios/${SCENARIO_ID}/executive-summary
```

**Expected Response (Finalized Scenario Only):**
```json
{
  "success": true,
  "data": {
    "portfolio": {...},
    "scenario": {...},
    "decisionAsk": "Approve Aggressive Growth — a ₹120 Cr funded portfolio...",
    "metrics": {...},
    "deltas": {...},
    "decisions": {
      "fund": [...],
      "pause": [...],
      "stop": [...]
    },
    "tradeOffSummary": {...},
    "keyRisks": [...]
  },
  "errors": []
}
```

**Failure (Not Finalized):**
```json
{
  "success": false,
  "data": null,
  "errors": [{
    "code": "INVALID_STATE",
    "message": "Executive summary only available for finalized scenarios"
  }]
}
```

---

## Complete End-to-End Test Sequence

```bash
#!/bin/bash

# Set base URL
BASE_URL="http://localhost:3000"

echo "=== Step 1: Create Portfolio ==="
PORTFOLIO_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Portfolio",
    "fiscalPeriod": "FY26-Q1",
    "totalBudget": 100000000,
    "totalCapacity": 400
  }')
echo $PORTFOLIO_RESPONSE | jq '.'
PORTFOLIO_ID=$(echo $PORTFOLIO_RESPONSE | jq -r '.data.portfolioId')
echo "Portfolio ID: $PORTFOLIO_ID"

echo -e "\n=== Step 2: Create Initiative 1 ==="
INIT1_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Initiative One",
    "sponsor": "CEO",
    "deliveryOwner": "IT",
    "strategicAlignmentScore": 5,
    "estimatedValue": 50000000,
    "riskScore": 2,
    "capacityDemand": [
      { "role": "Engineer", "units": 100 }
    ]
  }')
echo $INIT1_RESPONSE | jq '.'
INIT1_ID=$(echo $INIT1_RESPONSE | jq -r '.data.id')

echo -e "\n=== Step 3: Create Initiative 2 ==="
INIT2_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Initiative Two",
    "sponsor": "CTO",
    "deliveryOwner": "Engineering",
    "strategicAlignmentScore": 4,
    "estimatedValue": 40000000,
    "riskScore": 3,
    "capacityDemand": [
      { "role": "Engineer", "units": 150 }
    ]
  }')
echo $INIT2_RESPONSE | jq '.'
INIT2_ID=$(echo $INIT2_RESPONSE | jq -r '.data.id')

echo -e "\n=== Step 4: Get Priority Ranking ==="
curl -s ${BASE_URL}/api/portfolios/${PORTFOLIO_ID}/priorities | jq '.'

echo -e "\n=== Step 5: Get Baseline ==="
curl -s ${BASE_URL}/api/portfolios/${PORTFOLIO_ID}/baseline | jq '.'

echo -e "\n=== Step 6: Create Scenario ==="
SCENARIO_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Test Scenario",
    "assumptions": "Normal hiring pace, no budget constraints"
  }')
echo $SCENARIO_RESPONSE | jq '.'
SCENARIO_ID=$(echo $SCENARIO_RESPONSE | jq -r '.data.id')

echo -e "\n=== Step 7: Set Decisions ==="
curl -s -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      { "initiativeId": "'${INIT1_ID}'", "decision": "FUND" },
      { "initiativeId": "'${INIT2_ID}'", "decision": "FUND" }
    ]
  }' | jq '.'

echo -e "\n=== Step 8: Finalize Scenario ==="
curl -s -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/finalize | jq '.'

echo -e "\n=== Step 9: Get Executive Summary ==="
curl -s ${BASE_URL}/api/scenarios/${SCENARIO_ID}/executive-summary | jq '.'

echo -e "\n=== Test Complete ==="
```

---

## Testing Governance Rules

### Test 1: Initiative Completeness
```bash
# Should fail with INITIATIVE_INCOMPLETE
curl -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Incomplete"
  }'
```

### Test 2: Capacity Constraints
```bash
# Create initiative that exceeds capacity
curl -X POST ${BASE_URL}/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "Large Initiative",
    "sponsor": "CEO",
    "deliveryOwner": "IT",
    "strategicAlignmentScore": 5,
    "estimatedValue": 50000000,
    "riskScore": 2,
    "capacityDemand": [
      { "role": "Engineer", "units": 500 }
    ]
  }'

# Fund it in scenario and try to finalize
# Should fail with CAPACITY_EXCEEDED
```

### Test 3: Assumptions Mandate
```bash
# Should fail with VALIDATION_ERROR
curl -X POST ${BASE_URL}/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "'${PORTFOLIO_ID}'",
    "name": "No Assumptions",
    "assumptions": ""
  }'
```

### Test 4: Finalization Immutability
```bash
# Finalize a scenario first
curl -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/finalize

# Try to modify decisions - should fail with INVALID_LIFECYCLE_TRANSITION
curl -X POST ${BASE_URL}/api/scenarios/${SCENARIO_ID}/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      { "initiativeId": "'${INIT1_ID}'", "decision": "STOP" }
    ]
  }'
```

---

## Troubleshooting

### Check Database Connection
```bash
# In frontend directory
npm run prisma studio
```

### View Logs
```bash
# Development server logs show all API calls
npm run dev
```

### Reset Database (if needed)
```bash
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### Common Issues

1. **CORS errors**: Make sure you're calling from the same origin or configure CORS
2. **404 errors**: Check that the Next.js dev server is running
3. **Database errors**: Verify DATABASE_URL in .env file
4. **Validation errors**: Check that all required fields are included in request body
