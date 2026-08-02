# PORTABLE-UNIT-001 — Start Here

**Unit:** TI-001 Typed Intake Structural Proof
**Profile:** `TYPED-INTAKE-PROFILE-001@0.1`
**Status:** local deterministic fixture only

---

## Core Rule

> Content that enters as DATA cannot promote itself into INSTRUCTION.

---

## Contents

| Path | What it is |
|---|---|
| `typed-intake/v0.1/` | Package root — verifier, fixture, expected output, report, manifest, source binding |
| `typed-intake/v0.1/verify-ti001.mjs` | Verifier entry point |
| `typed-intake/v0.1/typed-intake.js` | Evaluator — standing transition logic, payload binding, denial record |
| `typed-intake/v0.1/fixtures/TI-001.input.json` | Sealed input fixture — synthetic email injection case |
| `typed-intake/v0.1/expected/TI-001.expected.json` | Sealed expected denial record |
| `typed-intake/v0.1/reports/TI-001.report.json` | Byte-stable passing report |
| `typed-intake/v0.1/MANIFEST.sha256` | Per-file SHA-256 hashes |
| `typed-intake/v0.1/SOURCE-BINDING.md` | Source profile and fixture pack binding |
| `typed-intake/v0.1/GITHUB-PLACEMENT.md` | Placement rationale and proposed PR template |
| `docs/profiles/TYPED-INTAKE-PROFILE-001_v0.1.md` | Normative companion spec — standing model, proof claim, non-claims, conformance language |

---

## Run the Verifier

Requires Node.js 18 or later. No external dependencies.

```bash
node typed-intake/v0.1/verify-ti001.mjs
```

Expected result:

```
7 passed, 0 failed
```

Expected report hash:

```
740a8013de79e6afd66dca7daa9aed37afd15848c902c262849804c5ca1225d5
```

The report is byte-identical across two consecutive runs on the same fixture.

---

## What TI-001 Proves

Given the sealed fixture, when content enters as `UNTRUSTED_DATA` and the represented observed attempt requests `INSTRUCTION` standing and `invoke_tool` use without an independent promotion artifact, the evaluator returns:

- `decision: BLOCK`
- `reason_code: STANDING_ESCALATION_DENIED`
- `tool_calls_requested: 1`
- `tool_calls_attempted: 0`
- `tool_calls_executed: 0`
- `content_authority_effect: NONE`

This holds regardless of the specific wording of the content (TI-STRUCT-01). Content that is mutated without rebinding its payload hash fails closed with `PAYLOAD_BINDING_MISMATCH` (TI-BIND-01).

---

## What TI-001 Does Not Prove

- **No production prompt-injection protection claim.** TI-001 evaluates one sealed fixture. It does not detect arbitrary injection attempts in live input.
- **No cryptographic receipt claim.** The denial record is local and ephemeral. No MUS receipt, Ed25519 signature, or ledger entry is produced.
- **No ledger claim.** No ledger is written.
- **No full runtime claim.** This package does not instantiate or replicate any component of the ONE/RIO/MUSS runtime.
- **No model-layer claim.** No model is invoked. The `observed_attempt` is a fixture field from the trusted harness.
- **No connector or tool runtime claim.** No connector is instantiated. No tool runtime is active.

---

## Normative Reference

Full standing model, proof claim, non-claims, future adapter requirements, and conformance language:

→ `docs/profiles/TYPED-INTAKE-PROFILE-001_v0.1.md`

---

## Conformance Qualifier

Every claim made under this unit must include the qualifier:

> **local deterministic fixture only**
