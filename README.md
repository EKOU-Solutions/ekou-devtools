# ekou-devtools

Monorepo for EKOU developer tooling.
Each app under `apps/` is an independent CLI published under the `@ekou` npm scope.

---

## Apps

| Package | Description | Status |
|---|---|---|
| `@ekou/mfx-cli` | Interactive CLI to run multiple microfrontends in parallel | `planning` |

---

## Quick start

**As an npm dependency:**

```bash
npm install @ekou/mfx-cli
npx mfx init        # generates mfx.config.json via wizard
npx mfx             # launches the TUI
```

**As owned source code (eject):**

```bash
npx @ekou/mfx-cli eject
# copies a self-contained bundle to .mfx/index.js
# adds an "mfx" script to your package.json
npm run mfx
```

---

## Monorepo structure

```
ekou-devtools/
├── apps/
│   └── mfx-cli/          ← @ekou/mfx-cli binary (published to npm)
├── packages/
│   ├── core/             ← process manager, config parser, port assignment
│   ├── tui/              ← reusable Ink components (workspace-internal)
│   └── types/            ← shared TypeScript types (workspace-internal)
└── docs/
    ├── requirements.md   ← functional spec (FR-01 to FR-12)
    ├── architecture.md   ← architecture decisions and diagrams
    ├── adr/              ← individual ADRs, MADR format
    └── assets/
```

Only `apps/mfx-cli` is published to npm. Packages under `packages/` are
workspace-internal and never installed separately.

---

## Stack

| Area | Choice |
|---|---|
| CLI framework | Commander.js + Ink (React for the terminal) |
| Setup wizard | @clack/prompts |
| Build / monorepo | Turborepo + esbuild |
| Tests | Vitest + ink-testing-library + execa |

---

## Documentation

- [Requirements](docs/requirements.md) — full functional spec (FR-01 to FR-12)
- [Architecture](docs/architecture.md) — layers, event bus, distribution, design decisions

---

## License

MIT — see [LICENSE](LICENSE).
