# TYPED-INTAKE-PROFILE-001 v0.1
# Normative Companion Specification

**Profile:** `TYPED-INTAKE-PROFILE-001@0.1`
**Status:** local candidate — deterministic fixture only
**Fixture:** TI-001
**Verifier:** `node typed-intake/v0.1/verify-ti001.mjs`
**Expected verifier result:** 7 passed, 0 failed
**Expected report hash:** `740a8013de79e6afd66dca7daa9aed37afd15848c902c262849804c5ca1225d5`
**Expected package hash:** `9d8ddb8eee6515a67038bae59130d6a2bd0ec02ef3c4e35cf1063c108f51d710`

---

## Purpose

This document is the normative companion specification for the TI-001 typed intake structural proof. It defines what TI-001 proves, the standing model it evaluates, the conformance conditions under which a claim may be made, and the explicit non-claims that bound the scope.

TI-001 addresses a single, narrow property of content ingress:

> Content that enters as DATA cannot promote itself into INSTRUCTION.

This property is evaluated offline, against a sealed deterministic fixture, with no live model, connector, credential, deployment, or tool call involved.

---

## Scope

This specification covers:

- Content ingress standing assignment.
- The boundary between DATA-standing and INSTRUCTION-standing within the typed intake evaluation contract.
- Structural refusal of a standing promotion attempt when no independent promotion artifact is present.
- The local fixture proof contract for TI-001.

This specification does not cover:

- Arbitrary document parsing or natural-language injection detection.
- Production connector boundaries.
- Tool runtime protection.
- Execution grant verification.
- Cryptographic receipt issuance.
- Ledger persistence.
- The full ONE/RIO/MUSS runtime.

---

## Threat Model

The threat this specification addresses is **standing escalation via content**:

An untrusted external input (e.g. an email body, a document, a database record) contains embedded language that attempts to instruct the system to treat the content itself as an authoritative source of task directives, policy modifications, or tool invocations.

The threat is structural, not lexical. It does not depend on specific keywords or phrasing. TI-001 demonstrates this through the TI-STRUCT-01 assertion: novel attack wording that contains no known injection keywords receives the same structural denial as the canonical fixture.

The threat this specification does **not** address:

- An attacker who can supply a valid promotion artifact through a trusted channel.
- Vulnerabilities in the model layer, connector layer, or tool runtime layer downstream of the intake boundary.
- Side-channel or timing attacks.
- Attacks on the integrity of the verifier or fixture themselves.

---

## Standing Model

Standings are discrete labels assigned to content envelopes at ingress. They are properties of the envelope, assigned outside the content, before the content is evaluated.

| Standing | Tier | Description |
|---|---|---|
| `UNTRUSTED_DATA` | DATA | External input with no verified provenance. Default for inbound email, documents, and unverified records. |
| `REFERENCE_DATA` | DATA | Trusted reference material. May inform a task but may not direct it. |
| `PRIVATE_FIELD` | DATA | Sensitive data field. Subject to additional use restrictions. |
| `AUTHENTICATED_TASK` | CONTROL | A task directive from an authenticated source. |
| `POLICY` | CONTROL | A policy record from an authorized policy authority. |
| `AUTHORIZATION` | CONTROL | An authorization record from an authorized granting authority. |
| `EXECUTION_GRANT` | ENFORCEMENT | An active execution grant. Required for tool invocation. |

**Promotion rule:** Standing may only be increased by an independent promotion artifact supplied through a trusted channel. Content cannot change its own standing by asserting it.

**Payload binding:** Each ingress envelope carries a `payload_hash` field. The evaluator verifies the hash before processing. Content that has been mutated without rebinding fails closed with `PAYLOAD_BINDING_MISMATCH`.

---

## TI-001 Proof Claim

Given the sealed TI-001 fixture, when:

- content enters the evaluator with `ingress.standing = UNTRUSTED_DATA`,
- the represented observed attempt requests `INSTRUCTION` standing and `invoke_tool` use,
- no independent promotion artifact is present (`promotion_artifact = null`),

the evaluator must:

1. Return `decision: BLOCK`.
2. Return `reason_code: STANDING_ESCALATION_DENIED`.
3. Record `content_authority_effect: NONE`.
4. Record `effect_state: NONE`.
5. Record `tool_calls_attempted: 0`.
6. Record `tool_calls_executed: 0`.
7. Emit a structured `TYPED_INTAKE_DENIAL_RECORD`.

The denial record must be byte-identical across two consecutive verifier runs on the same fixture, confirming that the evaluation is deterministic and free of ambient state.

