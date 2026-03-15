// tests/netWorthCalc.test.js
// Run: open tests/runner.html in browser, or node tests/netWorthCalc.test.js
// Console-based unit tests — no framework required

import { calcNetWorth, calcVelocity, historyToPoints } from '../js/utils.js';

let passed = 0, failed = 0;

function assert(label, actual, expected) {
  const ok = Math.abs(actual - expected) < 0.01;
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label} — expected ${expected}, got ${actual}`);
    failed++;
  }
}

function assertBool(label, actual, expected) {
  const ok = actual === expected;
  if (ok) { console.log(`  ✓ ${label}`); passed++; }
  else    { console.error(`  ✗ ${label} — expected ${expected}, got ${actual}`); failed++; }
}

console.group('calcNetWorth');

assert('empty assets = 0',
  calcNetWorth({ cash:[], physical:[], investments:[], liabilities:[] }),
  0
);

assert('cash only',
  calcNetWorth({
    cash: [{ amountPKR: 50000 }, { amountPKR: 30000 }],
    physical: [], investments: [], liabilities: []
  }),
  80000
);

assert('cash + investment - liability',
  calcNetWorth({
    cash:        [{ amountPKR: 100000 }],
    physical:    [{ currentPKR: 50000 }],
    investments: [{ amountPKR: 75000 }],
    liabilities: [{ amountPKR: 25000 }],
  }),
  200000
);

assert('liabilities exceed assets = negative net worth',
  calcNetWorth({
    cash: [{ amountPKR: 10000 }],
    physical: [], investments: [],
    liabilities: [{ amountPKR: 50000 }],
  }),
  -40000
);

assert('physical items use currentPKR not purchasePKR',
  calcNetWorth({
    cash: [],
    physical: [{ purchasePKR: 100000, currentPKR: 80000 }],
    investments: [], liabilities: []
  }),
  80000
);

console.groupEnd();

console.group('calcVelocity');

assert('empty snapshots = 0', calcVelocity([]), 0);
assert('single snapshot = 0', calcVelocity([{ date: '2026-01-01', valuePKR: 100000 }]), 0);

// 30 days apart, gained Rs 30,000 → Rs 1,000/day
const snap30 = [
  { date: '2026-01-01', valuePKR: 200000 },
  { date: '2026-01-31', valuePKR: 230000 },
];
assert('30-day gain Rs 30k = Rs 1k/day', calcVelocity(snap30), 1000);

// Negative velocity
const snapNeg = [
  { date: '2026-01-01', valuePKR: 200000 },
  { date: '2026-01-31', valuePKR: 170000 },
];
assert('30-day loss Rs 30k = -Rs 1k/day', calcVelocity(snapNeg), -1000);

// Same-date snapshots — must return 0, not a spurious value
const snapSameDate = [
  { date: '2026-03-14', valuePKR: 100000 },
  { date: '2026-03-14', valuePKR: 200000 },
];
assert('same-date snapshots = 0 (no phantom velocity)', calcVelocity(snapSameDate), 0);

console.groupEnd();

console.group('historyToPoints');

const history = [
  { date: '2026-01-01', valuePKR: 0 },
  { date: '2026-01-31', valuePKR: 100 },
];
const pts = historyToPoints(history, 200, 40);
assertBool('returns non-empty string', typeof pts === 'string' && pts.length > 0, true);
assertBool('contains comma-separated pairs', pts.includes(','), true);
assertBool('starts from 0,40 (min at bottom)', pts.startsWith('0.0,40.0'), true);
assertBool('ends at 200,0 (max at top)',       pts.endsWith('200.0,0.0'), true);

assertBool('returns empty string for < 2 points', historyToPoints([{ date:'2026-01-01', valuePKR:100 }]) === '', true);

console.groupEnd();

console.log(`\n${'─'.repeat(40)}`);
console.log(`netWorthCalc: ${passed} passed, ${failed} failed`);
if (failed > 0) console.error('TESTS FAILED');
else console.log('ALL TESTS PASSED ✓');
