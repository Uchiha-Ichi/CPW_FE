import { friendlyMessages } from "@/lib/admin/api-error";
import { createAdminRequest, JSON_HEADERS } from "@/lib/admin/request";

const APPLICATIONS = "applications";
const CONTACTS = "contacts";

// friendlyMessages viết câu 404 cho bài viết; bảng tài nguyên cần câu chung.
function resourceMessages(status: number, body: unknown): string[] {
  if (status === 404) return ["Không tìm thấy mục này. Có thể đã bị xóa, hãy tải lại trang."];
  return friendlyMessages(status, body);
}

const request = createAdminRequest(resourceMessages);

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
