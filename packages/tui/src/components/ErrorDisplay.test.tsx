import React from "react";
import { render } from "ink-testing-library";
import { describe, expect, it } from "vitest";
import { ErrorDisplay } from "./ErrorDisplay.js";

describe("ErrorDisplay", () => {
  it("renders the title, message, and next step", () => {
    const { lastFrame } = render(
      <ErrorDisplay
        error={{
          title: "PermissionError",
          message: "mfx attempted an operation outside its allowed scope: /etc/passwd",
          nextStep: "mfx can only read within the project directory and write within .mfx/.",
        }}
      />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("PermissionError");
    expect(frame).toContain("/etc/passwd");
    expect(frame).toContain("→");
    expect(frame).toContain("mfx can only read within the project directory");
  });
});
