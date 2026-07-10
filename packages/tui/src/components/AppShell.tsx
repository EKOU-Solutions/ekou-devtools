import React, { type ReactNode } from "react";
import { Box, Text } from "ink";

export interface AppShellProps {
  projectName: string;
  children?: ReactNode;
}

export function AppShell({ projectName, children }: AppShellProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Box borderStyle="single" paddingX={1}>
        <Text bold>EKOU CLI — {projectName}</Text>
      </Box>
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        {children ?? <Text dimColor>No MFEs configured yet — run `mfx init` to get started.</Text>}
      </Box>
    </Box>
  );
}
