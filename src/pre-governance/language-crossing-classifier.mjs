import {
  RIO_TARGET_SURFACES,
  RIO_GATE_RECOMMENDATIONS,
  RIO_CONSEQUENCE_LEVELS,
} from "./types.mjs";

const PATTERNS = Object.freeze({
  private_reflection: {
    id: "PAT-001-PRIVATE-MIND",
    pattern: /\b(private thought|personal scratchpad|internal reflection)\b/i,
  },
  exploratory_formation: {
    id: "PAT-002-EXPLORE-ZONE",
    pattern: /\b(sketching ideas|initial brainstorming|draft exploration)\b/i,
  },
  architecture_candidate: {
    id: "PAT-042-STRUCTURAL-SPEC",
    pattern: /\b(State S_t|Baseline B_c|Delta Δ|Risk R|invariant|components|execution flow|proof model|structural invariant)\b/i,
  },
  operative_candidate: {
    id: "PAT-050-OPERATIVE-STEP",
    pattern: /\b(internal routing loop|procedural step|mapping logic)\b/i,
  },
  public_claim_candidate: {
    id: "PAT-909-MARKET-ASSERTION",
    pattern: /\b(launch|economic genius|open-source community|official release|public release)\b/i,
  },
  external_communication_candidate: {
    id: "PAT-312-OUTBOUND-COMM",
    pattern: /\b(dispatch outbound|send email|transmit notification|customer email|vendor email)\b/i,
  },
  source_of_truth_candidate: {
    id: "PAT-101-TRUTH-MUTATION",
    pattern: /\b(mutate definition|override rule|update core configuration|source of truth|canonical policy)\b/i,
  },
  runtime_action_candidate: {
    id: "PAT-777-STATE-MUTATION",
    pattern: /\b(clear expired intents|reset state|approveAndExecute|bypass|clear the crossing|active gateway)\b/i,
  },
  invalid_or_conflicting: {
    id: "PAT-000-MALICIOUS-BYPASS",
    pattern: /\b(force unauthenticated bypass|corrupt signature matrix|skip approval|don't log this)\b/i,
  },
});

const SURFACE_PRECEDENCE = Object.freeze([
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

function consequenceAndGateFor(surface) {
  switch (surface) {
    case "private_reflection":
    case "exploratory_formation":
      return ["LOW_EXPLORATORY", "PASS_PRIVATE"];
    case "architecture_candidate":
    case "operative_candidate":
      return ["MEDIUM_REVIEW", "REQUIRE_EXTRACTION"];
    case "external_communication_candidate":
      return ["MEDIUM_REVIEW", "REQUIRE_PACKETIZATION"];
    case "public_claim_candidate":
    case "source_of_truth_candidate":
      return ["HIGH_CRITICAL_CROSSING", "REQUIRE_REVIEW"];
    case "runtime_action_candidate":
    case "invalid_or_conflicting":
      return ["HIGH_CRITICAL_CROSSING", "HOLD_OR_BLOCK"];
    default:
      return ["HIGH_CRITICAL_CROSSING", "HOLD_OR_BLOCK"];
  }
}

export function classifyLanguage(text) {
  if (typeof text !== "string") {
    throw new Error("Classifier Error: text must be a string.");
  }

  const matchedSurfaces = new Set();
  const matchedPatternIdentifiers = [];

  for (const surface of RIO_TARGET_SURFACES) {
    const entry = PATTERNS[surface];
    if (entry && entry.pattern.test(text)) {
      matchedSurfaces.add(surface);
      matchedPatternIdentifiers.push(entry.id);
    }
  }

  if (matchedSurfaces.size === 0) {
    matchedSurfaces.add("exploratory_formation");
    matchedPatternIdentifiers.push("PAT-DEFAULT-EXPLORATORY");
  }

  let targetSurface = "private_reflection";
  let maxWeight = -1;
  for (const surface of matchedSurfaces) {
    const weight = SURFACE_PRECEDENCE.indexOf(surface);
    if (weight > maxWeight) {
      maxWeight = weight;
      targetSurface = surface;
    }
  }

  const [proposedConsequenceLevel, recommendedNextGate] = consequenceAndGateFor(targetSurface);

  if (!RIO_TARGET_SURFACES.includes(targetSurface)) throw new Error("Classifier Error: invalid target surface.");
  if (!RIO_CONSEQUENCE_LEVELS.includes(proposedConsequenceLevel)) throw new Error("Classifier Error: invalid consequence level.");
  if (!RIO_GATE_RECOMMENDATIONS.includes(recommendedNextGate)) throw new Error("Classifier Error: invalid next gate.");

  return {
    targetSurface,
    proposedConsequenceLevel,
    recommendedNextGate,
    matchedPatternIdentifiers,
  };
}
