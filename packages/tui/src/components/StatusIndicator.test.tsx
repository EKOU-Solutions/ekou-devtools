import React from "react";
import { render } from "ink-testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusIndicator } from "./StatusIndicator.js";

describe("StatusIndicator", () => {
  it("renders a static glyph for idle", () => {
    const { lastFrame } = render(<StatusIndicator status="idle" />);
    expect(lastFrame()).toContain("○");
    expect(lastFrame()).toContain("idle");
  });

  it("renders a static glyph for error", () => {
    const { lastFrame } = render(<StatusIndicator status="error" />);
    expect(lastFrame()).toContain("✖");
  });

  it("uses the provided label instead of the raw status", () => {
    const { lastFrame } = render(<StatusIndicator status="idle" label="app-shell" />);
    expect(lastFrame()).toContain("app-shell");
  });

  describe("animated states", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("animates the spinner while loading", async () => {
      const { lastFrame } = render(<StatusIndicator status="loading" />);
      const firstFrame = lastFrame();
      await vi.advanceTimersByTimeAsync(120);
      const secondFrame = lastFrame();
      expect(firstFrame).not.toBe(secondFrame);
    });

    it("animates the spinner while building", async () => {
      const { lastFrame } = render(<StatusIndicator status="building" />);
      const firstFrame = lastFrame();
      await vi.advanceTimersByTimeAsync(120);
      expect(lastFrame()).not.toBe(firstFrame);
    });
  });
});
