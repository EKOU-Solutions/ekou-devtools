import type { Result } from "@ekou/types";

export interface NodeVersionError {
  code: "UNSUPPORTED_NODE_VERSION";
  message: string;
}

const MINIMUM_MAJOR_VERSION = 20;

function parseMajorVersion(version: string): number {
  return Number(version.replace(/^v/, "").split(".")[0]);
}

export function assertSupportedNodeVersion(
  nodeVersion: string = process.version,
): Result<void, NodeVersionError> {
  const major = parseMajorVersion(nodeVersion);
  if (Number.isNaN(major) || major < MINIMUM_MAJOR_VERSION) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_NODE_VERSION",
        message:
          `NodeVersionError: mfx requires Node.js ${MINIMUM_MAJOR_VERSION} LTS or newer (found ${nodeVersion}).\n` +
          `  Install Node ${MINIMUM_MAJOR_VERSION}+ (e.g. "nvm install ${MINIMUM_MAJOR_VERSION} && nvm use ${MINIMUM_MAJOR_VERSION}") and try again.`,
      },
    };
  }
  return { ok: true, value: undefined };
}

export function getPermissionFlag(
  nodeVersion: string = process.version,
): "--permission" | "--experimental-permission" {
  const major = parseMajorVersion(nodeVersion);
  return major >= 22 ? "--permission" : "--experimental-permission";
}
