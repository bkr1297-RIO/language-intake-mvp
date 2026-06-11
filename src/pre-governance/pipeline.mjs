import { classifyLanguage } from "./language-crossing-classifier.mjs";
import { createRIOProposalPacket, validateRIOProposalPacket } from "./proposal-packet.mjs";
import { CandidateEventRecordLogger } from "./candidate-event-record-logger.mjs";

export function createCandidatePacketFromLanguage({ rawLanguage, originNode, timestampMs }) {
  const classification = classifyLanguage(rawLanguage);
  const packet = createRIOProposalPacket({ rawLanguage, originNode, timestampMs, classification });
  const validation = validateRIOProposalPacket(packet);
  if (!validation.isValid) {
    return { success: false, stage: "validate_packet", errors: validation.errors };
  }
  return { success: true, classification, packet: validation.processedPacket };
}

export function runLocalPreGovernancePipeline({
  rawLanguage,
  originNode,
  timestampMs,
  loggerOptions = {},
  rawLanguagePayload,
} = {}) {
  const packetResult = createCandidatePacketFromLanguage({ rawLanguage, originNode, timestampMs });
  if (!packetResult.success) return packetResult;

  const logger = new CandidateEventRecordLogger(loggerOptions);
  try {
    const eventRecordId = logger.logCandidateEvent(packetResult.packet, rawLanguagePayload);
    return {
      success: true,
      classification: packetResult.classification,
      packet: packetResult.packet,
      event_record_id: eventRecordId,
      authority_status: "not_authorized",
      proof_status: "not_receipt",
      runtime_status: "not_executed",
    };
  } catch (error) {
    return {
      success: false,
      stage: "candidate_event_record_logger",
      errors: [{ field: "logger", keyword: "exception", message: error instanceof Error ? error.message : String(error) }],
    };
  }
}
