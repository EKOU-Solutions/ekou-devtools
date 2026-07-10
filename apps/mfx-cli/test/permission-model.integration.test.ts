import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPermissionFlag } from "@ekou/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, "fixtures", "permission-fixture.mjs");
const permissionFlag = getPermissionFlag(process.version);

let allowedDir: string;
let excludedDir: string;

beforeAll(() => {
  allowedDir = fs.mkdtempSync(path.join(os.tmpdir(), "mfx-permission-allowed-"));
  excludedDir = fs.mkdtempSync(path.join(os.tmpdir(), "mfx-permission-excluded-"));
});

afterAll(() => {
  fs.rmSync(allowedDir, { recursive: true, force: true });
  fs.rmSync(excludedDir, { recursive: true, force: true });
});

async function runFixture(scenario: string, targetPath: string, extraFlags: string[] = []) {
  const { stdout } = await execa(
    process.execPath,
    [
      permissionFlag,
      `--allow-fs-read=${__dirname}`,
      `--allow-fs-read=${allowedDir}`,
      `--allow-fs-write=${allowedDir}`,
      ...extraFlags,
      fixture,
      scenario,
      targetPath,
    ],
    { reject: false },
  );
  return JSON.parse(stdout.trim().split("\n").at(-1)!);
}

describe("Node permission model enforcement", () => {
  it("allows reading a file inside the allowed scope", async () => {
    const filePath = path.join(allowedDir, "readable.txt");
    fs.writeFileSync(filePath, "hi");
    const result = await runFixture("read", filePath);
    expect(result).toEqual({ scenario: "read", ok: true });
  });

  it("denies reading a file outside the allowed scope", async () => {
    const filePath = path.join(excludedDir, "secret.txt");
    fs.writeFileSync(filePath, "hi");
    const result = await runFixture("read", filePath);
    expect(result.ok).toBe(false);
    expect(result.code).toBe("ERR_ACCESS_DENIED");
  });

  it("allows writing a file inside the allowed write scope", async () => {
    const filePath = path.join(allowedDir, "written.txt");
    const result = await runFixture("write", filePath);
    expect(result).toEqual({ scenario: "write", ok: true });
  });

  it("denies writing a file outside the allowed write scope", async () => {
    const filePath = path.join(excludedDir, "written.txt");
    const result = await runFixture("write", filePath);
    expect(result.ok).toBe(false);
    expect(result.code).toBe("ERR_ACCESS_DENIED");
  });

  it("allows creating a not-yet-existing directory under the allowed write scope (first-run .mfx/ case)", async () => {
    const newDir = path.join(allowedDir, "not-yet-created", "nested");
    const result = await runFixture("write-new-dir", newDir);
    expect(result).toEqual({ scenario: "write-new-dir", ok: true });
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it("allows spawning a child process", async () => {
    const result = await runFixture("spawn-child", "", ["--allow-child-process"]);
    expect(result).toEqual({ scenario: "spawn-child", ok: true });
  });

  it("denies spawning a child process without --allow-child-process", async () => {
    const result = await runFixture("spawn-child", "");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("ERR_ACCESS_DENIED");
  });
});
