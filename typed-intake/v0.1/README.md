# TI-001 — Typed Intake Local Structural Proof

Status: local candidate implementation; offline; no external effects.

TI-001 demonstrates one narrow property from `TYPED-INTAKE-PROFILE-001@0.1`:

> Content entering as `UNTRUSTED_DATA` cannot promote itself into instruction or tool standing.

## Run

Requires Node.js 18 or later and no external dependencies.

```bash
node verify-ti001.mjs
```

The verifier writes `reports/TI-001.report.json` and exits nonzero if any assertion fails.

## What is enforced

- ingress standing is assigned outside the content;
- the payload is SHA-256 bound to its ingress envelope;
- a represented `DATA -> INSTRUCTION` promotion without an independent promotion artifact is blocked;
- requested tool language produces zero attempted and zero executed tool calls;
- novel attack wording receives the same structural denial;
- payload mutation without rebinding is invalid.

## Claim boundary

This is a deterministic fixture over a structurally represented standing transition. It does not parse arbitrary documents, detect every injection, invoke a model, enforce a production connector boundary, issue an execution grant, or produce a cryptographic MUS receipt. The `observed_attempt` object is fixture input supplied by the trusted harness; a future adapter must bind a real model proposal to the same evaluation contract.

## Office boundary

- Typed Intake evaluates ingress standing and requested promotion.
- RIO remains the downstream admissibility office.
- Sentinel remains the future point-of-use verifier.
- MUS remains the receipt/proof office.
- This package emits a local denial record, not execution authority.
