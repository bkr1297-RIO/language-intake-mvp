# Language Intake MVP v0.1.2

**Scribe Conformance Patch — Accepted Build**

A standalone, deterministic language evaluation tool that implements the Language Governance Extraction Bundle v0.1.1. Runs entirely in the browser. No build step. No external calls. No data leaves the machine.

---

## Run Instructions

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Serve locally (any static server works)
python3 -m http.server 8080
# Then visit http://localhost:8080

# Option 3: Run test vectors
npm install    # installs jsdom (test dependency only)
node test-vectors.mjs
```

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entry point. Loads engine, app, and styles. Contains keeper lines. |
| `styles.css` | Visual styling. Structurally distinct Non-Admission vs Scribe Mark vs No Mark. |
| `engine.js` | Evaluation engine. Section 0 exclusions → Scribe crossing types → No Mark. |
| `app.js` | UI controller. Wires engine output to DOM. Reliance questions. Route cards. |
| `test-vectors.mjs` | 28 test vectors across 3 suites. Requires Node.js + jsdom. |
| `REPORT.md` | Final delivery report with conformance table and design decisions. |
| `README.md` | This file. |

---

## Architecture

```
Input (raw text + context)
        │
        ▼
┌─────────────────────────────┐
│  Step 1: Section 0 Check    │  ← Constitutional Non-Admission (4 categories)
│  (identity, destiny, oracle,│
│   unbounded authority)       │
└─────────────┬───────────────┘
              │ (not excluded)
              ▼
┌─────────────────────────────┐
│  Step 1b: Core Invariants   │  ← Constitutional Non-Admission (I-001–I-013)
│  (I-001 through I-013)      │
└─────────────┬───────────────┘
              │ (no violation)
              ▼
┌─────────────────────────────┐
│  Step 2: Scribe Crossing    │  ← Scribe Mark (12 crossing types)
│  Type Detection             │
└─────────────┬───────────────┘
              │ (no crossing)
              ▼
┌─────────────────────────────┐
│  Step 3: No Mark            │  ← Clean pass
└─────────────────────────────┘
```

---

## What Is a Stub

- **Answer Check** — Route exists. No verification logic executes.
- **RIO Authorization** — Route exists. No authorization workflow executes.

Both are integration points only.

---

## What This Does NOT Do

- No production enforcement
- No cryptographic receipts
- No external API calls
- No persistence layer
- No user accounts or sessions
- No outbound tools

Nothing expands silently.
