import { API_BASE } from "./config";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// POST /contacts (public). Không ném lỗi: người gọi quyết định hiện thông báo gì.
export async function createContact(input: ContactInput): Promise<{ ok: true } | { ok: false }> {
  try {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`createContact: API responded ${res.status}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("createContact: request failed", err);
    return { ok: false };
  }
}
