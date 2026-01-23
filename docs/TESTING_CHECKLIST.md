# Comprehensive Testing Checklist

## Pre-Production Testing Plan

**Date:** January 20, 2026  
**Objective:** Validate all features before production deployment  
**Estimated Time:** 2-3 hours for manual testing

---

## 1. Portfolio Management Tests

### 1.1 Create Portfolio
```
TEST: Create a new portfolio
1. Navigate to home page "/"
2. Click "Create New Portfolio" button
3. Enter portfolio details:
   - Name: "FY26 Digital Transformation"
   - Fiscal Period: "FY26"
   - Total Budget: ₹50 Crore
   - Total Capacity: 300 units
4. Click "Create"

EXPECTED RESULT:
✅ Portfolio created successfully
✅ Redirect to /portfolio/[id]/setup
✅ Portfolio status shows "Draft"
✅ Setup page displays portfolio details
```

### 1.2 Portfolio Lock
```
TEST: Portfolio should lock after scenarios are created
1. Create a portfolio (see 1.1)
2. Add some initiatives
3. Create a scenario
4. Return to setup page
5. Try to edit budget/capacity

EXPECTED RESULT:
✅ Edit controls are disabled
✅ Message shows "Portfolio is locked"
✅ Cannot modify constraints after scenarios exist
```

### 1.3 Constraint Validation
```
TEST: Ensure budget/capacity constraints are enforced
1. Create portfolio with:
   - Budget: ₹10 Crore
   - Capacity: 50 units
2. Try to create initiatives with total > constraints
3. Try to fund initiatives exceeding constraints in scenario

EXPECTED RESULT:
✅ Budget errors caught at scenario save
✅ Capacity errors caught at scenario save
✅ Clear error messages shown
✅ User prevented from overspend
```

---

## 2. Initiative Management Tests

### 2.1 Create Initiative
```
TEST: Create a complete initiative
1. Go to /portfolio/[id]/initiatives
2. Click "Add Initiative"
3. Fill form with all required fields:
   - Name: "CRM Modernization"
   - Sponsor: "VP Sales"
   - Delivery Owner: "IT Director"
   - Strategic Alignment: 4 (High)
   - Estimated Value: ₹5 Crore
   - Risk Score: 3 (Medium)
   - Capacity Demands:
     • Engineers: 20 units
     • QA: 5 units
4. Click "Save"

EXPECTED RESULT:
✅ Initiative appears in table
✅ Status shows "Incomplete" (until marked complete)
✅ All fields visible in table
✅ Data persists after page reload
```

### 2.2 Mark Complete
```
TEST: Mark initiative as complete
1. In initiatives table, find an initiative
2. Click "Mark Complete" button
3. Status should change

EXPECTED RESULT:
✅ Status changes to "Complete"
✅ Initiative now eligible for prioritization
✅ Completeness enforced at API level
```

### 2.3 Incomplete Block
```
TEST: Incomplete initiatives should not be prioritized
1. Create an initiative but DON'T mark complete
2. Try to create a scenario
3. Try to fund the incomplete initiative

EXPECTED RESULT:
✅ Incomplete initiatives visible but not prioritizable
✅ Error if trying to include incomplete
✅ Governance rule enforced
```

### 2.4 Edit Initiative
```
TEST: Edit existing initiative
1. In initiatives table, click edit icon
2. Modify a field (e.g., Estimated Value)
3. Click "Save"

EXPECTED RESULT:
✅ Changes persist
✅ Table updates immediately
✅ No need to refresh page
```

---

## 3. Baseline & Prioritization Tests

### 3.1 Baseline Calculation
```
TEST: Verify baseline is calculated correctly
1. Create portfolio with ₹100 Crore budget, 500 units capacity
2. Add 3 complete initiatives:
   - Initiative A: Value ₹30Cr, Capacity 100 units
   - Initiative B: Value ₹20Cr, Capacity 80 units
   - Initiative C: Value ₹15Cr, Capacity 50 units
3. Create a scenario (which clones baseline)
4. Check baseline metrics

EXPECTED RESULT:
✅ Baseline total value = ₹65 Crore
✅ Baseline total capacity = 230 units
✅ All complete initiatives included
✅ Baseline is read-only
```

