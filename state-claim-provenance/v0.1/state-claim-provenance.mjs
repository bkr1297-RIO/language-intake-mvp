const STATE_TERMS = /\b(approved|cleared|locked|sealed|authorized|ratified|canonical|final|executed|deployed|sent|deleted|created)\b/i;
const NEGATION = /\b(not|never|wasn['’]t|isn['’]t|didn['’]t|no)\b/i;
const HYPOTHETICAL = /\b(if|may|might|could|would|possibly|perhaps)\b/i;
const REQUEST = /^(please\b|can you\b|could you\b|would you\b|ask\b)/i;
const QUESTION = /\?\s*$/;
const QUOTED = /["'“‘][^"'”’]*(approved|cleared|locked|sealed|authorized|canonical|final)[^"'”’]*["'”’]/i;

export const NONE = "NONE";

export function classifyModality(text = "", context = {}) {
  if (!STATE_TERMS.test(text)) return { modality: "NONE", state_bearing: false };
  if (context.example === true || context.quoted === true || QUOTED.test(text)) {
    return { modality: "MENTION_ONLY", state_bearing: false };
  }
  if (NEGATION.test(text)) return { modality: "NEGATED", state_bearing: false };
  if (QUESTION.test(text)) return { modality: "INTERROGATIVE", state_bearing: false };
  if (REQUEST.test(text)) return { modality: "REQUEST", state_bearing: false };
  if (HYPOTHETICAL.test(text)) return { modality: "HYPOTHETICAL", state_bearing: false };
  if (context.operative_attempt === true) return { modality: "OPERATIVE_ATTEMPT", state_bearing: true };
  return { modality: "ASSERTION", state_bearing: true };
}

export function verifyEvidence(claim, evidence) {
  if (!claim?.state_bearing) return { status: "NOT_REQUIRED" };
  if (!evidence) return { status: "NOT_FOUND" };
  if (evidence.signature_valid !== true) return { status: "INVALID_SIGNATURE" };
  if (claim.subject_ref && evidence.subject_ref !== claim.subject_ref) return { status: "SUBJECT_MISMATCH" };
  if (claim.subject_hash && evidence.subject_hash !== claim.subject_hash) return { status: "SUBJECT_MISMATCH" };
  if (claim.subject_version && evidence.subject_version !== claim.subject_version) return { status: "VERSION_MISMATCH" };
  if (claim.asserted_actor && evidence.actor !== claim.asserted_actor) return { status: "IDENTITY_MISMATCH" };
  if (evidence.revoked === true) return { status: "REVOKED" };
  if (evidence.expired === true) return { status: "STALE" };
  if (evidence.scope_match === false) return { status: "SCOPE_MISMATCH" };
  if (evidence.authority_chain_valid === false) return { status: "CHAIN_BROKEN" };
  return { status: "VERIFIED" };
}

export function verifyAuthority(input, evidenceStatus) {
  if (!input.state_bearing) return "NOT_EVALUATED";
  if (evidenceStatus !== "VERIFIED" && input.direct_human_disposition !== true) return "NOT_EVALUATED";
  if (input.direct_human_disposition === true) {
    if (!input.actor_authenticated) return "IDENTITY_UNBOUND";
    if (!input.surface_operative) return "SURFACE_UNBOUND";
    if (!input.subject_ref) return "SUBJECT_UNBOUND";
    if (input.actor_role !== "ROOT_AUTHORITY" && input.actor_role !== "AUTHORIZED_APPROVER") return "ROLE_MISMATCH";
    return "VALID_DIRECT";
  }
  if (input.policy_revoked) return "POLICY_REVOKED";
  if (input.policy_expired) return "POLICY_EXPIRED";
  if (input.policy_scope_match === false) return "SCOPE_EXCEEDED";
  return input.authority_source_ref ? "VALID_DELEGATED" : "ABSENT";
}

export function evaluateStateClaim(input) {
  const semantic = classifyModality(input.text, input.context);
  const claim = { ...input, ...semantic };
  const evidence = verifyEvidence(claim, input.evidence);
  const authority = verifyAuthority(claim, evidence.status);
  const eligible = semantic.state_bearing && ["VALID_DIRECT", "VALID_DELEGATED"].includes(authority);

  const drift_flags = [];
  if (semantic.modality === "OPERATIVE_ATTEMPT" && authority !== "VALID_DIRECT") drift_flags.push("UNAUTHORIZED_PERFORMATIVE");
  if (semantic.state_bearing && evidence.status === "SUBJECT_MISMATCH") drift_flags.push("EVIDENCE_OVERCLAIM");
  if (input.simulates_governance_chain === true && evidence.status !== "VERIFIED") drift_flags.push("SIMULATED_GOVERNANCE_EVENT");

  return {
    semantic,
    evidence,
    authority: { status: authority },
    transition: { status: eligible ? "ELIGIBLE" : "NOT_ELIGIBLE" },
    runtime_effect: NONE,
    drift_flags,
  };
}
