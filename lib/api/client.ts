export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function fetchPublicList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`fetchPublicList(${path}): API responded ${res.status}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`fetchPublicList(${path}): fetch failed`, err);
    return [];
  }
}