### 3.2 Baseline Read-only
```
TEST: Baseline should be immutable
1. Navigate to /portfolio/[id]/scenarios
2. Look for baseline metrics display
3. Try to edit baseline directly

EXPECTED RESULT:
✅ No edit controls on baseline
✅ Clearly marked as read-only
✅ Cannot modify baseline values
```

---

## 4. Scenario Modeling Tests

### 4.1 Create Scenario
```
TEST: Create new scenario
1. Go to /portfolio/[id]/scenarios
2. Click "New Scenario"
3. Enter scenario name: "Aggressive Growth"
4. Add assumptions: "Prioritize revenue initiatives"
5. Click "Create"

EXPECTED RESULT:
✅ Scenario created with Draft status
✅ Redirect to /portfolio/[id]/scenarios/[scenarioId]
✅ Scenario workspace shows all initiatives
✅ Fund/Pause/Stop buttons visible
✅ All initiatives pre-set to "Pause" by default
```

### 4.2 Fund/Pause/Stop Decisions
```
TEST: Make decisions in scenario
1. In scenario workspace, find first initiative
2. Click "Fund" button
3. For second initiative, click "Pause"
4. For third initiative, click "Stop"

EXPECTED RESULT:
✅ Buttons highlight to show selection
✅ Metrics update in real-time
✅ Funded shows value, cost, capacity
✅ Paused initiative not counted
✅ Stopped initiative excluded
✅ Decisions auto-save after 500ms
```

### 4.3 Capacity Enforcement
```
TEST: Cannot exceed capacity in scenario
1. Create scenario
2. Fund initiatives totaling more than portfolio capacity
3. Try to save

EXPECTED RESULT:
✅ Capacity bar shows red when over
✅ Error message appears
✅ Cannot exceed capacity
✅ Clear explanation of constraint
```

### 4.4 Budget Enforcement
```
TEST: Cannot exceed budget in scenario
1. Create scenario
2. Fund initiatives totaling more than portfolio budget
3. Try to finalize

EXPECTED RESULT:
✅ Budget bar shows red when over
✅ Error message appears
✅ Cannot exceed budget
✅ Clear explanation of constraint
```

### 4.5 Decision Persistence
```
TEST: Decisions save correctly
1. Create scenario
2. Make decisions (fund some, pause others)
3. Refresh page
4. Navigate away and back

EXPECTED RESULT:
✅ Decisions persist after refresh
✅ Decisions persist in browser history
✅ Debounced save reduces API calls
✅ No double-submission issues
```

### 4.6 Finalization
```
TEST: Finalize scenario
1. Create scenario with valid decisions
2. Click "Finalize" button
3. Confirm finalization

EXPECTED RESULT:
✅ Scenario status changes to "Finalized"
✅ Cannot edit decisions after finalization
✅ Cannot change assumptions
✅ Read-only view after finalization
✅ Timestamp recorded
```

---

## 5. Scenario Comparison Tests

### 5.1 Compare Multiple Scenarios
```
TEST: Compare scenarios side-by-side
1. Create multiple scenarios with different decisions
2. Go to /portfolio/[id]/scenarios/compare
3. View comparison

EXPECTED RESULT:
✅ All scenarios displayed in table
✅ Key metrics shown for each:
   • Total Value
   • Total Cost
   • Capacity Utilization
   • Average Risk
   • Funded Count
✅ Deltas vs baseline calculated
✅ Recommendation ranking shown
✅ Metrics are formatted correctly (₹ signs, %)
```

### 5.2 Delta Calculation
```
TEST: Verify delta calculation accuracy
1. Create baseline with ₹50Cr value, 200 unit capacity
2. Create scenario funding more initiatives (+₹10Cr, +30 units)
3. Check comparison page

EXPECTED RESULT:
✅ Delta shows +₹10Cr
✅ Delta shows +30 units
✅ Delta shows +20% improvement
✅ Positive deltas highlighted green
✅ Negative deltas highlighted red
```

---

## 6. Executive Output Tests

### 6.1 Generate Executive Summary
```
TEST: View executive summary
1. Create a scenario with decisions
2. Click "Executive Summary" or view at /portfolio/[id]/output
3. Review the output

EXPECTED RESULT:
✅ Page loads quickly (<800ms first time, <50ms cached)
✅ All required sections present:
   • Portfolio name and fiscal period
   • Scenario name
   • Decision Ask (clearly stated)
   • Key Metrics (value, cost, capacity, risk)
   • Trade-off Summary (what changed, what gained)
   • Funded Initiatives List
   • Key Risks Identified
   • Scenario Comparison
   • Timestamp and scenario ID
✅ Professional formatting
✅ Board-ready presentation
```

