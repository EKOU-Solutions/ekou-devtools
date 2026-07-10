import React from "react";
import { Text } from "ink";
import { render } from "ink-testing-library";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";

describe("AppShell", () => {
  it("renders the header with the project name", () => {
    const { lastFrame } = render(<AppShell projectName="my-app" />);
    expect(lastFrame()).toContain("EKOU CLI — my-app");
  });

  it("shows an empty-state message when there are no children", () => {
    const { lastFrame } = render(<AppShell projectName="my-app" />);
    expect(lastFrame()).toContain("No MFEs configured yet");
  });

  it("renders children instead of the empty state when provided", () => {
    const { lastFrame } = render(
      <AppShell projectName="my-app">
        <Text>app-shell (dev)</Text>
      </AppShell>,
    );
    expect(lastFrame()).toContain("app-shell (dev)");
    expect(lastFrame()).not.toContain("No MFEs configured yet");
  });
});
