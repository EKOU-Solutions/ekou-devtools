import React from "react";
import path from "node:path";
import { render } from "ink";
import { Command } from "commander";
import { AppShell } from "@ekou/tui";
import { isNodePermissionDenied, toPermissionError } from "@ekou/core";

function handleFatal(err: unknown): void {
  if (isNodePermissionDenied(err)) {
    // Ink's render tree may not exist (or may be in an inconsistent state) by
    // the time an uncaught exception fires, so this falls back to plain
    // console output rather than trying to mount <ErrorDisplay>.
    console.error(toPermissionError(err).toPlainText());
    process.exit(1);
  }
  throw err;
}

process.on("uncaughtException", handleFatal);
process.on("unhandledRejection", handleFatal);

const program = new Command();
program.name("mfx").version("0.0.0");

program.action(() => {
  render(React.createElement(AppShell, { projectName: path.basename(process.cwd()) }));
});

await program.parseAsync(process.argv);
