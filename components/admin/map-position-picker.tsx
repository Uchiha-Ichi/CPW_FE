"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const moved = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      setZoom((z) => Math.max(1, Math.min(10, z - e.deltaY * 0.005)));
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function setPos(nx: number, ny: number) {
    const cx = Math.round(Math.max(0, Math.min(100, nx)) * 10) / 10;
    const cy = Math.round(Math.max(0, Math.min(100, ny)) * 10) / 10;
    onChange(`${cx},${cy}`);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    moved.current = false;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (isDragging) {
      if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) {
        moved.current = true;
        setPan((p) => ({
          x: p.x + e.movementX / zoom,
          y: p.y + e.movementY / zoom,
        }));
      }
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (!moved.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPos(
        ((e.clientX - rect.left) / rect.width) * 100,
        ((e.clientY - rect.top) / rect.height) * 100
      );
    }
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
        ref={containerRef}
        className="relative mt-1 aspect-[950/620] w-full overflow-hidden rounded-lg border border-[color:var(--admin-field-border)] bg-foreground/5"
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Vị trí trên bản đồ"
          aria-valuenow={x}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 cursor-crosshair origin-center touch-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          <Image
            src="/maps/world.svg"
            alt="Bản đồ thế giới"
            fill
            className="object-cover opacity-25 pointer-events-none"
            draggable={false}
          />
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-primary shadow-sm transition-all"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>
      </div>
      <div className="mt-1 flex items-start justify-between gap-4 text-xs text-muted-foreground">
        <p>
          Ngang {x}%, dọc {y}% — click để chọn, kéo để di chuyển, cuộn chuột để thu phóng.
        </p>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="font-medium text-[color:var(--admin-brand-ink)] hover:underline shrink-0"
          >
            Đặt lại góc nhìn
          </button>
        )}
      </div>
    </div>
  );
}
