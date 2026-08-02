# SCP-001 — State-Claim Provenance Local Proof

This executable research unit tests a single boundary:

> Semantic representation of a completed event does not establish that the event occurred and produces zero runtime effect.

## What is built

- Lightweight modality classification for quoted/example, negated, hypothetical, request, interrogative, assertion, and operative-attempt language.
- Evidence checks for signature, subject, version, actor, scope, freshness, revocation, and authority-chain mismatches.
- Direct human and human-derived delegated authority checks.
- Faceted output across semantic, evidence, authority, transition eligibility, runtime effect, and drift flags.
- An 18-case adversarial corpus derived from the Epistemic Handling Specimen.

## Run

```bash
node state-claim-provenance/v0.1/verify-scp001.mjs
```

The verifier writes `SCP-001.report.json` and exits non-zero on any failed case.

## Current boundary

This is a local deterministic proof unit. It does not mutate runtime state, query a production ledger, validate real cryptographic signatures, or authorize execution. `runtime_effect` is deliberately fixed to `NONE`; verified/direct authority only establishes transition eligibility in this slice.

## Built seam

SCP-001 extends TI-001:

- TI-001: content entering as DATA cannot promote itself into INSTRUCTION.
- SCP-001: language representing a state cannot promote itself into runtime EFFECT.

The next code seam is an adapter from SCP-001 faceted results into the existing RIO PDP/PEP decision contract and MUS receipt lookup.
