import React from "react";
import { render } from "ink-testing-library";
import { describe, expect, it } from "vitest";
import type { LogEntry } from "@ekou/types";
import { LogStream } from "./LogStream.js";

function makeEntry(overrides: Partial<LogEntry>): LogEntry {
  return {
    id: overrides.id ?? "1",
    timestamp: Date.now(),
    source: "app-shell",
    stream: "stdout",
    message: "hello",
    ...overrides,
  };
}

describe("LogStream", () => {
  it("renders each entry's message and source", () => {
    const entries = [makeEntry({ id: "1", message: "starting vite" })];
    const { lastFrame } = render(<LogStream entries={entries} />);
    expect(lastFrame()).toContain("[app-shell] starting vite");
  });

  it("renders entries in order", () => {
    const entries = [
      makeEntry({ id: "1", message: "first" }),
      makeEntry({ id: "2", message: "second" }),
    ];
    const { lastFrame } = render(<LogStream entries={entries} />);
    const frame = lastFrame() ?? "";
    expect(frame.indexOf("first")).toBeLessThan(frame.indexOf("second"));
  });

  it("only renders the tail maxLines entries", () => {
    const entries = [
      makeEntry({ id: "1", message: "dropped" }),
      makeEntry({ id: "2", message: "kept" }),
    ];
    const { lastFrame } = render(<LogStream entries={entries} maxLines={1} />);
    const frame = lastFrame() ?? "";
    expect(frame).toContain("kept");
    expect(frame).not.toContain("dropped");
  });

  it("renders nothing extra when there are no entries", () => {
    const { lastFrame } = render(<LogStream entries={[]} />);
    expect(lastFrame()).toBe("");
  });
});
