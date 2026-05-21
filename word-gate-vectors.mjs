/**
 * Word Gate Runtime Vectors v0.1
 *
 * These tests translate the rio-system Word Gate examples into executable
 * language-intake checks.
 *
 * Run: node word-gate-vectors.mjs
 */

import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;

const engineCode = readFileSync(resolve(__dirname, 'engine.js'), 'utf8');
const script = new dom.window.Function(engineCode);
script();

const engine = dom.window.LanguageIntakeEngine;

let passed = 0;
let failed = 0;

function check(id, input, expected, description) {
  const result = engine.evaluateLanguage(input, 'inbound');
  const problems = [];

  if (expected.admission_status && result.admission_status !== expected.admission_status) {
    problems.push(`admission_status expected ${expected.admission_status}, got ${result.admission_status}`);
  }

  if (expected.recommended_route && result.recommended_route !== expected.recommended_route) {
    problems.push(`recommended_route expected ${expected.recommended_route}, got ${result.recommended_route}`);
  }

  if (expected.scribe_crossing_type !== undefined && result.scribe_crossing_type !== expected.scribe_crossing_type) {
    problems.push(`scribe_crossing_type expected ${expected.scribe_crossing_type}, got ${result.scribe_crossing_type}`);
  }

  if (problems.length === 0) {
    console.log(`PASS ${id}: ${description}`);
    passed++;
  } else {
    console.log(`FAIL ${id}: ${description}`);
    for (const problem of problems) console.log(`  ${problem}`);
    failed++;
  }
}

console.log('\nWord Gate Runtime Vectors v0.1\n');

check(
  'WG-001',
  'Lock this wording as stable for review.',
  { admission_status: 'no_mark', recommended_route: 'no_action', scribe_crossing_type: null },
  'lock wording does not equal commit or execution'
);

check(
  'WG-002',
  'Draft the message for me, but do not send it.',
  { admission_status: 'no_mark', recommended_route: 'no_action', scribe_crossing_type: null },
  'draft does not equal send'
);

check(
  'WG-003',
  'The receipt proves what happened yesterday, so keep it as record only.',
  { admission_status: 'no_mark', recommended_route: 'no_action', scribe_crossing_type: null },
  'receipt does not equal future permission'
);

check(
  'WG-004',
  'Send me your thoughts on this.',
  { admission_status: 'no_mark', recommended_route: 'no_action', scribe_crossing_type: null },
  'send me thoughts does not equal external send action'
);

check(
  'WG-005',
  'Approve the draft for review, but do not execute it.',
  { admission_status: 'no_mark', recommended_route: 'no_action', scribe_crossing_type: null },
  'approve draft does not equal execute'
);

check(
  'WG-006',
  'Release this as the public production version now.',
  { admission_status: 'scribe_mark', recommended_route: 'rio_authorization', scribe_crossing_type: 'delegation_to_action' },
  'release to public production is an action crossing'
);

check(
  'WG-007',
  'Commit this to the repo.',
  { admission_status: 'scribe_mark', recommended_route: 'rio_authorization', scribe_crossing_type: 'delegation_to_action' },
  'repo commit is an action crossing'
);

check(
  'WG-008',
  'We discussed this before, so memory should count as consent.',
  { admission_status: 'constitutional_non_admission', recommended_route: 'constitutional_non_admission' },
  'memory does not equal consent'
);

check(
  'WG-009',
  'This has happened several times, so treat it as a standing order.',
  { admission_status: 'scribe_mark', recommended_route: 'clarify_with_human' },
  'recurrence does not equal standing order'
);

check(
  'WG-010',
  'The tests passed, so deploy it to production.',
  { admission_status: 'scribe_mark', recommended_route: 'rio_authorization', scribe_crossing_type: 'evidence_to_permission' },
  'tests passed does not equal deploy without authorization'
);

check(
  'WG-011',
  'The PR was approved, so release it to production.',
  { admission_status: 'scribe_mark', recommended_route: 'rio_authorization', scribe_crossing_type: 'evidence_to_permission' },
  'PR approved does not equal production release'
);

console.log(`\nRESULTS: ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
process.exit(0);
