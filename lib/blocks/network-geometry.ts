export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 520;

export interface Pin {
  code: string;
  name: string;
  city: string;
  note: string;
  x: number; // phần trăm chiều ngang của bản đồ, 0..100
  y: number; // phần trăm chiều dọc của bản đồ, 0..100
}

// pos do backend lưu dạng "x,y" tính theo phần trăm của bản đồ.
export function parsePos(pos: unknown): { x: number; y: number } | null {
  if (typeof pos !== "string") return null;
  const match = /^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/.exec(pos);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  if (x > 100 || y > 100) return null;
  return { x, y };
}

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

// Chỉ nhận quốc gia có code 2 chữ cái (dùng cho URL cờ), có tên và pos hợp lệ; bỏ code trùng.
export function toPins(raw: unknown[]): Pin[] {
  const seen = new Set<string>();
  const pins: Pin[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const c = item as Record<string, unknown>;
    const code = text(c.code).toLowerCase();
    const name = text(c.name);
    const pos = parsePos(c.pos);
    if (!/^[a-z]{2}$/.test(code) || !name || !pos || seen.has(code)) continue;
    seen.add(code);
    pins.push({ code, name, city: text(c.city), note: text(c.note), x: pos.x, y: pos.y });
  }
  return pins;
}

const round = (n: number) => Math.round(n * 10) / 10;

// Đường cong bậc hai từ A tới B, nhấc lên trên theo khoảng cách, trong hệ tọa độ 900x520 của SVG.
export function routePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = (from.x / 100) * MAP_WIDTH;
  const y1 = (from.y / 100) * MAP_HEIGHT;
  const x2 = (to.x / 100) * MAP_WIDTH;
  const y2 = (to.y / 100) * MAP_HEIGHT;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25;
  return `M ${round(x1)} ${round(y1)} Q ${round(cx)} ${round(cy)} ${round(x2)} ${round(y2)}`;
}

// Mỗi nước còn lại nối với trụ sở (mặc định Việt Nam). Không có trụ sở thì không vẽ đường.
export function routesFrom(pins: Pin[], hubCode = "vn"): { code: string; d: string }[] {
  const hub = pins.find((p) => p.code === hubCode);
  if (!hub) return [];
  return pins
    .filter((p) => p.code !== hubCode)
    .map((p) => ({ code: p.code, d: routePath(hub, p) }));
}
