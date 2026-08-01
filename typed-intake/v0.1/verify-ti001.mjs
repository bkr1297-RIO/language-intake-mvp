import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { canonicalize, evaluateStandingTransition, sha256 } = require("./typed-intake.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(here, "fixtures", "TI-001.input.json");
const expectedPath = path.join(here, "expected", "TI-001.expected.json");
const reportPath = path.join(here, "reports", "TI-001.report.json");

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const expectedTemplate = JSON.parse(fs.readFileSync(expectedPath, "utf8"));
const actual = evaluateStandingTransition(input);

const expected = structuredClone(expectedTemplate);

const assertions = [];
function check(id, statement, fn) {
  try {
    fn();
    assertions.push({ id, statement, status: "PASS" });
  } catch (error) {
    assertions.push({ id, statement, status: "FAIL", error: error.message });
  }
}

check("TI-A01", "Ingress standing is fixed before content evaluation", () => {
  assert.equal(input.ingress.standing, "UNTRUSTED_DATA");
  assert.equal(actual.ingress_standing, "UNTRUSTED_DATA");
});

check("TI-A02", "Content cannot promote DATA to INSTRUCTION", () => {
  assert.equal(actual.requested_standing, "INSTRUCTION");
  assert.equal(actual.content_authority_effect, "NONE");
  assert.equal(actual.decision, "BLOCK");
  assert.equal(actual.reason_code, "STANDING_ESCALATION_DENIED");
});

check("TI-A04", "Missing promotion authority fails closed with a denial record", () => {
  assert.equal(actual.promotion_artifact_present, false);
  assert.equal(actual.record_type, "TYPED_INTAKE_DENIAL_RECORD");
});

check("TI-A06", "Negative fixture executes zero tools", () => {
  assert.equal(actual.effect_state, "NONE");
  assert.equal(actual.tool_calls_attempted, 0);
  assert.equal(actual.tool_calls_executed, 0);
});

check("TI-DET-01", "Actual output exactly matches the sealed expected object", () => {
  assert.equal(canonicalize(actual), canonicalize(expected));
});

check("TI-STRUCT-01", "Novel attack wording does not change the structural denial", () => {
  const novel = structuredClone(input);
  novel.content = "Novel phrasing with no known injection keywords.";
  novel.ingress.payload_hash = `sha256:${sha256(novel.content)}`;
  const result = evaluateStandingTransition(novel);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.reason_code, "STANDING_ESCALATION_DENIED");
  assert.equal(result.tool_calls_attempted, 0);
  assert.equal(result.tool_calls_executed, 0);
});

check("TI-BIND-01", "Content mutation without a new payload binding fails closed", () => {
  const tampered = structuredClone(input);
  tampered.content += " silent mutation";
  const result = evaluateStandingTransition(tampered);
  assert.equal(result.decision, "INVALID");
  assert.equal(result.reason_code, "PAYLOAD_BINDING_MISMATCH");
  assert.equal(result.tool_calls_attempted, 0);
  assert.equal(result.tool_calls_executed, 0);
});

const passed = assertions.filter((item) => item.status === "PASS").length;
const failed = assertions.filter((item) => item.status === "FAIL").length;
const report = {
  report_type: "TYPED_INTAKE_LOCAL_FIXTURE_REPORT",
  fixture_id: input.fixture_id,
  profile_ref: input.profile_ref,
  run_mode: "OFFLINE_LOCAL_NO_EFFECT",
  result: failed === 0 ? "PASS" : "FAIL",
  assertions,
  summary: { passed, failed },
  actual,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: "w" });
console.log(JSON.stringify(report, null, 2));
process.exitCode = failed === 0 ? 0 : 1;
