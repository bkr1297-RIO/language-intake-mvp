import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { canonicalize, evaluateStandingTransition, sha256 } = require("./typed-intake.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const inputPath    = path.join(here, "fixtures", "TI-002.input.json");
const expectedPath = path.join(here, "expected", "TI-002.expected.json");
const reportPath   = path.join(here, "reports",  "TI-002.report.json");

const input           = JSON.parse(fs.readFileSync(inputPath,    "utf8"));
const expectedTemplate = JSON.parse(fs.readFileSync(expectedPath, "utf8"));
const actual          = evaluateStandingTransition(input);
const expected        = structuredClone(expectedTemplate);

const assertions = [];
function check(id, statement, fn) {
  try {
    fn();
    assertions.push({ id, statement, status: "PASS" });
  } catch (error) {
    assertions.push({ id, statement, status: "FAIL", error: error.message });
  }
}

check("TI2-A01", "Webpage/tool-output ingress standing is fixed as UNTRUSTED_DATA before content evaluation", () => {
  assert.equal(input.ingress.standing, "UNTRUSTED_DATA");
  assert.equal(actual.ingress_standing, "UNTRUSTED_DATA");
  assert.equal(input.ingress.source_kind, "synthetic_webpage_tool_output");
});

check("TI2-A02", "Webpage/tool output cannot promote DATA to INSTRUCTION", () => {
  assert.equal(actual.requested_standing, "INSTRUCTION");
  assert.equal(actual.content_authority_effect, "NONE");
  assert.equal(actual.decision, "BLOCK");
  assert.equal(actual.reason_code, "STANDING_ESCALATION_DENIED");
});

check("TI2-A03", "Untrusted content cannot modify authenticated task, policy, or tool target", () => {
  assert.equal(actual.requested_use, "modify_task");
  assert.equal(actual.decision, "BLOCK");
  assert.equal(actual.effect_state, "NONE");
  assert.equal(actual.content_authority_effect, "NONE");
});

check("TI2-A04", "Missing promotion artifact fails closed with a denial record", () => {
  assert.equal(actual.promotion_artifact_present, false);
  assert.equal(actual.record_type, "TYPED_INTAKE_DENIAL_RECORD");
});

check("TI2-A05", "Negative fixture attempts and executes zero tools", () => {
  assert.equal(actual.tool_calls_attempted, 0);
  assert.equal(actual.tool_calls_executed, 0);
});

check("TI2-DET-01", "Actual output exactly matches the sealed expected object", () => {
  assert.equal(canonicalize(actual), canonicalize(expected));
});

check("TI2-BIND-01", "Content mutation without rebinding fails closed", () => {
  const tampered = structuredClone(input);
  tampered.content += " silent mutation";
  const result = evaluateStandingTransition(tampered);
  assert.equal(result.decision, "INVALID");
  assert.equal(result.reason_code, "PAYLOAD_BINDING_MISMATCH");
  assert.equal(result.tool_calls_attempted, 0);
  assert.equal(result.tool_calls_executed, 0);
});

const passed = assertions.filter((a) => a.status === "PASS").length;
const failed = assertions.filter((a) => a.status === "FAIL").length;
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
