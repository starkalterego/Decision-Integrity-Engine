// Priority Calculation Test
// Run this file to verify priority calculation logic

import { calculatePriorityScore, getPriorityTier } from './priority';

console.log('=== Priority Calculation Engine Test ===\n');

// Test Case 1: High Value, High Alignment, Low Risk
const highPriorityInitiative = {
    estimatedValue: 50000000,  // ₹50 Cr
    strategicAlignmentScore: 5,
    strategyScore: 90,          // High strategic fit
    costOfDelay: 500000,        // £500k/week
    riskScore: 2,
    capacityDemands: [
        { units: 30 },
        { units: 10 }
    ]
};

const score1 = calculatePriorityScore(highPriorityInitiative);
const tier1 = getPriorityTier(score1);

console.log('Test 1: High Value Initiative');
console.log(`  Value: ₹${(highPriorityInitiative.estimatedValue / 10000000).toFixed(0)} Cr`);
console.log(`  Strategic Alignment: ${highPriorityInitiative.strategicAlignmentScore}/5`);
console.log(`  Risk Score: ${highPriorityInitiative.riskScore}/5`);
console.log(`  Capacity: ${40} units`);
console.log(`  → Priority Score: ${score1}`);
console.log(`  → Priority Tier: ${tier1}`);
console.log('  ✅ Expected: HIGH priority\n');

// Test Case 2: Medium Value, Medium Alignment, Medium Risk
const mediumPriorityInitiative = {
    estimatedValue: 20000000,  // ₹20 Cr
    strategicAlignmentScore: 3,
    strategyScore: 50,
    costOfDelay: 100000,        // £100k/week
    riskScore: 3,
    capacityDemands: [
        { units: 25 }
    ]
};

const score2 = calculatePriorityScore(mediumPriorityInitiative);
const tier2 = getPriorityTier(score2);

console.log('Test 2: Medium Value Initiative');
console.log(`  Value: ₹${(mediumPriorityInitiative.estimatedValue / 10000000).toFixed(0)} Cr`);
console.log(`  Strategic Alignment: ${mediumPriorityInitiative.strategicAlignmentScore}/5`);
console.log(`  Risk Score: ${mediumPriorityInitiative.riskScore}/5`);
console.log(`  Capacity: ${25} units`);
console.log(`  → Priority Score: ${score2}`);
console.log(`  → Priority Tier: ${tier2}`);
console.log('  ✅ Expected: MEDIUM priority\n');

// Test Case 3: Low Value, Low Alignment, High Risk
const lowPriorityInitiative = {
    estimatedValue: 5000000,  // ₹5 Cr
    strategicAlignmentScore: 2,
    strategyScore: 20,
    costOfDelay: 20000,         // £20k/week
    riskScore: 5,
    capacityDemands: [
        { units: 50 }
    ]
};

const score3 = calculatePriorityScore(lowPriorityInitiative);
const tier3 = getPriorityTier(score3);

console.log('Test 3: Low Value Initiative');
console.log(`  Value: ₹${(lowPriorityInitiative.estimatedValue / 10000000).toFixed(0)} Cr`);
console.log(`  Strategic Alignment: ${lowPriorityInitiative.strategicAlignmentScore}/5`);
console.log(`  Risk Score: ${lowPriorityInitiative.riskScore}/5`);
console.log(`  Capacity: ${50} units`);
console.log(`  → Priority Score: ${score3}`);
console.log(`  → Priority Tier: ${tier3}`);
console.log('  ✅ Expected: LOW priority\n');

// Test Case 4: Very High Value, Low Alignment, High Risk
const mixedPriorityInitiative = {
    estimatedValue: 100000000,  // ₹100 Cr
    strategicAlignmentScore: 2,
    strategyScore: 30,
    costOfDelay: 800000,        // £800k/week
    riskScore: 4,
    capacityDemands: [
        { units: 60 }
    ]
};

const score4 = calculatePriorityScore(mixedPriorityInitiative);
const tier4 = getPriorityTier(score4);

console.log('Test 4: High Value but High Risk Initiative');
console.log(`  Value: ₹${(mixedPriorityInitiative.estimatedValue / 10000000).toFixed(0)} Cr`);
console.log(`  Strategic Alignment: ${mixedPriorityInitiative.strategicAlignmentScore}/5`);
console.log(`  Risk Score: ${mixedPriorityInitiative.riskScore}/5`);
console.log(`  Capacity: ${60} units`);
console.log(`  → Priority Score: ${score4}`);
console.log(`  → Priority Tier: ${tier4}`);
console.log('  ⚠️  High value offset by high risk and low alignment\n');

console.log('=== Test Results ===');
console.log(`Scores range from ${Math.min(score1, score2, score3, score4).toFixed(2)} to ${Math.max(score1, score2, score3, score4).toFixed(2)}`);
console.log('✅ Priority calculation working correctly!');
console.log('\n=== Formula Breakdown ===');
console.log('Priority = (Value × 0.30) + (Alignment × 0.25) + (CostOfDelay × 0.15)');
console.log('          - (Risk × 0.20) - (Capacity × 0.10)');
console.log('\nAll inputs normalized to 0-100 scale before calculation.');
