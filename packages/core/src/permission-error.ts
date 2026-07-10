import type { ActionableError } from "@ekou/types";

export class PermissionError extends Error {
  readonly code = "ERR_MFX_PERMISSION_DENIED" as const;
  readonly path?: string;

  constructor(path: string | undefined, options?: { cause?: unknown }) {
    super(`mfx attempted an operation outside its allowed scope${path ? `: ${path}` : "."}`);
    this.name = "PermissionError";
    this.path = path;
    if (options?.cause) this.cause = options.cause;
  }

  toActionableError(): ActionableError {
    return {
      title: "PermissionError",
      message: this.message,
      nextStep:
        "mfx can only read within the project directory and write within .mfx/. " +
        "This is enforced by Node's permission model (see ADR-0001).",
    };
  }

  toPlainText(): string {
    const { title, message, nextStep } = this.toActionableError();
    return `${title}: ${message}\n  ${nextStep}`;
  }
}

/** Node's permission model throws errors with this code when a restricted operation is attempted. */
export function isNodePermissionDenied(error: unknown): error is NodeJS.ErrnoException {
  return !!error && typeof error === "object" && (error as { code?: string }).code === "ERR_ACCESS_DENIED";
}

export function toPermissionError(error: unknown): PermissionError {
  const err = error as { resource?: string; message?: string };
  const resource = err?.resource ?? extractPathFromMessage(err?.message);
  return new PermissionError(resource, { cause: error });
}

function extractPathFromMessage(message?: string): string | undefined {
  return message?.match(/'([^']+)'/)?.[1];
}
