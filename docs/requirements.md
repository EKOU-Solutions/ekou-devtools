# Requirements — ekou-mfx-cli

## Problem

When working with a microfrontend architecture (monorepo or independent repos), developers must open one terminal per microfrontend to run each one. This becomes tedious as the number of microfrontends grows.

## Goal

Create an NPM package (`@ekou/mfx-cli`) that allows developers to:

1. Install it once.
2. Define microfrontends via a config file (`ekou.config.json`).
3. Run a single command (`ekou start`) to launch an interactive TUI that lets them choose which microfrontends to start, and in what mode.

## Config file (`ekou.config.json`)

Each microfrontend entry defines:

- `name` — display name.
- `command` — the dev command (e.g. `npm run dev`).
- `port` — the port it runs on.
- `modes` — available run modes (e.g. `dev`, `watch`, `build`).

## TUI Interface

On `ekou start`, the terminal UI must allow:

- Select one or multiple microfrontends to launch.
- Choose the run mode per microfrontend (dev / watch / build).
- View real-time output per microfrontend (process logs).
- Kill individual processes or all at once.

## Constraints

- Must work with any frontend framework (Next.js, Vite, CRA, etc.).
- Should not require global installation — supports `npx ekou` usage.
- Config file must be human-readable and simple.

## Out of scope (v1)

- Automatic port conflict resolution.
- Remote/cloud process management.
- GUI (browser-based) interface.
