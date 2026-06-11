import { createHash } from "crypto";
import {
  RIO_ROLES,
  RIO_TARGET_SURFACES,
  RIO_CONSEQUENCE_LEVELS,
  RIO_GATE_RECOMMENDATIONS,
  RIO_APPROVAL_METHODS,
  RIO_CANDIDATE_EVENT_TYPES,
  FORBIDDEN_DOWNSTREAM_FIELDS,
  isOneOf,
} from "./types.mjs";
import { computePayloadHash } from "./canonical-json.mjs";

const RIO_NAMESPACE_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const UUID_V5_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-5[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const SHA256_REGEX = /^[0-9a-fA-F]{64}$/;

export function generateUUIDv5(namespaceUuid, name) {
  if (typeof namespaceUuid !== "string" || !/^[0-9a-fA-F-]{36}$/.test(namespaceUuid)) {
    throw new Error("UUIDv5 Error: namespaceUuid must be a UUID string.");
  }
  if (typeof name !== "string") throw new Error("UUIDv5 Error: name must be a string.");

  const nsBytes = Buffer.from(namespaceUuid.replace(/-/g, ""), "hex");
  if (nsBytes.length !== 16) throw new Error("UUIDv5 Error: namespace must decode to 16 bytes.");

  const hash = createHash("sha1").update(Buffer.concat([nsBytes, Buffer.from(name, "utf8")])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function deriveCandidateEventType(classification) {
  switch (classification.targetSurface) {
    case "private_reflection":
    case "exploratory_formation":
      return "classification_event";
    case "architecture_candidate":
    case "operative_candidate":
      return "packetization_event";
    case "external_communication_candidate":
      return "packetization_event";
    case "public_claim_candidate":
    case "source_of_truth_candidate":
      return "hold_event";
    case "runtime_action_candidate":
    case "invalid_or_conflicting":
      return "block_event";
    default:
      return "block_event";
  }
}

export function createRIOProposalPacket({ rawLanguage, originNode, timestampMs, classification }) {
  if (typeof rawLanguage !== "string") throw new Error("Packet Error: rawLanguage must be a string.");
  if (!isOneOf(originNode, RIO_ROLES)) throw new Error("Packet Error: invalid originNode.");
  if (!Number.isInteger(timestampMs)) throw new Error("Packet Error: timestampMs must be an integer.");
  if (!classification || typeof classification !== "object") throw new Error("Packet Error: classification must be an object.");
  if (!isOneOf(classification.targetSurface, RIO_TARGET_SURFACES)) throw new Error("Packet Error: invalid classification surface.");
  if (!isOneOf(classification.proposedConsequenceLevel, RIO_CONSEQUENCE_LEVELS)) throw new Error("Packet Error: invalid consequence level.");
  if (!isOneOf(classification.recommendedNextGate, RIO_GATE_RECOMMENDATIONS)) throw new Error("Packet Error: invalid next gate.");
  if (!Array.isArray(classification.matchedPatternIdentifiers)) throw new Error("Packet Error: matchedPatternIdentifiers must be an array.");

  const payloadHash = computePayloadHash(rawLanguage);
  const intentId = generateUUIDv5(RIO_NAMESPACE_UUID, `${payloadHash}:${timestampMs}`);
  const requiresAuth = classification.proposedConsequenceLevel !== "LOW_EXPLORATORY";
  const approvalMethod = requiresAuth ? "ED25519_HUMAN_PRINCIPAL_SIGNATURE" : "NONE";

  return {
    intent_id: intentId,
    timestamp_epoch_ms: timestampMs,
    origin_context: { origin_node: originNode },
    target_surface: classification.targetSurface,
    payload_hash: payloadHash,
    classification_metadata: {
      proposed_consequence_level: classification.proposedConsequenceLevel,
      matched_pattern_identifiers: [...classification.matchedPatternIdentifiers],
      recommended_next_gate: classification.recommendedNextGate,
    },
    authority_target_envelope: {
      authority_required: requiresAuth,
      authorized_by: null,
      approval_scope: requiresAuth ? "pre_governance_review_pending" : null,
      approval_method: approvalMethod,
      expires_at: requiresAuth ? timestampMs + 3600000 : null,
      revocation_path: requiresAuth ? `/abort/intent/${intentId.slice(0, 8)}` : null,
      approval_event_record_ref: null,
    },
    event_record_type: deriveCandidateEventType(classification),
  };
}

function pushError(errors, field, keyword, message) {
  errors.push({ field, keyword, message });
}

function checkAllowedKeys(obj, allowedKeys, path, errors) {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(obj)) {
    const field = path ? `${path}.${key}` : key;
    if (FORBIDDEN_DOWNSTREAM_FIELDS.includes(key)) {
      pushError(errors, field, "forbidden_field", "Proposal packet may not carry downstream authorization, execution, receipt, or ledger fields.");
    }
    if (!allowed.has(key)) {
      pushError(errors, field, "additionalProperties", "Property is not allowed in this pre-governance object.");
    }
  }
}

export function validateRIOProposalPacket(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { isValid: false, errors: [{ field: "root", keyword: "type", message: "Input must be a non-array object." }], processedPacket: null };
  }

  const rootKeys = [
    "intent_id",
    "timestamp_epoch_ms",
    "origin_context",
    "target_surface",
    "payload_hash",
    "classification_metadata",
    "authority_target_envelope",
    "event_record_type",
  ];
  checkAllowedKeys(input, rootKeys, "", errors);
  for (const key of rootKeys) {
    if (!(key in input) || input[key] === undefined) pushError(errors, key, "required", `Missing required property: ${key}`);
  }
  if (errors.length) return { isValid: false, errors, processedPacket: null };

  if (typeof input.intent_id !== "string" || !UUID_V5_REGEX.test(input.intent_id)) pushError(errors, "intent_id", "pattern", "intent_id must be a UUIDv5 string.");
  if (!Number.isInteger(input.timestamp_epoch_ms)) pushError(errors, "timestamp_epoch_ms", "type", "timestamp_epoch_ms must be an integer.");
  if (!isOneOf(input.target_surface, RIO_TARGET_SURFACES)) pushError(errors, "target_surface", "enum", "Invalid target surface.");
  if (typeof input.payload_hash !== "string" || !SHA256_REGEX.test(input.payload_hash)) pushError(errors, "payload_hash", "pattern", "payload_hash must be SHA-256 hex.");
  if (!isOneOf(input.event_record_type, RIO_CANDIDATE_EVENT_TYPES)) pushError(errors, "event_record_type", "enum", "Invalid candidate event record type.");

  const origin = input.origin_context;
  if (!origin || typeof origin !== "object" || Array.isArray(origin)) {
    pushError(errors, "origin_context", "type", "origin_context must be an object.");
  } else {
    checkAllowedKeys(origin, ["origin_node"], "origin_context", errors);
    if (!isOneOf(origin.origin_node, RIO_ROLES)) pushError(errors, "origin_context.origin_node", "enum", "Invalid origin node.");
  }

  const meta = input.classification_metadata;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    pushError(errors, "classification_metadata", "type", "classification_metadata must be an object.");
  } else {
    checkAllowedKeys(meta, ["proposed_consequence_level", "matched_pattern_identifiers", "recommended_next_gate"], "classification_metadata", errors);
    if (!isOneOf(meta.proposed_consequence_level, RIO_CONSEQUENCE_LEVELS)) pushError(errors, "classification_metadata.proposed_consequence_level", "enum", "Invalid consequence level.");
    if (!Array.isArray(meta.matched_pattern_identifiers) || !meta.matched_pattern_identifiers.every((x) => typeof x === "string")) pushError(errors, "classification_metadata.matched_pattern_identifiers", "type", "matched_pattern_identifiers must be an array of strings.");
    if (!isOneOf(meta.recommended_next_gate, RIO_GATE_RECOMMENDATIONS)) pushError(errors, "classification_metadata.recommended_next_gate", "enum", "Invalid next gate.");
  }

  const auth = input.authority_target_envelope;
  if (!auth || typeof auth !== "object" || Array.isArray(auth)) {
    pushError(errors, "authority_target_envelope", "type", "authority_target_envelope must be an object.");
  } else {
    checkAllowedKeys(auth, ["authority_required", "authorized_by", "approval_scope", "approval_method", "expires_at", "revocation_path", "approval_event_record_ref"], "authority_target_envelope", errors);
    if (typeof auth.authority_required !== "boolean") pushError(errors, "authority_target_envelope.authority_required", "type", "authority_required must be boolean.");
    if (auth.authorized_by !== null && typeof auth.authorized_by !== "string") pushError(errors, "authority_target_envelope.authorized_by", "type", "authorized_by must be string or null.");
    if (auth.approval_scope !== null && typeof auth.approval_scope !== "string") pushError(errors, "authority_target_envelope.approval_scope", "type", "approval_scope must be string or null.");
    if (!isOneOf(auth.approval_method, RIO_APPROVAL_METHODS)) pushError(errors, "authority_target_envelope.approval_method", "enum", "Invalid approval method.");
    if (auth.expires_at !== null && !Number.isInteger(auth.expires_at)) pushError(errors, "authority_target_envelope.expires_at", "type", "expires_at must be integer or null.");
    if (auth.revocation_path !== null && typeof auth.revocation_path !== "string") pushError(errors, "authority_target_envelope.revocation_path", "type", "revocation_path must be string or null.");
    if (auth.approval_event_record_ref !== null && typeof auth.approval_event_record_ref !== "string") pushError(errors, "authority_target_envelope.approval_event_record_ref", "type", "approval_event_record_ref must be string or null.");
  }

  if (errors.length) return { isValid: false, errors, processedPacket: null };
  return { isValid: true, errors: [], processedPacket: JSON.parse(JSON.stringify(input)) };
}