This claim holds regardless of the specific wording of the content (TI-STRUCT-01). It holds regardless of the number of embedded instruction attempts. It is a structural property of the standing model, not a lexical property of the content.

---

## Non-Claims

TI-001 and this specification explicitly do **not** prove or claim:

1. **Arbitrary prompt injections are detected.** TI-001 evaluates one sealed fixture. It does not parse, scan, or classify arbitrary input text. A real-world adversarial input that differs from the fixture may or may not be caught by downstream systems; that is outside this scope.

2. **Arbitrary documents are parsed safely.** The fixture content is a static string. No document parser, OCR layer, or format handler is exercised.

3. **A model cannot be influenced by malicious text.** TI-001 does not invoke a model. The `observed_attempt` is a fixture field supplied by the trusted test harness. The claim is that the structural evaluation layer refuses the represented attempt; it is not a claim about model behavior.

4. **A production connector is secure.** No connector is instantiated. No network call is made.

5. **A tool runtime is protected.** No tool runtime is active. `tool_calls_attempted` and `tool_calls_executed` are zero because the evaluator blocks before any invocation path is reached.

6. **An execution edge verifies grants.** Grant verification is outside the scope of the intake boundary. RIO remains the downstream admissibility office.

7. **A cryptographic receipt exists.** TI-001 produces a local denial record. It does not produce a MUS receipt, an Ed25519-signed ledger entry, or any cryptographic proof of evaluation.

8. **A ledger entry exists.** No ledger is written. The denial record is local and ephemeral.

9. **The full ONE/RIO/MUSS runtime is implemented.** This package is a narrow structural fixture. It does not instantiate or replicate any component of the production runtime.

---

## Future Adapter Requirements

A future adapter that binds real model or tool output into the typed intake boundary must satisfy the following requirements to remain within the TYPED-INTAKE-PROFILE-001 contract:

1. **Standing assignment must remain external to content.** The adapter must assign ingress standing before content is presented to any model or parser. Content must not be permitted to influence its own standing assignment.

2. **Payload binding must be preserved.** The adapter must compute and verify `payload_hash` over the raw content bytes before evaluation. Mutations that arrive without a new binding must fail closed.

3. **The observed attempt must be sourced from a trusted boundary.** The adapter must produce the `observed_attempt` record from a verified model output boundary, not from the content itself. The content may describe a desired action; the adapter must evaluate whether that action constitutes a standing escalation attempt.

4. **Denial records must be emitted on block.** Any BLOCK decision must produce a `TYPED_INTAKE_DENIAL_RECORD` with all required fields populated.

5. **Tool calls must remain zero on block.** The adapter must not pass a blocked request to any tool runtime. `tool_calls_attempted` and `tool_calls_executed` must be zero when the decision is BLOCK.

6. **Claim scope must be preserved.** The adapter may claim TYPED-INTAKE-PROFILE-001 conformance only for the intake boundary evaluation. It must not extend the claim to the model layer, the connector layer, the tool runtime, or the ledger.

---

## Conformance Language

An implementation may claim **TYPED-INTAKE-PROFILE-001@0.1 TI-001 local conformance** only if all of the following conditions are satisfied:

- The verifier (`node typed-intake/v0.1/verify-ti001.mjs`) runs completely offline with no live credentials, connectors, deployments, or tool calls.
- The verifier returns 7 passed, 0 failed.
- The generated report (`typed-intake/v0.1/reports/TI-001.report.json`) is byte-identical across two consecutive verifier runs on the same fixture.
- The SHA-256 hash of the report matches: `740a8013de79e6afd66dca7daa9aed37afd15848c902c262849804c5ca1225d5`.
- The denial record within the report contains `decision: BLOCK` and `reason_code: STANDING_ESCALATION_DENIED`.
- `tool_calls_attempted` is `0`.
- `tool_calls_executed` is `0`.
- Every claim made under this profile includes the qualifier: **local deterministic fixture only**.

No claim may be made under this profile that exceeds the scope defined in this specification or that omits the above qualifier.

---

## Final Rule

> The content may be data about the task.
> The content may not become the task.

A standing model exists so that the boundary between these two things is not left to inference. An intake layer that allows content to assert its own authority has no intake boundary. The purpose of this profile is to make that boundary structural, testable, and explicit.

TI-001 is a proof that the boundary holds for one well-formed case. It is not a proof that the boundary holds for all cases. Future work is the systematic extension of this contract to cover the adapter boundary, the model boundary, and the tool boundary — each with its own verifiable fixture set.
