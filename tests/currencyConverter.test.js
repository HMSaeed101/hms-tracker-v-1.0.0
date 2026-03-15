// tests/currencyConverter.test.js
// Console-based unit tests for currency/formatting helpers

import { formatPKR, formatPKRFull, parsePKR, isRatesStale } from '../js/utils.js';

let passed = 0, failed = 0;

function assert(label, actual, expected) {
  const ok = actual === expected;
  if (ok) { console.log(`  ✓ ${label}`); passed++; }
  else    { console.error(`  ✗ ${label} — expected "${expected}", got "${actual}"`); failed++; }
}

function assertBool(label, actual, expected) {
  const ok = actual === expected;
  if (ok) { console.log(`  ✓ ${label}`); passed++; }
  else    { console.error(`  ✗ ${label} — expected ${expected}, got ${actual}`); failed++; }
}

// ── formatPKR (compact) ──
console.group('formatPKR — compact notation');

assert('zero',                       formatPKR(0),          'Rs 0');
assert('under 1,000',                formatPKR(500),        'Rs 500');
assert('exactly 1,000',              formatPKR(1000),       'Rs 1.0K');
assert('5,500 → 5.5K',               formatPKR(5500),       'Rs 5.5K');
assert('100,000 → 1.00L',            formatPKR(100000),     'Rs 1.00L');
assert('250,000 → 2.50L',            formatPKR(250000),     'Rs 2.50L');
assert('10,000,000 → 1.00Cr',        formatPKR(10000000),   'Rs 1.00Cr');
assert('negative 5,000 → -Rs 5.0K', formatPKR(-5000),      '-Rs 5.0K');
assert('null → Rs 0',                formatPKR(null),       'Rs 0');
assert('undefined → Rs 0',           formatPKR(undefined),  'Rs 0');

console.groupEnd();

// ── formatPKRFull (full with commas) ──
console.group('formatPKRFull — full notation');

assert('zero',        formatPKRFull(0),       'Rs 0');
assert('1,234',       formatPKRFull(1234),     'Rs 1,234');
assert('1,234,567',   formatPKRFull(1234567),  'Rs 1,234,567');
assert('rounds to int', formatPKRFull(1234.7), 'Rs 1,235');
assert('null → Rs 0', formatPKRFull(null),     'Rs 0');

console.groupEnd();

// ── parsePKR ──
console.group('parsePKR — string to number');

assert('plain number string',   String(parsePKR('12345')),   '12345');
assert('with Rs prefix',        String(parsePKR('Rs 12,345')), '12345');
assert('with commas',           String(parsePKR('1,23,456')),  '123456');
assert('decimal',               String(parsePKR('1234.56')),   '1234.56');
assert('empty string → 0',      String(parsePKR('')),          '0');
assert('non-numeric → 0',       String(parsePKR('abc')),       '0');

console.groupEnd();

// ── isRatesStale ──
console.group('isRatesStale');

assertBool('null lastUpdated → stale',   isRatesStale(null),          true);
assertBool('undefined → stale',          isRatesStale(undefined),     true);

// Recent date — today
const today = new Date().toISOString().split('T')[0];
assertBool('today → not stale',          isRatesStale(today),         false);

// 6 days ago → not stale (< 7)
const sixDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
assertBool('6 days ago → not stale',     isRatesStale(sixDaysAgo),    false);

// 7 days ago → stale
const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
assertBool('7 days ago → stale',         isRatesStale(sevenDaysAgo),  true);

// 30 days ago → stale
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
assertBool('30 days ago → stale',        isRatesStale(thirtyDaysAgo), true);

// Custom threshold
assertBool('3 days ago, threshold 5 → not stale',
  isRatesStale(new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], 5),
  false
);
assertBool('6 days ago, threshold 5 → stale',
  isRatesStale(new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], 5),
  true
);

console.groupEnd();

console.log(`\n${'─'.repeat(40)}`);
console.log(`currencyConverter: ${passed} passed, ${failed} failed`);
if (failed > 0) console.error('TESTS FAILED');
else console.log('ALL TESTS PASSED ✓');
