"use client";

import { ImagePlaceholder } from "@/components/content-block/image-placeholder";

function parsePos(value: string): [number, number] {
  const [x, y] = value.split(",").map((n) => parseFloat(n));
  return [Number.isFinite(x) ? x : 50, Number.isFinite(y) ? y : 50];
}

export function MapPositionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [x, y] = parsePos(value);

  function setPos(nx: number, ny: number) {
    const cx = Math.round(Math.max(0, Math.min(100, nx)) * 10) / 10;
    const cy = Math.round(Math.max(0, Math.min(100, ny)) * 10) / 10;
    onChange(`${cx},${cy}`);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos(
      ((e.clientX - rect.left) / rect.width) * 100,
      ((e.clientY - rect.top) / rect.height) * 100
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = deltas[e.key];
    if (!d) return;
    e.preventDefault();
    setPos(x + d[0], y + d[1]);
  }

  return (
    <div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Vị trí trên bản đồ"
        aria-valuenow={x}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative mt-1 cursor-crosshair"
      >
        <ImagePlaceholder label="Bản đồ thế giới" className="h-48 w-full" />
        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Ngang {x}%, dọc {y}% — bấm vào khung hoặc dùng phím mũi tên để chỉnh.
      </p>
    </div>
  );
}
