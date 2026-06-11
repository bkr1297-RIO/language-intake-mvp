import { mkdirSync, appendFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { validateRIOProposalPacket } from "./proposal-packet.mjs";
import { computeCanonicalHash, computePayloadHash } from "./canonical-json.mjs";
import {
  RIO_TARGET_SURFACES,
  RIO_GATE_RECOMMENDATIONS,
  RIO_CANDIDATE_EVENT_TYPES,
  FORBIDDEN_DOWNSTREAM_FIELDS,
} from "./types.mjs";

const NON_CLAIMS = Object.freeze([
  "not_authorization",
  "not_receipt",
  "not_runtime_proof",
  "not_ledger_entry",
  "not_execution",
]);

const CANONICAL_EVENT_RECORD_KEYS = Object.freeze([
  "event_record_id",
  "event_record_version",
  "created_at",
  "source",
  "event_record_type",
  "packet_hash",
  "payload_hash",
  "target_surface",
  "recommended_next_gate",
  "authority_status",
  "proof_status",
  "runtime_status",
  "ledger_status",
  "schema_version",
  "classifier_version",
  "validator_version",
  "non_claims",
  "raw_language_quarantine_debug",
]);

function assertEventRecordShape(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error("CandidateEventRecord validation failed: must be an object.");
  if (typeof record.event_record_id !== "string" || !/^CER-[0-9a-fA-F]{8}$/.test(record.event_record_id)) throw new Error("CandidateEventRecord validation failed: invalid event_record_id.");
  if (record.event_record_version !== "v0.1") throw new Error("CandidateEventRecord validation failed: invalid version.");
  if (typeof record.created_at !== "string" || Number.isNaN(Date.parse(record.created_at))) throw new Error("CandidateEventRecord validation failed: invalid created_at.");
  if (record.source !== "rio_proposal_packet_pipeline") throw new Error("CandidateEventRecord validation failed: invalid source.");
  if (!RIO_CANDIDATE_EVENT_TYPES.includes(record.event_record_type)) throw new Error("CandidateEventRecord validation failed: invalid event_record_type.");
  if (typeof record.packet_hash !== "string" || !/^[0-9a-fA-F]{64}$/.test(record.packet_hash)) throw new Error("CandidateEventRecord validation failed: invalid packet_hash.");
  if (typeof record.payload_hash !== "string" || !/^[0-9a-fA-F]{64}$/.test(record.payload_hash)) throw new Error("CandidateEventRecord validation failed: invalid payload_hash.");
  if (!RIO_TARGET_SURFACES.includes(record.target_surface)) throw new Error("CandidateEventRecord validation failed: invalid target_surface.");
  if (!RIO_GATE_RECOMMENDATIONS.includes(record.recommended_next_gate)) throw new Error("CandidateEventRecord validation failed: invalid recommended_next_gate.");
  if (record.authority_status !== "not_authorized") throw new Error("CandidateEventRecord validation failed: authority boundary leak.");
  if (record.proof_status !== "not_receipt") throw new Error("CandidateEventRecord validation failed: proof boundary leak.");
  if (record.runtime_status !== "not_executed") throw new Error("CandidateEventRecord validation failed: runtime boundary leak.");
  if (record.ledger_status !== "not_written") throw new Error("CandidateEventRecord validation failed: ledger boundary leak.");
  if (record.schema_version !== "rio-proposal-packet.v0.1") throw new Error("CandidateEventRecord validation failed: schema version mismatch.");
  if (record.classifier_version !== "language-crossing-classifier.v0.1") throw new Error("CandidateEventRecord validation failed: classifier version mismatch.");
  if (record.validator_version !== "rio-proposal-packet-validator.v0.1") throw new Error("CandidateEventRecord validation failed: validator version mismatch.");
  if (!Array.isArray(record.non_claims) || record.non_claims.length !== NON_CLAIMS.length) throw new Error("CandidateEventRecord validation failed: non_claims malformed.");
  for (const claim of NON_CLAIMS) {
    if (!record.non_claims.includes(claim)) throw new Error("CandidateEventRecord validation failed: non_claims missing required boundary.");
  }
  for (const key of Object.keys(record)) {
    if (!CANONICAL_EVENT_RECORD_KEYS.includes(key)) throw new Error(`CandidateEventRecord validation failed: rogue key ${key}.`);
  }
}

export class CandidateEventRecordLogger {
  constructor(options = {}) {
    this.enablePayloadQuarantine = options.enablePayloadQuarantine ?? false;
    this.logFilePath = options.customLogPath ?? join(".rio_local", "pre_governance", "candidate_events.jsonl");
    this.quarantineDirPath = options.customQuarantineDir ?? join(".rio_local", "pre_governance", "payloads");
  }

  logCandidateEvent(packet, rawLanguagePayload) {
    const validation = validateRIOProposalPacket(packet);
    if (!validation.isValid) throw new Error("Logger denied: proposal packet failed validation.");
    const validatedPacket = validation.processedPacket;

    for (const field of FORBIDDEN_DOWNSTREAM_FIELDS) {
      if (field in validatedPacket || (validatedPacket.authority_target_envelope && field in validatedPacket.authority_target_envelope)) {
        throw new Error(`Logger security violation: downstream field ${field} detected.`);
      }
    }

    const packetHash = computeCanonicalHash(validatedPacket);
    const record = {
      event_record_id: `CER-${packetHash.slice(0, 8)}`,
      event_record_version: "v0.1",
      created_at: new Date().toISOString(),
      source: "rio_proposal_packet_pipeline",
      event_record_type: validatedPacket.event_record_type,
      packet_hash: packetHash,
      payload_hash: validatedPacket.payload_hash,
      target_surface: validatedPacket.target_surface,
      recommended_next_gate: validatedPacket.classification_metadata.recommended_next_gate,
      authority_status: "not_authorized",
      proof_status: "not_receipt",
      runtime_status: "not_executed",
      ledger_status: "not_written",
      schema_version: "rio-proposal-packet.v0.1",
      classifier_version: "language-crossing-classifier.v0.1",
      validator_version: "rio-proposal-packet-validator.v0.1",
      non_claims: [...NON_CLAIMS],
    };

    if (this.enablePayloadQuarantine && rawLanguagePayload !== undefined) {
      if (computePayloadHash(rawLanguagePayload) !== validatedPacket.payload_hash) {
        throw new Error("Logger data invariant mismatch: raw payload does not match payload_hash.");
      }
      mkdirSync(this.quarantineDirPath, { recursive: true });
      writeFileSync(join(this.quarantineDirPath, `${validatedPacket.payload_hash}.txt`), rawLanguagePayload, "utf8");
      record.raw_language_quarantine_debug = "[LOCAL_QUARANTINE_STAGED]";
    }

    assertEventRecordShape(record);
    mkdirSync(dirname(this.logFilePath), { recursive: true });
    appendFileSync(this.logFilePath, JSON.stringify(record) + "\n", "utf8");
    return record.event_record_id;
  }
}

export { assertEventRecordShape };
