// Zero-dependency script run as a child process under restricted permission
// flags. Prints one JSON line describing the outcome so the test doesn't have
// to parse thrown stack traces across a process boundary.
import fs from "node:fs";

const [, , scenario, targetPath] = process.argv;

function report(result) {
  process.stdout.write(JSON.stringify(result) + "\n");
}

try {
  if (scenario === "read") {
    fs.readFileSync(targetPath, "utf8");
  } else if (scenario === "write") {
    fs.writeFileSync(targetPath, "hello");
  } else if (scenario === "write-new-dir") {
    fs.mkdirSync(targetPath, { recursive: true });
  } else if (scenario === "spawn-child") {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync(process.execPath, ["-e", "process.exit(0)"]);
    if (result.status !== 0) {
      throw new Error("child spawn failed");
    }
  } else {
    throw new Error(`unknown scenario: ${scenario}`);
  }
  report({ scenario, ok: true });
} catch (err) {
  report({ scenario, ok: false, code: err.code, permission: err.permission, resource: err.resource });
}
