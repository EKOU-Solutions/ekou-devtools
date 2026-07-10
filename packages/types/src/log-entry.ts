export type LogStreamKind = "stdout" | "stderr" | "system";

export interface LogEntry {
  id: string;
  timestamp: number;
  source: string;
  stream: LogStreamKind;
  message: string;
}
