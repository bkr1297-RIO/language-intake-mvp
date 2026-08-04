# TI-001 & TI-002 — Typed Intake Local Structural Proofs

Status: local candidate implementations; offline; no external effects.

These fixtures demonstrate narrow properties from `TYPED-INTAKE-PROFILE-001@0.1`:

> Content entering as `UNTRUSTED_DATA` cannot promote itself into instruction or tool standing.

## Local Fixtures

### TI-001 — Synthetic Email Body Injection

Verifier: `node verify-ti001.mjs`
Expected: 7 passed, 0 failed
Report hash: `740a8013de79e6afd66dca7daa9aed37afd15848c902c262849804c5ca1225d5`

Demonstrates: synthetic email body containing an embedded instruction attempting to
exfiltrate secrets and invoke a tool is blocked at the intake boundary.

### TI-002 — Synthetic Webpage Tool-Output Injection

Verifier: `node verify-ti002.mjs`
Expected: 7 passed, 0 failed
Report hash: `ed5bb76b949c314715855a3a70b09657d4fb1e2fb03bab40b13dbb57af9dd427`

Demonstrates: synthetic webpage tool output containing an embedded instruction attempting
to modify the authenticated task, redirect the tool target, and POST data to an external
endpoint is blocked at the intake boundary.

## Run

Requires Node.js 18 or later and no external dependencies.

```bash
node verify-ti001.mjs
node verify-ti002.mjs
```

Each verifier writes its report to `reports/TI-00N.report.json` and exits nonzero if
any assertion fails. Reports are byte-identical across consecutive runs on the same fixture.

## What is enforced

- ingress standing is assigned outside the content;
- the payload is SHA-256 bound to its ingress envelope;
- a represented `DATA -> INSTRUCTION` promotion without an independent promotion artifact is blocked;
- requested tool language produces zero attempted and zero executed tool calls;
- content mutation without rebinding is invalid;
- the structural denial is independent of specific wording.

## Claim boundary

These are deterministic fixtures over structurally represented standing transitions. They do
not parse arbitrary documents, detect every injection, invoke a model, enforce a production
connector boundary, issue an execution grant, or produce a cryptographic MUS receipt. The
`observed_attempt` object is fixture input supplied by the trusted harness; a future adapter
must bind a real model proposal to the same evaluation contract.

## Office boundary

- Typed Intake evaluates ingress standing and requested promotion.
- RIO remains the downstream admissibility office.
- Sentinel remains the future point-of-use verifier.
- MUS remains the receipt/proof office.
- This package emits local denial records, not execution authority.
