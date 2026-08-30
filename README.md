# language-intake-mvp

This repository contains bounded, local deterministic research units for Typed Intake and state/claim/provenance separation.

## Start here

- [Typed Intake portable unit](docs/portable/PORTABLE-UNIT-001.md)
- [TI-001 and TI-002 local package](typed-intake/v0.1/README.md)
- [SCP-001 local package](state-claim-provenance/v0.1/README.md)

## Current local units

| Unit | Checked-in material | Current evidence ceiling |
|---|---|---|
| TI-001 | fixture, expected output, verifier, manifest, and report | checked-in local report: 7 passed, 0 failed |
| TI-002 | fixture, expected output, verifier, manifest, and report | checked-in local report: 7 passed, 0 failed |
| SCP-001 | implementation, verifier, and 18-case corpus | executable local corpus; its generated report is not checked in |

There is no GitHub Actions workflow in this repository. Checked-in reports are local evidence, not current-head CI evidence.

## Bounded claims

TI-001 and TI-002 test this narrow structural boundary:

> Content entering as `UNTRUSTED_DATA` cannot promote itself into instruction or tool standing in the sealed fixtures.

SCP-001 tests a separate narrow boundary:

> Semantic representation of a completed event does not establish that the event occurred and produces zero runtime effect in the sealed corpus.

## Run locally

Requires Node.js 18 or later and no external dependencies for these three verifiers.

```bash
node typed-intake/v0.1/verify-ti001.mjs
node typed-intake/v0.1/verify-ti002.mjs
node state-claim-provenance/v0.1/verify-scp001.mjs
```

The SCP verifier writes `state-claim-provenance/v0.1/SCP-001.report.json`; that generated file is not part of the current default-branch evidence.

## Known unresolved boundaries

- A non-null `promotion_artifact` currently counts as independent promotion; issuer authority, channel, scope, binding, validity, expiry, and revocation are not verified.
- The Typed Intake evaluator names its output `TYPED_INTAKE_DENIAL_RECORD` even when a positive decision is possible. No positive-record identity is selected here.

These are documented gaps, not permission to invent a replacement authority contract or record type.

## What this repository does not establish

The units do not establish ONE Grammar, CTL, ONE-IR, production prompt-injection protection, arbitrary-document parsing, production connector enforcement, real cryptographic verification, live receipts, ledger persistence, external effects, or full runtime conformance.
