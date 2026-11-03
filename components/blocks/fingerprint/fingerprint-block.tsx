import { str } from "@/lib/blocks/read";
import { RingCanvas } from "./ring-canvas";
import type { BlockProps } from "../types";

export function FingerprintBlock({ data }: BlockProps) {
  const line1 = str(data.line1);
  const line2 = str(data.line2);
  if (!line1 || !line2) return null;

  return <RingCanvas line1={line1} line2={line2} />;
}
