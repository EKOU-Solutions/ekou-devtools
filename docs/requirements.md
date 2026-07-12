# EKOU DevTools — Requirements · v1

**Product:** `mfx-cli` (npm package) · command `mfx` · EKOU brand.
**v1 scope:** requirements definition. Does not include implementation.

## Conventions
- User stories in Given / When / Then format.
- Functional requirements as `FR-xx`.

## Cross-cutting UX Principles
Apply to ALL requirements; not repeated in each one:
- **Status feedback always visible:** the CLI keeps the user informed of
  what is happening in each MFE (loading, building, creating preview, purging, etc.).
- **Real-time logs:** every operation that starts an MFE streams its log live.
- **Clear errors:** any error is displayed in a readable and actionable way.

## Distribution
- **FR-22** **Given** a dev **when** they need a devtool to manage microfrontends
  **then** they can install `mfx-cli` from npm as a library and run it via the
  `mfx` command.
  - Published under the EKOU organization npm scope as `@ekou/mfx-cli`.
  - Supports both global installation (`npm install -g @ekou/mfx-cli`) and
    local/project installation (`npm install --save-dev @ekou/mfx-cli` +
    `npx mfx`, or an npm script) — neither mode is deprecated in favor of
    the other.
  - All filesystem access (`.mfx/`, `mfx.config.json`) resolves relative to
    the user's current working directory, regardless of installation mode —
    never relative to the package's own install location.
- **FR-23** **Given** a user with strict security policies **when** installing
  `mfx-cli` **then** they can obtain it as source code copied directly into
  their own repository — ready to run without depending on the published
  npm package — rather than only as a dependency.
  - Delivered via a generator command (`npx create-mfx`, following the
    shadcn/ui pattern) that writes the full CLI source into the user's
    project.
  - The copied version is self-contained: no further downloads are required
    to run it, and the source is meant to be readable and modifiable by the
    person who installed it.
  - Copied source is scoped per-project (not global), since it lives
    directly inside the user's own repository.
  - The copied code records the source version it was generated from.
  - A dedicated update command pulls a newer version of the CLI source into
    an existing copy.

## Configuration
- **FR-24** **Given** a user **when** configuring the CLI **then** they can do
  so either by editing the contract file directly (`mfx.config.json` with
  `$schema` for validation/autocompletion), or by running the `mfx init`
  wizard, which generates that same file. The file remains the single
  source of truth; the wizard only produces it.
  - `mfx init` scans the monorepo (e.g. pnpm workspaces) and infers as much
    of the configuration as possible automatically — project name, App
    Shell, MFE list, ports, run commands per mode — minimizing manual input
    from the user.
  - The wizard presents everything it inferred on a single minimalist TUI
    review screen before writing anything to disk; the user confirms with
    `Enter` to write the file.
  - Fields inferred with low confidence are visually flagged as such on
    that same review screen (never asked as a separate blocking question)
    and remain editable inline before confirming.
  - If `mfx.config.json` already exists, `mfx init` re-scans and shows the
    same review screen (pre-filled with freshly inferred values); the
    existing file is overwritten only on confirmation, never silently.
  - If the user runs `mfx dev` and no `mfx.config.json` exists in the
    project, `mfx init` is triggered automatically; on confirmation, the
    CLI proceeds directly to the MFE selection screen (FR-25) without
    requiring the user to re-run `mfx dev` manually.
- Configurable parameters in v1:
  - **App Shell and its port:** defaults to the first port in the effective range.
  - **Project name:** displayed in the header as `EKOU CLI — {projectName}`.
  - **Port range** (see §Port Assignment).
  - **Run commands per mode:** dev, build, build+watch, etc.; with support
    for custom commands per mode.
  - **`$schemaVersion`:** version of the config schema. The CLI migrates older
    configs automatically on startup; unknown versions emit a warning.

