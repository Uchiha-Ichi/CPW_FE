import { str } from "@/lib/blocks/read";
import { FingerprintCanvas } from "./fingerprint-canvas";
import type { BlockProps } from "../types";

export function FingerprintBlock({ data }: BlockProps) {
  const line1 = str(data.line1);
  const line2 = str(data.line2);
  if (!line1 || !line2) return null;

  return (
    <section className="overflow-hidden border-b border-border">
      <FingerprintCanvas line1={line1} line2={line2} />
    </section>
  );
}
