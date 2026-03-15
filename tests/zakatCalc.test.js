// tests/zakatCalc.test.js
// Console-based unit tests for Zakat calculations

import { calcZakatEligible, calcZakatDue, calcNisab,
         calcPurificationProjection } from '../js/utils.js';

let passed = 0, failed = 0;

function assert(label, actual, expected, tolerance = 0.01) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) { console.log(`  ✓ ${label}`); passed++; }
  else    { console.error(`  ✗ ${label} — expected ${expected}, got ${actual}`); failed++; }
}

function assertBool(label, actual, expected) {
  if (actual === expected) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label} — expected ${expected}, got ${actual}`); failed++; }
}

// ── calcZakatEligible ──
console.group('calcZakatEligible');

assert('empty assets = 0',
  calcZakatEligible({ cash:[], physical:[], investments:[], liabilities:[] }),
  0
);

assert('cash only',
  calcZakatEligible({
    cash: [{ amountPKR: 200000 }],
    physical: [], investments: [], liabilities: []
  }),
  200000
);

assert('cash + investment',
  calcZakatEligible({
    cash:        [{ amountPKR: 100000 }],
    investments: [{ amountPKR: 150000 }],
    physical:    [{ currentPKR: 999999 }],  // physical is NOT zakatable
    liabilities: []
  }),
  250000
);

assert('physical items excluded from eligible',
  calcZakatEligible({
    cash: [],
    physical: [{ currentPKR: 500000 }],
    investments: [], liabilities: []
  }),
  0
);

assert('liabilities reduce eligible amount',
  calcZakatEligible({
    cash:        [{ amountPKR: 300000 }],
    investments: [{ amountPKR: 200000 }],
    physical:    [],
    liabilities: [{ amountPKR: 100000 }]
  }),
  400000
);

assert('eligible never goes below 0',
  calcZakatEligible({
    cash: [{ amountPKR: 10000 }],
    physical: [], investments: [],
    liabilities: [{ amountPKR: 500000 }]
  }),
  0
);

console.groupEnd();

// ── calcZakatDue ──
console.group('calcZakatDue');

assert('2.5% of Rs 400,000 = Rs 10,000', calcZakatDue(400000), 10000);
assert('2.5% of Rs 0 = 0',               calcZakatDue(0),      0);
assert('2.5% of Rs 1,000,000 = Rs 25,000', calcZakatDue(1000000), 25000);
assert('2.5% of Rs 285,000 (nisab) = Rs 7,125', calcZakatDue(285000), 7125);

console.groupEnd();

// ── calcNisab ──
console.group('calcNisab');

const testRates = { usdPKR: 278.5, gold10gPKR: 285000, silver1gPKR: 2800 };

// Gold nisab = (285000/10) * 85 = 28500 * 85 = 2,422,500
assert('gold nisab = (gold10g/10) × 85', calcNisab(testRates, 'gold'), 2422500);

// Silver nisab = 2800 * 595 = 1,666,000
assert('silver nisab = silver1g × 595', calcNisab(testRates, 'silver'), 1666000);

assert('default standard is gold', calcNisab(testRates), calcNisab(testRates, 'gold'));

assertBool('silver nisab < gold nisab (always)', calcNisab(testRates,'silver') < calcNisab(testRates,'gold'), true);

console.groupEnd();

// ── calcPurificationProjection ──
console.group('calcPurificationProjection');

// zakatDue Rs 10,000, velocity Rs 1,000/day → 10 days
assert('projection = zakatDue / velocity', calcPurificationProjection(10000, 1000), 10);
assert('projection rounds up (ceil)',       calcPurificationProjection(10001, 1000), 11);

assertBool('null when velocity = 0',    calcPurificationProjection(10000, 0)    === null, true);
assertBool('null when velocity < 0',    calcPurificationProjection(10000, -100) === null, true);
assertBool('null when zakatDue = 0',    calcPurificationProjection(0, 1000)     === null, true);
assertBool('null when zakatDue = null', calcPurificationProjection(null, 1000)  === null, true);

console.groupEnd();

console.log(`\n${'─'.repeat(40)}`);
console.log(`zakatCalc: ${passed} passed, ${failed} failed`);
if (failed > 0) console.error('TESTS FAILED');
else console.log('ALL TESTS PASSED ✓');
