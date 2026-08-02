# language-intake-mvp

This repository contains local deterministic proofs for Typed Intake.

## Start Here

→ [docs/portable/PORTABLE-UNIT-001.md](docs/portable/PORTABLE-UNIT-001.md)

## Current Unit

**PORTABLE-UNIT-001 / TI-001**

## Core Claim

> Content that enters as DATA cannot promote itself into INSTRUCTION.

## Boundary

Local deterministic fixture only. No production prompt-injection protection, cryptographic receipt, ledger, or full runtime claim.

## Verify

```bash
node typed-intake/v0.1/verify-ti001.mjs
```

Expected:

```
7 passed, 0 failed
report hash 740a8013de79e6afd66dca7daa9aed37afd15848c902c262849804c5ca1225d5
```

## Repository Map

| Path | Contents |
|---|---|
| `typed-intake/v0.1/` | TI-001 proof package — verifier, fixture, expected output, report, manifest |
| `docs/portable/PORTABLE-UNIT-001.md` | Start here index for PORTABLE-UNIT-001 |
| `docs/profiles/TYPED-INTAKE-PROFILE-001_v0.1.md` | Normative companion specification |
| `docs/fixtures/TI-002-CANDIDATE.md` | Next fixture lane candidate — planning doc only, not implemented |
