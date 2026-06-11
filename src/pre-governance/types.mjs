/**
 * Pre-governance vocabulary for the local Governed Communication Firewall wedge.
 *
 * Boundary: these constants describe candidate-stage classification and routing only.
 * They do not authorize execution, generate receipts, or write ledger proof.
 */

export const RIO_ROLES = Object.freeze([
  "human_principal",
  "authorized_operator",
  "system_component",
  "model_agent",
  "external_agent",
]);

export const RIO_TARGET_SURFACES = Object.freeze([
  "private_reflection",
  "exploratory_formation",
  "architecture_candidate",
  "operative_candidate",
  "public_claim_candidate",
  "external_communication_candidate",
  "source_of_truth_candidate",
  "runtime_action_candidate",
  "invalid_or_conflicting",
]);

export const RIO_CONSEQUENCE_LEVELS = Object.freeze([
  "LOW_EXPLORATORY",
  "MEDIUM_REVIEW",
  "HIGH_CRITICAL_CROSSING",
]);

export const RIO_GATE_RECOMMENDATIONS = Object.freeze([
  "PASS_PRIVATE",
  "REQUIRE_EXTRACTION",
  "REQUIRE_REVIEW",
  "REQUIRE_PACKETIZATION",
  "HOLD_OR_BLOCK",
]);

export const RIO_APPROVAL_METHODS = Object.freeze([
  "NONE",
  "EXPLICIT_HUMAN_CONFIRMATION",
  "ED25519_HUMAN_PRINCIPAL_SIGNATURE",
  "QUORUM",
]);

export const RIO_CANDIDATE_EVENT_TYPES = Object.freeze([
  "classification_event",
  "hold_event",
  "block_event",
  "human_review_event",
  "packetization_event",
  "rio_review_requested_event",
]);

export const FORBIDDEN_DOWNSTREAM_FIELDS = Object.freeze([
  "authorized_state",
  "authorization_token",
  "execution_token",
  "receipt_hash",
  "ledger_entry_id",
  "clear_crossing_token",
]);

export function isOneOf(value, allowed) {
  return typeof value === "string" && allowed.includes(value);
}
