import React from "react";
import { Box, Text } from "ink";
import type { ActionableError } from "@ekou/types";

export interface ErrorDisplayProps {
  error: ActionableError;
}

export function ErrorDisplay({ error }: ErrorDisplayProps): React.ReactElement {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={1}>
      <Text bold color="red">
        ✖ {error.title}
      </Text>
      <Text>{error.message}</Text>
      <Text color="yellow">→ {error.nextStep}</Text>
    </Box>
  );
}
