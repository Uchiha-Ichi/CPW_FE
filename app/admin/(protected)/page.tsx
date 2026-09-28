import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const COLLECTIONS: { path: string; label: string }[] = [
  { path: "pages", label: "Nội dung trang" },
  { path: "news", label: "Tin tức" },
  { path: "products", label: "Sản phẩm" },
  { path: "jobs", label: "Tuyển dụng" },
  { path: "photos", label: "Thư viện ảnh" },
  { path: "network", label: "Bản đồ quốc gia" },
  { path: "team", label: "Đội ngũ" },
];

async function countFor(path: string, token: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export default async function AdminOverviewPage() {
  const token = (await cookies()).get("admin_token")!.value;
  const counts = await Promise.all(
    COLLECTIONS.map((c) => countFor(c.path, token))
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {COLLECTIONS.map((c, i) => (
          <li key={c.path} className="rounded-md border p-4">
            <p className="text-2xl font-semibold">{counts[i]}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
