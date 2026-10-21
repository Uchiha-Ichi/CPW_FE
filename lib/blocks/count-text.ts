import type { Locale } from "@/lib/i18n/config";

export type CountParts = { prefix: string; value: number; decimals: number; rest: string };

// Tách số đầu chuỗi để đếm lên ("2,5 tỷ+" → 2,5 + " tỷ+"). Chép quy tắc countHtml của mockup BẢN 65:
// vi bỏ "." (hàng nghìn) và lấy "," làm dấu thập phân; en bỏ "," và lấy ".". Không bắt đầu bằng số thì trả null,
// nơi gọi hiện nguyên chuỗi. `prefix` luôn rỗng (giữ chỗ cho chữ đứng trước số, hiện chưa dùng).
export function parseCountText(text: string, lang: Locale): CountParts | null {
  const match = text.match(/^(\d[\d.,]*)(.*)$/);
  if (!match) return null;
  const parts =
    lang === "vi"
      ? match[1].replace(/\./g, "").split(",")
      : match[1].replace(/,/g, "").split(".");
  const decimals = parts[1] ? parts[1].length : 0;
  const value = parseFloat(parts[0] + (parts[1] ? "." + parts[1] : ""));
  return { prefix: "", value, decimals, rest: match[2] };
}
