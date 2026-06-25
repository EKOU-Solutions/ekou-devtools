# ekou-devtools

Monorepo para tooling de desarrollador bajo la marca EKOU.
Cada app en `apps/` es un CLI independiente publicado bajo el scope `@ekou` en npm.

---

## Apps

| Package | Descripción | Estado |
|---|---|---|
| `@ekou/mfx-cli` | CLI interactiva para correr múltiples microfrontends en paralelo | `planning` |

---

## Inicio rápido

**Como dependencia npm:**

```bash
npm install @ekou/mfx-cli
npx mfx init        # genera mfx.config.json con wizard
npx mfx             # lanza la TUI
```

**Como código propio (eject):**

```bash
npx @ekou/mfx-cli eject
# copia un bundle autocontenido a .mfx/index.js
# agrega el script "mfx" a tu package.json
npm run mfx
```

---

## Estructura del monorepo

```
ekou-devtools/
├── apps/
│   └── mfx-cli/          ← binario @ekou/mfx-cli (publicado a npm)
├── packages/
│   ├── core/             ← process manager, config parser, port assignment
│   ├── tui/              ← componentes Ink reutilizables (workspace-internal)
│   └── types/            ← tipos TypeScript compartidos (workspace-internal)
└── docs/
    ├── requirements.md   ← especificación funcional (FR-01 a FR-12)
    ├── architecture.md   ← decisiones de arquitectura y diagramas
    ├── adr/              ← ADRs individuales, formato MADR
    └── assets/
```

Solo `apps/mfx-cli` se publica a npm. Los paquetes bajo `packages/` son
workspace-internal y nunca se instalan por separado.

---

## Stack

| Área | Elección |
|---|---|
| CLI framework | Commander.js + Ink (React para terminal) |
| Setup wizard | @clack/prompts |
| Build / monorepo | Turborepo + esbuild |
| Tests | Vitest + ink-testing-library + execa |

---

## Documentación

- [Requirements](docs/requirements.md) — especificación funcional completa (FR-01 a FR-12)
- [Architecture](docs/architecture.md) — capas, event bus, distribución, decisiones de diseño

---

## Licencia

MIT — ver [LICENSE](LICENSE).
