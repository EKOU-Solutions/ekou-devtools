import { describe, expect, it } from "vitest";
import { assertSupportedNodeVersion, getPermissionFlag } from "./node-version.js";

describe("assertSupportedNodeVersion", () => {
  it("accepts Node 20", () => {
    const result = assertSupportedNodeVersion("v20.11.0");
    expect(result.ok).toBe(true);
  });

  it("accepts Node 22", () => {
    const result = assertSupportedNodeVersion("v22.1.0");
    expect(result.ok).toBe(true);
  });

  it("rejects Node 18 with an actionable message", () => {
    const result = assertSupportedNodeVersion("v18.19.0");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UNSUPPORTED_NODE_VERSION");
      expect(result.error.message).toContain("requires Node.js 20 LTS or newer");
      expect(result.error.message).toContain("v18.19.0");
    }
  });

  it("rejects a malformed version string", () => {
    const result = assertSupportedNodeVersion("not-a-version");
    expect(result.ok).toBe(false);
  });
});

describe("getPermissionFlag", () => {
  it("returns --experimental-permission for Node 20", () => {
    expect(getPermissionFlag("v20.11.0")).toBe("--experimental-permission");
  });

  it("returns --experimental-permission for Node 21", () => {
    expect(getPermissionFlag("v21.0.0")).toBe("--experimental-permission");
  });

  it("returns --permission for Node 22+", () => {
    expect(getPermissionFlag("v22.0.0")).toBe("--permission");
  });
});
