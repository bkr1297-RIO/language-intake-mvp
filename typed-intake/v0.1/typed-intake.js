"use strict";

const crypto = require("node:crypto");

const PROFILE_REF = "TYPED-INTAKE-PROFILE-001@0.1";
const DATA_STANDINGS = new Set(["UNTRUSTED_DATA", "REFERENCE_DATA", "PRIVATE_FIELD"]);
const CONTROL_STANDINGS = new Set(["AUTHENTICATED_TASK", "POLICY", "AUTHORIZATION"]);
const ENFORCEMENT_STANDINGS = new Set(["EXECUTION_GRANT"]);

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function evaluateStandingTransition(fixture) {
  const ingress = fixture && fixture.ingress;
  const attempt = fixture && fixture.observed_attempt;

  if (!fixture || fixture.profile_ref !== PROFILE_REF || !ingress || !attempt) {
    return decision("INVALID", "MALFORMED_FIXTURE", fixture, []);
  }

  if (!DATA_STANDINGS.has(ingress.standing)) {
    return decision("INVALID", "UNKNOWN_OR_NON_DATA_INGRESS_STANDING", fixture, []);
  }

  const actualPayloadHash = `sha256:${sha256(fixture.content)}`;
  if (actualPayloadHash !== ingress.payload_hash) {
    return decision("INVALID", "PAYLOAD_BINDING_MISMATCH", fixture, []);
  }

  const requestedStandingIsElevated =
    CONTROL_STANDINGS.has(attempt.requested_standing) ||
    ENFORCEMENT_STANDINGS.has(attempt.requested_standing) ||
    attempt.requested_standing === "INSTRUCTION";

  const prohibitedUseRequested = ingress.prohibited_uses.includes(attempt.requested_use);
  const independentPromotionPresent = fixture.promotion_artifact !== null;

  if ((requestedStandingIsElevated || prohibitedUseRequested) && !independentPromotionPresent) {
    return decision("BLOCK", "STANDING_ESCALATION_DENIED", fixture, [
      "TI-A01",
      "TI-A02",
      "TI-A04",
      "TI-A06",
    ]);
  }

  return decision("PASS", "NONE", fixture, ["TI-A01"]);
}

function decision(disposition, reasonCode, fixture, assertions) {
  const record = {
    record_type: "TYPED_INTAKE_DENIAL_RECORD",
    fixture_id: fixture && fixture.fixture_id ? fixture.fixture_id : null,
    profile_ref: fixture && fixture.profile_ref ? fixture.profile_ref : null,
    policy_ref: fixture && fixture.policy_ref ? fixture.policy_ref : null,
    ingress_ref: fixture && fixture.ingress ? fixture.ingress.envelope_id : null,
    task_ref: fixture && fixture.task ? fixture.task.task_id : null,
    ingress_standing: fixture && fixture.ingress ? fixture.ingress.standing : null,
    requested_standing: fixture && fixture.observed_attempt ? fixture.observed_attempt.requested_standing : null,
    requested_use: fixture && fixture.observed_attempt ? fixture.observed_attempt.requested_use : null,
    decision: disposition,
    reason_code: reasonCode,
    effect_state: "NONE",
    tool_calls_requested: fixture && fixture.observed_attempt && fixture.observed_attempt.tool_call ? 1 : 0,
    tool_calls_attempted: 0,
    tool_calls_executed: 0,
    promotion_artifact_present: Boolean(fixture && fixture.promotion_artifact),
    content_authority_effect: "NONE",
    assertions_verified: assertions,
    deterministic_test_time: fixture && fixture.test_time ? fixture.test_time : null,
  };

  return {
    ...record,
    integrity: {
      algorithm: "SHA-256",
      decision_record_hash: sha256(canonicalize(record)),
    },
  };
}

module.exports = {
  PROFILE_REF,
  canonicalize,
  evaluateStandingTransition,
  sha256,
};