### 6.2 PDF Download
```
TEST: Download executive summary as PDF
1. On executive summary page
2. Click "Download PDF" button
3. File should download

EXPECTED RESULT:
✅ PDF downloads successfully
✅ PDF filename includes portfolio/scenario name
✅ PDF includes all content
✅ PDF is print-optimized
✅ Formatting looks professional
```

### 6.3 Caching Performance
```
TEST: Verify session cache is working
1. Generate executive summary
2. Measure load time: ~800ms
3. Wait 5 seconds
4. Refresh page
5. Measure load time: ~<50ms

EXPECTED RESULT:
✅ Second load is much faster (cached)
✅ Cache expires after 2 minutes
✅ Cache can be manually cleared
```

### 6.4 Responsive Design
```
TEST: Executive summary on mobile/tablet
1. View executive summary on mobile browser
2. View on tablet
3. View on desktop

EXPECTED RESULT:
✅ Responsive layout works on all sizes
✅ Text is readable
✅ Tables are scrollable if needed
✅ PDF download works on all devices
✅ Print-friendly on all devices
```

---

## 7. Performance Tests

### 7.1 Page Load Speed
```
TEST: Measure page load times
1. Navigate to /portfolio/[id]/initiatives
   - Measure load time
   - Expected: <400ms
   
2. Navigate to /portfolio/[id]/scenarios/[id]
   - Measure load time
   - Expected: <400ms
   
3. Navigate to /portfolio/[id]/scenarios/compare
   - Measure load time
   - Expected: <400ms
   
4. Navigate to /portfolio/[id]/output
   - First load: <800ms
   - Subsequent loads: <50ms (cached)

EXPECTED RESULT:
✅ All page loads within expected time
✅ Parallel API calls working
✅ Caching effective
```

### 7.2 Decision Save Performance
```
TEST: Rapid decision changes
1. In scenario workspace, quickly change many decisions
2. Monitor network tab
3. Count API calls

EXPECTED RESULT:
✅ Rapid changes are debounced
✅ Many changes = 1 API call (not 10+)
✅ Debounce delay: ~500ms
✅ No double-submission
```

### 7.3 Cache Effectiveness
```
TEST: Verify caching reduces API calls
1. Open browser DevTools Network tab
2. Navigate to executive summary
3. Note number of API calls
4. Refresh page
5. Note number of API calls (should be 0 for cache hit)

EXPECTED RESULT:
✅ First load: Multiple API calls
✅ Second load (within 2 min): Uses cache
✅ No duplicate API calls for same data
```

---

## 8. Data Validation Tests

### 8.1 Completeness Validation
```
TEST: Ensure completeness rules enforced
1. Try to create initiative without a required field
2. Try to save without "Strategic Alignment Score"
3. Try to save without "Capacity Demands"

EXPECTED RESULT:
✅ Error message for missing required fields
✅ Cannot save incomplete initiative
✅ Form validation visible
✅ Clear instructions on what's missing
```

### 8.2 Value Validation
```
TEST: Ensure value constraints enforced
1. Try to enter negative budget
2. Try to enter negative capacity
3. Try to enter negative risk score

EXPECTED RESULT:
✅ Validation prevents negative values
✅ Error messages shown
✅ Values bounded appropriately
```

### 8.3 Data Type Validation
```
TEST: Ensure correct data types
1. Try to enter text in numeric field
2. Try to enter special characters in name
3. Try to enter very large numbers

EXPECTED RESULT:
✅ Only appropriate values accepted
✅ Error messages shown
✅ Input coerced to correct type
```

---

## 9. Navigation & UI Tests

### 9.1 Navigation Flow
```
TEST: Complete user journey
1. Home → Create Portfolio
2. Setup → Add Initiatives
3. Initiatives → Create Scenario
4. Scenario → Make Decisions
5. Decisions → Compare Scenarios
6. Compare → Executive Summary
7. Summary → Download PDF

EXPECTED RESULT:
✅ All links work
✅ Breadcrumbs show correct path
✅ Back button works
✅ No broken links
✅ Navigation is intuitive
```

