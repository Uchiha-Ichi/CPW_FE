import type { Office, SiteSettings } from "./settings-model";

// "086.836.6662" thành "+84868366662" cho href tel: và JSON-LD. Số đã có "+" thì giữ mã nước;
// số bắt đầu bằng 0 coi là số Việt Nam; còn lại chỉ giữ chữ số.
export function phoneToTel(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return digits;
}

// Cơ sở không có street thì không có địa chỉ (trả rỗng để nơi gọi ẩn thẻ).
export function addressLine(office: Office | undefined): string {
  if (!office?.street) return "";
  return office.city ? `${office.street}, ${office.city}` : office.street;
}

export function mapsUrl(office: Office | undefined): string {
  const line = addressLine(office);
  return line
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line)}`
    : "";
}

// Tên thương hiệu: ưu tiên tên admin nhập, thiếu thì dùng chữ dự phòng (Meta.siteName).
export function brandName(
  settings: SiteSettings | null,
  fallback: string
): string {
  return settings?.name ?? fallback;
}
