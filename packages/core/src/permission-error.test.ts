import { describe, expect, it } from "vitest";
import { isNodePermissionDenied, PermissionError, toPermissionError } from "./permission-error.js";

describe("PermissionError", () => {
  it("produces an actionable error referencing the offending path", () => {
    const error = new PermissionError("/etc/passwd");
    const actionable = error.toActionableError();
    expect(actionable.title).toBe("PermissionError");
    expect(actionable.message).toContain("/etc/passwd");
    expect(actionable.nextStep).toContain(".mfx/");
  });

  it("renders plain text combining message and next step", () => {
    const error = new PermissionError("/tmp/outside");
    expect(error.toPlainText()).toBe(
      "PermissionError: mfx attempted an operation outside its allowed scope: /tmp/outside\n" +
        "  mfx can only read within the project directory and write within .mfx/. " +
        "This is enforced by Node's permission model (see ADR-0001).",
    );
  });

  it("handles a missing path gracefully", () => {
    const error = new PermissionError(undefined);
    expect(error.message).toBe("mfx attempted an operation outside its allowed scope.");
  });
});

describe("isNodePermissionDenied", () => {
  it("recognizes Node's ERR_ACCESS_DENIED error code", () => {
    const err = Object.assign(new Error("access denied"), { code: "ERR_ACCESS_DENIED" });
    expect(isNodePermissionDenied(err)).toBe(true);
  });

  it("rejects unrelated errors", () => {
    expect(isNodePermissionDenied(new Error("boom"))).toBe(false);
    expect(isNodePermissionDenied(null)).toBe(false);
    expect(isNodePermissionDenied("nope")).toBe(false);
  });
});

describe("toPermissionError", () => {
  it("prefers the structured resource field when present", () => {
    const err = Object.assign(new Error("access denied to '/foo'"), {
      code: "ERR_ACCESS_DENIED",
      resource: "/real/resource",
    });
    expect(toPermissionError(err).path).toBe("/real/resource");
  });

  it("falls back to extracting the path from the message", () => {
    const err = new Error("Access to this API has been restricted: '/foo/bar'");
    expect(toPermissionError(err).path).toBe("/foo/bar");
  });
});
