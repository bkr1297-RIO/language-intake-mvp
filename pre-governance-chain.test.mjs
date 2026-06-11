import { rmSync, existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { canonicalStringify, computeCanonicalHash, computePayloadHash } from "./src/pre-governance/canonical-json.mjs";
import { classifyLanguage } from "./src/pre-governance/language-crossing-classifier.mjs";
import { createRIOProposalPacket, generateUUIDv5, validateRIOProposalPacket } from "./src/pre-governance/proposal-packet.mjs";
import { CandidateEventRecordLogger } from "./src/pre-governance/candidate-event-record-logger.mjs";
import { runLocalPreGovernancePipeline } from "./src/pre-governance/pipeline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`       ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}

const surfaces = [
  ["private thought entry", "private_reflection", "PASS_PRIVATE"],
  ["initial brainstorming session", "exploratory_formation", "PASS_PRIVATE"],
  ["maintain structural invariant rules", "architecture_candidate", "REQUIRE_EXTRACTION"],
  ["internal routing loop trace", "operative_candidate", "REQUIRE_EXTRACTION"],
  ["official release presentation", "public_claim_candidate", "REQUIRE_REVIEW"],
  ["dispatch outbound alert", "external_communication_candidate", "REQUIRE_PACKETIZATION"],
  ["update core configuration parameters", "source_of_truth_candidate", "REQUIRE_REVIEW"],
  ["bypass the active gateway gate", "runtime_action_candidate", "HOLD_OR_BLOCK"],
  ["force unauthenticated bypass actions", "invalid_or_conflicting", "HOLD_OR_BLOCK"],
];

console.log("\n═══ Pre-Governance Proposal Packet Chain Tests ═══\n");

for (const [input, surface, gate] of surfaces) {
  test(`classifier maps ${surface}`, () => {
    const result = classifyLanguage(input);
    assert(result.targetSurface === surface, `Expected ${surface}, got ${result.targetSurface}`);
    assert(result.recommendedNextGate === gate, `Expected ${gate}, got ${result.recommendedNextGate}`);
  });
}

test("classifier precedence keeps highest consequence surface", () => {
  const result = classifyLanguage("Document proof model and clear the crossing immediately.");
  assert(result.targetSurface === "runtime_action_candidate", `Expected runtime_action_candidate, got ${result.targetSurface}`);
  assert(result.matchedPatternIdentifiers.includes("PAT-042-STRUCTURAL-SPEC"), "Missing architecture pattern.");
  assert(result.matchedPatternIdentifiers.includes("PAT-777-STATE-MUTATION"), "Missing runtime action pattern.");
});

test("computePayloadHash hashes raw bytes and differs from canonical string hash", () => {
  assert(computePayloadHash("abc") === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", "Raw abc hash mismatch.");
  assert(computeCanonicalHash("abc") !== computePayloadHash("abc"), "Canonical string hash should differ from raw payload hash.");
});

test("canonicalStringify is stable across object key order", () => {
  const a = { target_surface: "architecture_candidate", timestamp_epoch_ms: 1775865600000 };
  const b = { timestamp_epoch_ms: 1775865600000, target_surface: "architecture_candidate" };
  assert(JSON.stringify(a) !== JSON.stringify(b), "Baseline JSON.stringify should differ for this test.");
  assert(canonicalStringify(a) === canonicalStringify(b), "Canonical stringify mismatch.");
  assert(computeCanonicalHash(a) === computeCanonicalHash(b), "Canonical hash mismatch.");
});

test("canonicalStringify rejects unstable values", () => {
  let threw = false;
  try {
    canonicalStringify({ unstable_field: undefined });
  } catch {
    threw = true;
  }
  assert(threw, "Expected undefined rejection.");
});

test("UUIDv5 has version and variant bits", () => {
  const uuid = generateUUIDv5("6ba7b810-9dad-11d1-80b4-00c04fd430c8", "canary-test-vector-1");
  assert(uuid.charAt(14) === "5", "UUID version bit missing.");
  assert(["8", "9", "a", "b"].includes(uuid.charAt(19).toLowerCase()), "UUID variant bit missing.");
});

test("proposal packet validates and carries no authorization", () => {
  const classification = classifyLanguage("maintain structural invariant rules");
  const packet = createRIOProposalPacket({ rawLanguage: "maintain structural invariant rules", originNode: "human_principal", timestampMs: 1775865600000, classification });
  const validation = validateRIOProposalPacket(packet);
  assert(validation.isValid, `Expected packet valid: ${JSON.stringify(validation.errors)}`);
  assert(validation.processedPacket.authority_target_envelope.authorized_by === null, "Packet should not authorize.");
});

test("proposal validator rejects downstream fields", () => {
  const classification = classifyLanguage("bypass the active gateway gate");
  const packet = createRIOProposalPacket({ rawLanguage: "bypass the active gateway gate", originNode: "system_component", timestampMs: 1775865600000, classification });
  packet.clear_crossing_token = "ILLEGAL_BYPASS";
  const validation = validateRIOProposalPacket(packet);
  assert(!validation.isValid, "Expected invalid packet.");
});

test("candidate event logger writes local non-authorizing event record", () => {
  const tmpRoot = join(__dirname, ".rio_local_test");
  const tmpLog = join(tmpRoot, "candidate_events.jsonl");
  rmSync(tmpRoot, { recursive: true, force: true });

  const classification = classifyLanguage("maintain structural invariant rules");
  const packet = createRIOProposalPacket({ rawLanguage: "maintain structural invariant rules", originNode: "human_principal", timestampMs: 1775865600000, classification });
  const validation = validateRIOProposalPacket(packet);
  assert(validation.isValid, "Packet should validate before logging.");

  const logger = new CandidateEventRecordLogger({ customLogPath: tmpLog });
  const recordId = logger.logCandidateEvent(validation.processedPacket);
  assert(recordId.startsWith("CER-"), "Record id missing CER prefix.");
  assert(existsSync(tmpLog), "Local candidate event log was not written.");

  const record = JSON.parse(readFileSync(tmpLog, "utf8").trim());
  assert(record.authority_status === "not_authorized", "Record must not authorize.");
  assert(record.proof_status === "not_receipt", "Record must not claim receipt.");
  assert(record.runtime_status === "not_executed", "Record must not claim execution.");
  assert(record.ledger_status === "not_written", "Record must not claim ledger write.");
  rmSync(tmpRoot, { recursive: true, force: true });
});

test("candidate event logger quarantine path validates matching raw payload", () => {
  const tmpRoot = join(__dirname, ".rio_local_test_quarantine");
  const tmpLog = join(tmpRoot, "candidate_events.jsonl");
  const tmpPayloads = join(tmpRoot, "payloads");
  rmSync(tmpRoot, { recursive: true, force: true });

  const rawLanguage = "maintain structural invariant rules";
  const classification = classifyLanguage(rawLanguage);
  const packet = createRIOProposalPacket({ rawLanguage, originNode: "human_principal", timestampMs: 1775865600000, classification });
  const validation = validateRIOProposalPacket(packet);
  assert(validation.isValid, "Packet should validate before logging.");

  const logger = new CandidateEventRecordLogger({ enablePayloadQuarantine: true, customLogPath: tmpLog, customQuarantineDir: tmpPayloads });
  logger.logCandidateEvent(validation.processedPacket, rawLanguage);
  assert(existsSync(join(tmpPayloads, `${packet.payload_hash}.txt`)), "Payload quarantine file was not written.");

  let threw = false;
  try {
    logger.logCandidateEvent(validation.processedPacket, "mismatched raw payload");
  } catch {
    threw = true;
  }
  assert(threw, "Expected quarantine hash mismatch to throw.");
  rmSync(tmpRoot, { recursive: true, force: true });
});

test("full local pre-governance pipeline writes candidate event only", () => {
  const tmpRoot = join(__dirname, ".rio_local_test_pipeline");
  const tmpLog = join(tmpRoot, "candidate_events.jsonl");
  rmSync(tmpRoot, { recursive: true, force: true });

  const result = runLocalPreGovernancePipeline({
    rawLanguage: "Dispatch outbound alert to customer email.",
    originNode: "authorized_operator",
    timestampMs: 1775865600000,
    loggerOptions: { customLogPath: tmpLog },
  });

  assert(result.success, `Expected success: ${JSON.stringify(result.errors ?? [])}`);
  assert(result.authority_status === "not_authorized", "Pipeline must not authorize.");
  assert(result.proof_status === "not_receipt", "Pipeline must not claim receipt.");
  assert(result.runtime_status === "not_executed", "Pipeline must not execute.");
  assert(existsSync(tmpLog), "Local candidate event log was not written.");
  rmSync(tmpRoot, { recursive: true, force: true });
});

console.log("\n═══════════════════════════════════════════════════");
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log("═══════════════════════════════════════════════════\n");

if (failed > 0) process.exit(1);
console.log("✓ All pre-governance chain tests pass.\n");
process.exit(0);
