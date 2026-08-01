# GitHub Placement Candidate

Target repository: `bkr1297-RIO/language-intake-mvp`  
Target base: `main`  
Proposed branch: `agent/ti001-typed-intake-structural-proof`  
Proposed status: draft pull request only

## Proposed repository tree

```text
typed-intake/v0.1/
  README.md
  SOURCE-BINDING.md
  MANIFEST.sha256
  typed-intake.js
  verify-ti001.mjs
  fixtures/TI-001.input.json
  expected/TI-001.expected.json
  reports/TI-001.report.json
```

## Proposed commit

```text
test: add TI-001 typed intake structural proof
```

## Proposed draft PR title

```text
Add TI-001 typed intake structural proof
```

## Proposed draft PR body

TI-001 demonstrates a narrow, deterministic ingress property: content entering as `UNTRUSTED_DATA` cannot promote itself into instruction or tool standing without an independently supplied promotion artifact.

The package is dependency-free and offline. It includes a payload-bound synthetic email fixture, a sealed expected denial record, a deterministic verifier, a byte-stable passing report, source binding, and artifact hashes.

Validation:

- 7 assertions passed, 0 failed;
- decision: `BLOCK`;
- reason: `STANDING_ESCALATION_DENIED`;
- tool calls requested: 1;
- tool calls attempted: 0;
- tool calls executed: 0;
- novel attack wording produces the same structural denial;
- unbound payload mutation fails closed with `PAYLOAD_BINDING_MISMATCH`;
- two consecutive verifier runs produced byte-identical reports.

Claim boundary: this is a local structural fixture over a represented standing transition. It is not a universal prompt-injection defense, production connector enforcement, an execution grant, or a cryptographic MUS receipt.

No existing runtime path is changed by this draft.