## Port Assignment
- `ports` omitted → Vite default (5173), sequential +1 per MFE.
- `ports: 5000` (integer) → range start, sequential +1 per MFE.
- `ports: "5000-5060"` (string) → explicit range, inclusive on both ends.
- The App Shell always takes the first port in the effective range.
- Validation with a clear error if: `end < start`, range insufficient for the number
  of MFEs, or port overlap. This validation applies to the config file at parse
  time (static validation). It does not apply as a runtime block on dynamic
  reassignment once processes are live — see §Port Assignment — Dynamic
  Reassignment.

## Port Assignment — Dynamic Reassignment (Onboarding & Runtime)

The rules below extend the base Port Assignment section to cover port
changes that occur *after* MFEs are already running or selected — for
example, when the user changes an MFE's mode from the onboarding screen
or the dashboard.

- **FR-18** When an MFE that is already running is switched to a mode
  that adds one or more processes (e.g. `dev` → `dev + build-watch`),
  the port(s) already in use by that MFE's active process(es) are **not
  changed**. Only the newly added process(es) receive a port, taken from
  the **next free port available**, independent of the MFE's position
  in the list or the originally configured range.
  - **Given** micro-administration is running in `dev` mode on port
    `:3001`
  - **When** the user changes its mode to `dev + build-watch`
  - **Then** `dev` remains on `:3001`, and `build-watch` is assigned the
    next free port (e.g. `:3007`), which may not be contiguous with
    `:3001`
  - The reassignment is announced to the user via a notification event
    (see FR-11), e.g. *"micro-administration: build-watch assigned port
    :3007"*.

- **FR-19** Port assignment never fails due to range exhaustion. If all
  ports within the configured range (`ports` in `mfx.config.json`) are
  in use, the CLI continues assigning sequentially from the next free
  port **outside** the configured range. The original range remains the
  default starting point for assignment, but is not a hard ceiling once
  MFEs are running.
  - This does not remove the static config validation described in the
    base Port Assignment section (`end < start`, overlap between
    manually pinned ports, etc.) — that validation applies to the
    config file at parse time. It no longer applies as a runtime block
    on dynamic reassignment once processes are live.

- **FR-20** The first port of the configured range is always reserved
  for the App Shell, whether or not the Shell is currently selected to
  run.
  - **Given** the Shell is deselected on the onboarding screen
  - **When** ports are assigned to the selected MFEs
  - **Then** the first selected MFE is assigned the **second** port in
    the range (not the first), preserving the Shell's reserved slot for
    if/when it is selected later in the session

## Theming
- **FR-01** The CLI follows the EKOU visual identity; the **EKOU** theme is the default.
- **FR-02** Offers several predefined themes and allows defining a custom theme,
  in the style of Tailwind or MUI theming configuration.

## MFE Management
- **FR-03** Allows selecting which MFE(s) to start.
- **FR-04** Each MFE has a default port and mode, both individual per MFE.
  Port values are computed automatically (see §Port Assignment) and are
  **not** directly editable per-MFE from the CLI; overrides go through
  `mfx.config.json` or the `mfx init` wizard (FR-24).
- **FR-05** When starting an MFE, opens the browser at its URL **only the first time**
  that MFE runs in the session; on restarts it does not reopen it. Before opening,
  the CLI polls the port until it accepts connections; if a stale process is holding
  the port it is auto-purged first and a notification is emitted (see FR-11).
- **FR-06** Menu option to open a specific MFE or all running ones in the browser;
  if there are multiple, shows a selector.
- **FR-13** When an MFE crashes unexpectedly (without user action), the CLI shows
  a visual error state for that MFE in the TUI and emits a `MFECrashed` notification.
  No auto-retry — the user decides whether to restart.
- **FR-14** When the user selects `dev+build-watch` mode for an MFE, ports are
  assigned automatically; the user does not need to resolve port conflicts manually.
