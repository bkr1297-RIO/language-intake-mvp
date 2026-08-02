import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateStateClaim } from "./state-claim-provenance.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(here, "fixtures", "SCP-001.corpus.json");
const reportPath = path.join(here, "SCP-001.report.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const results = [];

for (const testCase of corpus.cases) {
  const actual = evaluateStateClaim(testCase);
  const checks = [];
  const check = (name, fn) => {
    try {
      fn();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
    }
  };

  check("modality", () => assert.equal(actual.semantic.modality, testCase.expect.modality));
  check("evidence", () => assert.equal(actual.evidence.status, testCase.expect.evidence));
  if (testCase.expect.authority) {
    check("authority", () => assert.equal(actual.authority.status, testCase.expect.authority));
  }
  check("transition", () => assert.equal(actual.transition.status, testCase.expect.transition));
  check("runtime_effect", () => assert.equal(actual.runtime_effect, testCase.expect.effect));
  check("drift_flags", () => assert.deepEqual(actual.drift_flags, testCase.expect.drift));

  results.push({
    id: testCase.id,
    status: checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL",
    checks,
    actual,
  });
}

const passed = results.filter((item) => item.status === "PASS").length;
const failed = results.length - passed;
const report = {
  report_type: "STATE_CLAIM_PROVENANCE_LOCAL_FIXTURE_REPORT",
  corpus_id: corpus.corpus_id,
  run_mode: corpus.run_mode,
  result: failed === 0 ? "PASS" : "FAIL",
  summary: { cases: results.length, passed, failed },
  invariant: "Semantic representation alone produces zero runtime effect.",
  results,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`${passed} passed, ${failed} failed`);
console.log(JSON.stringify(report.summary));
process.exitCode = failed === 0 ? 0 : 1;