### 9.2 Error Handling
```
TEST: Error cases
1. Try to access deleted portfolio
2. Try to access invalid scenario ID
3. Try to exceed constraints
4. Try to edit finalized scenario

EXPECTED RESULT:
✅ Proper error messages shown
✅ User guided to resolution
✅ No cryptic errors
✅ No blank pages
```

### 9.3 Responsive Design
```
TEST: Mobile, tablet, desktop
1. View all pages on mobile (375px width)
2. View on tablet (768px width)
3. View on desktop (1400px width)

EXPECTED RESULT:
✅ Responsive layout works
✅ Text readable
✅ Buttons clickable
✅ Tables scrollable if needed
✅ Forms usable
```

---

## 10. Governance Rules Tests

### 10.1 Completeness Rule
```
TEST: Incomplete initiatives cannot be used
1. Create incomplete initiative (missing a field)
2. Try to fund in scenario
3. Try to use in baseline

EXPECTED RESULT:
✅ Cannot mark as "complete" until all fields
✅ Cannot fund if incomplete
✅ Excluded from baseline
✅ Error message explains requirement
```

### 10.2 Capacity Rule
```
TEST: Capacity cannot be exceeded
1. Create scenario funding > portfolio capacity
2. Try to finalize

EXPECTED RESULT:
✅ Error prevents finalization
✅ Error shows how much over
✅ User must adjust decisions
✅ Clear message on how to fix
```

### 10.3 Budget Rule
```
TEST: Budget cannot be exceeded
1. Create scenario funding > portfolio budget
2. Try to finalize

EXPECTED RESULT:
✅ Error prevents finalization
✅ Error shows overbudget amount
✅ User must adjust decisions
✅ Clear message on how to fix
```

### 10.4 Finalization Rule
```
TEST: Finalized scenarios are read-only
1. Finalize a scenario
2. Try to change decisions
3. Try to edit assumptions

EXPECTED RESULT:
✅ Cannot modify decisions
✅ Cannot modify assumptions
✅ UI shows read-only state
✅ Clear that scenario is finalized
```

---

## Test Execution Checklist

Copy this checklist and use while testing:

```
Portfolio Management
  ☐ 1.1 Create Portfolio
  ☐ 1.2 Portfolio Lock
  ☐ 1.3 Constraint Validation

Initiative Management
  ☐ 2.1 Create Initiative
  ☐ 2.2 Mark Complete
  ☐ 2.3 Incomplete Block
  ☐ 2.4 Edit Initiative

Baseline & Prioritization
  ☐ 3.1 Baseline Calculation
  ☐ 3.2 Baseline Read-only

Scenario Modeling
  ☐ 4.1 Create Scenario
  ☐ 4.2 Fund/Pause/Stop
  ☐ 4.3 Capacity Enforcement
  ☐ 4.4 Budget Enforcement
  ☐ 4.5 Decision Persistence
  ☐ 4.6 Finalization

Scenario Comparison
  ☐ 5.1 Compare Scenarios
  ☐ 5.2 Delta Calculation

Executive Output
  ☐ 6.1 Generate Summary
  ☐ 6.2 PDF Download
  ☐ 6.3 Caching Performance
  ☐ 6.4 Responsive Design

Performance
  ☐ 7.1 Page Load Speed
  ☐ 7.2 Decision Save Performance
  ☐ 7.3 Cache Effectiveness

Data Validation
  ☐ 8.1 Completeness Validation
  ☐ 8.2 Value Validation
  ☐ 8.3 Data Type Validation

Navigation & UI
  ☐ 9.1 Navigation Flow
  ☐ 9.2 Error Handling
  ☐ 9.3 Responsive Design

Governance Rules
  ☐ 10.1 Completeness Rule
  ☐ 10.2 Capacity Rule
  ☐ 10.3 Budget Rule
  ☐ 10.4 Finalization Rule

TOTAL: 30 tests
```

---

## Success Criteria

All tests pass: ✅ **GO TO PRODUCTION**  
Minor issues found: 🟡 **Fix issues, then GO**  
Critical failures: 🔴 **Halt deployment, fix first**

---

## Notes & Known Issues

**Connection Pooling:**
- If database errors occur, restart dev server: `npm run dev`
- This is infrastructure config, not application code

**First Load vs Cached:**
- Executive summary first load: ~800ms
- Subsequent loads (within 2 min): ~50ms
- This is expected behavior (caching)

---

*Testing Plan Created: January 20, 2026*  
*All Features Ready for Testing*
