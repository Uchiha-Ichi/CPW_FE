export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 520;

// public/maps/world.svg (950x620) cắt lấy dải y 50 → 499: bỏ Nam Cực và mép Bắc Cực, khung ≈ 2,12:1.
export const MAP_SOURCE = { width: 950, height: 620 } as const;
export const MAP_CROP = { top: 50, height: 449 } as const;
export const MAP_CROP_ASPECT = "950 / 449";
// % cho mask-position khi mask-size: 100% auto (dịch ảnh mask lên 50 đơn vị của hệ 950x620).
export const MAP_MASK_POSITION_Y = (50 / (620 - 449)) * 100;

export interface Pin {
  code: string;
  name: string;
  nameEn: string;
  stage: "live" | "next";
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
    pins.push({
      code,
      name,
      nameEn: text(c.nameEn),
      stage: c.stage === "Đang mở rộng" ? "next" : "live",
      city: text(c.city),
      note: text(c.note),
      x: pos.x,
      y: pos.y,
    });
  }
  return pins;
}

const round = (n: number) => Math.round(n * 10) / 10;

// Đổi pos (% của world.svg 950x620) sang % của khung đã cắt; ngoài khung thì null.
export function cropPoint(p: { x: number; y: number }): { x: number; y: number } | null {
  const y = (((p.y / 100) * MAP_SOURCE.height - MAP_CROP.top) / MAP_CROP.height) * 100;
  if (y < 0 || y > 100 || p.x < 0 || p.x > 100) return null;
  return { x: p.x, y };
}

// Đường cong bậc hai từ A tới B, nhấc lên trên theo khoảng cách; mặc định trong hệ tọa độ 900x520 của SVG.
export function routePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  frame: { width: number; height: number } = { width: MAP_WIDTH, height: MAP_HEIGHT },
): string {
  const x1 = (from.x / 100) * frame.width;
  const y1 = (from.y / 100) * frame.height;
  const x2 = (to.x / 100) * frame.width;
  const y2 = (to.y / 100) * frame.height;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25;
  return `M ${round(x1)} ${round(y1)} Q ${round(cx)} ${round(cy)} ${round(x2)} ${round(y2)}`;
}

export type RouteKind = "cross" | "reach" | "next-next" | "hub-next" | "hub-live";

// Trụ sở: mặc định của networkRoutes, bản đồ dùng lại để tô chấm/cờ trụ sở.
export const HUB_CODE = "vn";

// Các đường bay trên khung đã cắt (950x449), theo thứ tự vẽ (vẽ sau nằm trên): chéo giữa nước live, live → next,
// giữa các nước next, trụ sở → next, trụ sở → live (mockup BẢN 65 dòng 1445–1456). Nước ngoài khung cắt bị bỏ.
export function networkRoutes(
  pins: Pin[],
  hubCode = HUB_CODE,
): { key: string; kind: RouteKind; d: string }[] {
  const frame = { width: MAP_SOURCE.width, height: MAP_CROP.height };
  const placed = pins.flatMap((pin) => {
    const at = cropPoint(pin);
    return at ? [{ pin, at }] : [];
  });
  const hub = placed.find((p) => p.pin.code === hubCode);
  const live = placed.filter((p) => p.pin.stage === "live" && p.pin.code !== hubCode);
  const next = placed.filter((p) => p.pin.stage === "next" && p.pin.code !== hubCode);

  const routes: { key: string; kind: RouteKind; d: string }[] = [];
  const add = (kind: RouteKind, a: (typeof placed)[number], b: (typeof placed)[number]) =>
    routes.push({ key: `${kind}-${a.pin.code}-${b.pin.code}`, kind, d: routePath(a.at, b.at, frame) });

  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) add("cross", live[i], live[j]);
  for (const a of live) for (const b of next) add("reach", a, b);
  for (let i = 0; i < next.length; i++) for (let j = i + 1; j < next.length; j++) add("next-next", next[i], next[j]);
  if (hub) {
    for (const b of next) add("hub-next", hub, b);
    for (const b of live) add("hub-live", hub, b);
  }
  return routes;
}

// Tên hiển thị theo ngôn ngữ (D10): vi dùng name; en dùng nameEn, trống thì tên vùng của Intl, không ra gì thì name.
export function pinName(pin: Pin, lang: "vi" | "en"): string {
  if (lang === "vi") return pin.name;
  if (pin.nameEn) return pin.nameEn;
  const code = pin.code.toUpperCase();
  const fromIntl = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
  return fromIntl && fromIntl !== code ? fromIntl : pin.name;
}
