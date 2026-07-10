import React, { useEffect, useState } from "react";
import { Text } from "ink";
import type { MFEStatus } from "@ekou/types";

export interface StatusIndicatorProps {
  status: MFEStatus;
  label?: string;
}

const SPINNER_FRAMES = ["|", "/", "-", "\\"];
const SPINNER_INTERVAL_MS = 120;

const STATIC_GLYPHS: Partial<Record<MFEStatus, string>> = {
  idle: "○",
  error: "✖",
  "creating-preview": "◎",
  purging: "◌",
};

const COLORS: Record<MFEStatus, string> = {
  idle: "gray",
  loading: "yellow",
  building: "yellow",
  "creating-preview": "cyan",
  purging: "magenta",
  error: "red",
};

const ANIMATED_STATUSES: MFEStatus[] = ["loading", "building"];

function useSpinnerFrame(active: boolean): string {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setFrame((current) => (current + 1) % SPINNER_FRAMES.length);
    }, SPINNER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active]);

  return SPINNER_FRAMES[frame];
}

export function StatusIndicator({ status, label }: StatusIndicatorProps): React.ReactElement {
  const isAnimated = ANIMATED_STATUSES.includes(status);
  const spinnerFrame = useSpinnerFrame(isAnimated);
  const glyph = isAnimated ? spinnerFrame : (STATIC_GLYPHS[status] ?? "○");

  return (
    <Text color={COLORS[status]}>
      {glyph} {label ?? status}
    </Text>
  );
}
