import React from "react";
import { Box, Text } from "ink";
import type { LogEntry, LogStreamKind } from "@ekou/types";

export interface LogStreamProps {
  entries: LogEntry[];
  maxLines?: number;
}

const DEFAULT_MAX_LINES = 200;

const COLORS: Record<LogStreamKind, string | undefined> = {
  stdout: undefined,
  stderr: "red",
  system: "gray",
};

/**
 * Purely reactive: re-renders whenever the caller appends to `entries`.
 * Any process source (execa, a future event bus, a test fixture) can feed
 * this component — it never touches process stdio itself.
 */
export function LogStream({ entries, maxLines = DEFAULT_MAX_LINES }: LogStreamProps): React.ReactElement {
  const visible = entries.slice(-maxLines);

  return (
    <Box flexDirection="column">
      {visible.map((entry) => (
        <Text key={entry.id} color={COLORS[entry.stream]} dimColor={entry.stream === "system"}>
          [{entry.source}] {entry.message}
        </Text>
      ))}
    </Box>
  );
}
