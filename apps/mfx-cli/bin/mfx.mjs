#!/usr/bin/env node
// Thin, unrestricted entrypoint. Node's permission model can only be set at
// process boot -- it cannot be toggled on after the process has started --
// so this script checks the Node version, then re-spawns itself as a child
// `node` process with the permission flags applied, pointed at the built CLI.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { assertSupportedNodeVersion, getPermissionFlag } from "@ekou/core";

const versionCheck = assertSupportedNodeVersion(process.version);
if (!versionCheck.ok) {
  console.error(versionCheck.error.message);
  process.exit(1);
}

const permissionFlag = getPermissionFlag(process.version);
const projectDir = process.cwd();
const mfxDir = path.join(projectDir, ".mfx");
const packageRoot = path.dirname(fileURLToPath(new URL(".", import.meta.url)));
const entry = path.join(packageRoot, "dist", "main.js");

const args = [
  permissionFlag,
  `--allow-fs-read=${projectDir}`,
  // Also needed to read the CLI's own installed files/dependencies once the
  // flag is active -- without it, Node can't even load its own entry point.
  `--allow-fs-read=${packageRoot}`,
  `--allow-fs-write=${mfxDir}`,
  "--allow-child-process",
  entry,
  ...process.argv.slice(2),
];

const child = spawn(process.execPath, args, { stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});

child.on("error", (err) => {
  console.error("Failed to launch mfx:", err.message);
  process.exit(1);
});
