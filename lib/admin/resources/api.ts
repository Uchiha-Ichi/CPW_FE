import { ApiError, friendlyMessages } from "@/lib/admin/api-error";

const BASE = "/api/admin/proxy";
const JSON_HEADERS = { "Content-Type": "application/json" };
const APPLICATIONS = "applications";
const CONTACTS = "contacts";

// friendlyMessages viết câu 404 cho bài viết; bảng tài nguyên cần câu chung.
function resourceMessages(status: number, body: unknown): string[] {
  if (status === 404) return ["Không tìm thấy mục này. Có thể đã bị xóa, hãy tải lại trang."];
  return friendlyMessages(status, body);
}

// Cùng khuôn với request() trong news/api.ts và site-settings/api.ts.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, resourceMessages(0, null));
  }
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) throw new ApiError(res.status, resourceMessages(res.status, body));
  return body as T;
}

const enc = encodeURIComponent;

// `path` là ResourceConfig.path ("jobs", "network", "products").
export const listResource = <T>(path: string) => request<T[]>(`/${path}`);

export const createResource = (path: string, payload: Record<string, unknown>) =>
  request<unknown>(`/${path}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const updateResource = (path: string, id: string, payload: Record<string, unknown>) =>
  request<unknown>(`/${path}/${enc(id)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const deleteResource = (path: string, id: string) =>
  request<unknown>(`/${path}/${enc(id)}`, { method: "DELETE" });

export const listApplications = <T>() => listResource<T>(APPLICATIONS);

export const updateApplicationStatus = (id: string, status: string) =>
  request<unknown>(`/${APPLICATIONS}/${enc(id)}/status`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });

export const deleteApplication = (id: string) => deleteResource(APPLICATIONS, id);

// Tin nhắn gửi từ form trang Liên hệ (backend: src/contacts), mới nhất trước.
export const listContacts = <T>() => listResource<T>(CONTACTS);

export const updateContactStatus = (id: string, status: string) =>
  request<unknown>(`/${CONTACTS}/${enc(id)}/status`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });

export const deleteContact = (id: string) => deleteResource(CONTACTS, id);
