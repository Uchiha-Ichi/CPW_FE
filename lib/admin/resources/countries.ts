import data from "./countries.data.json";

// Danh sách quốc gia (mã ISO 3166-1 alpha-2 + toạ độ tâm) trích từ gói npm "world-countries"
// (mledoze/countries), giấy phép ODbL 1.0: https://opendatacommons.org/licenses/odbl/1.0/
// Tên tiếng Việt lấy từ Intl.DisplayNames của trình duyệt; thiếu thì dùng tên tiếng Anh.

export interface CountryOption {
  code: string; // 2 chữ thường, đúng định dạng flagcdn.com và trường `code` của backend
  name: string; // tên tiếng Việt
  en: string; // tên tiếng Anh, dùng để tìm kiếm
  pos: string; // "x,y" theo % trên public/maps/world.svg
}

// Phép chiếu Miller của public/maps/world.svg, hệ số khớp bằng bình phương tối thiểu trên
// khung bao của 11 nước đo từ các path trong SVG (sai số khoảng 1% chiều cao ảnh).
const X_PER_DEG = 0.2901240853;
const X_AT_ZERO = 47.7004923;
const Y_PER_UNIT = -26.369040959;
const Y_AT_ZERO = 54.33946971;

const rad = (deg: number) => (deg * Math.PI) / 180;
const miller = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * rad(lat)));
const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)) * 10) / 10;

export function latLngToPos(lat: number, lng: number): string {
  const x = clamp(X_PER_DEG * lng + X_AT_ZERO);
  const y = clamp(Y_PER_UNIT * miller(lat) + Y_AT_ZERO);
  return `${x},${y}`;
}

let cached: CountryOption[] | null = null;

export function getCountryOptions(): CountryOption[] {
  if (cached) return cached;
  const names = new Intl.DisplayNames(["vi"], { type: "region" });
  cached = data
    .map((c) => {
      let name: string | undefined;
      try {
        name = names.of(c.code.toUpperCase());
      } catch {
        name = undefined;
      }
      return {
        code: c.code,
        name: name && name !== c.code.toUpperCase() ? name : c.en,
        en: c.en,
        pos: latLngToPos(c.lat, c.lng),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return cached;
}

export function findCountry(code: string | undefined): CountryOption | undefined {
  const key = code?.trim().toLowerCase();
  if (!key) return undefined;
  return getCountryOptions().find((c) => c.code === key);
}