- **FR-21** From the operational dashboard, the user can change the mode of a
  running MFE via the `m` shortcut, without opening a modal.
  - **Given** an MFE is focused on the dashboard
  - **When** the user presses `m`
  - **Then** the bottom bar switches to a contextual state showing
    `← → change mode · enter apply · esc cancel`, and the user can cycle
    through the modes available for that MFE with ← →.
  - **Given** the user is cycling modes for a focused MFE
  - **When** the user presses `Esc`
  - **Then** the pending mode change is discarded, the MFE keeps running
    unchanged, and the bottom bar returns to its default state.
  - **Given** the user is cycling modes for a focused MFE
  - **When** the user presses `Enter` to apply
  - **Then** the CLI stops the MFE's current process(es), starts it in
    the newly selected mode, and assigns ports to any added process(es)
    following the Dynamic Reassignment rules (FR-18–FR-20): ports
    already in use by processes that persist across the mode change are
    preserved; newly added processes get the next free port.
  - **Given** a mode change has just been applied to an MFE
  - **When** the restart is in progress or has just completed
  - **Then** the CLI emits notification(s) for: mode change applied
    (old mode → new mode), and, if applicable, new port(s) assigned to
    added processes.
  - **Given** a mode change is being applied to an MFE (restart in
    progress)
  - **When** the user navigates to other MFEs
  - **Then** the user can perform other actions freely on any other MFE,
    but cannot initiate another mode change on the MFE currently being
    restarted until that restart completes.
  - **Given** the new mode's process fails to start after a mode change
    is applied
  - **When** the failure occurs
  - **Then** it is treated as a standard MFE crash: visual error state
    plus `MFECrashed` notification (per FR-13), with no auto-retry.
- **FR-25** **Given** the user runs `mfx dev` (or arrives here chained from
  the FR-24 auto-init flow) **then** a dedicated selection screen lets them
  choose which MFEs to run and adjust modes before starting — no logs,
  notifications, port editing, or confirmation dialogs appear on this
  screen.
  - The App Shell is selectable/deselectable like any other MFE; its port
    slot stays reserved either way (FR-20).
  - Mode is changed by cycling with ← → on the focused MFE, without opening
    a modal; only modes actually configured for that MFE appear in the
    cycle, shown by their real configured name.
  - Ports shown are read-only and computed live from the current
    selection/mode state, following the base Port Assignment rules.
  - Pressing `Enter` starts the selected MFEs immediately with no
    additional confirmation and transitions straight to the operational
    dashboard.

## Logs
- **FR-07** Displays the live log of the running MFE.
- **FR-08** If an MFE runs in multiple modes simultaneously (e.g. dev + build), displays
  the log for each mode and allows navigating between them with arrow keys to view them individually.

## Persistent Bottom Menu
- **FR-09** Bottom bar always available with the current commands, e.g.:
  `↑↓ navigate` · `space toggle` · `a all` · `n none` · `p purge port {range}` ·
  `enter start` · `q quit`, plus available options depending on context.

## Notifications Panel
- **FR-10** Notifications panel togglable from the bottom menu.
- **FR-11** Displays real-time events (MFE started, MFE purged, port auto-purged,
  MFE crashed, error starting, etc.).
- **FR-12** Configurable: the user chooses which notification types to receive.

## Security

- **FR-15** Command strings in `mfx.config.json` must not contain shell metacharacters
  (`;`, `&`, `|`, `$`, `` ` ``, `>`, `<`). The CLI validates this at config parse
  time and shows a clear, actionable error explaining how to wrap complex commands
  in an npm script instead.
- **FR-16** When `mfx` starts, it compares a SHA-256 hash of the `commands` section
  against a machine-local cache (`.mfx/config.lock`, gitignored). If the commands
  changed since the last run, `mfx` shows a diff of the affected entries and requires
  explicit user confirmation before executing anything. The first run (no lock file)
  writes the hash silently.
- **FR-17** `mfx` is launched with Node.js permission constraints restricting its own
  process to: read access within the project directory, write access within `.mfx/`,
  and child-process spawning. Minimum supported Node.js version: 20 LTS.

## v1 Constraints

- **No CI / non-interactive mode.** `mfx` is an interactive TUI-first tool in v1.
  `--json` output and machine-readable exit codes are deferred to a future version.

## UI Mockup
Claude design URL: https://claude.ai/design/p/36951933-d3f9-4f62-8697-5d626e5b8900?file=EKOU+CLI.dc.html&via=share

![UI Mockup](assets/mockup-ui.png)
