import { ApiError, friendlyMessages } from "./post-errors";
import type { AdminPost, AdminPostListResponse, PostPayload } from "./post-types";

const BASE = "/api/admin/proxy";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const JSON_HEADERS = { "Content-Type": "application/json" };

export interface UploadedImage {
  url: string;
  publicId: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, friendlyMessages(0, null));
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
  if (!res.ok) throw new ApiError(res.status, friendlyMessages(res.status, body));
  return body as T;
}

const enc = encodeURIComponent;

export const listAdminPosts = (page = 1, limit = 20) =>
  request<AdminPostListResponse>(`/posts/admin?page=${page}&limit=${limit}`);

export const getAdminPost = (id: string) =>
  request<AdminPost>(`/posts/admin/${enc(id)}`);

export const createPost = (payload: PostPayload) =>
  request<AdminPost>("/posts", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const updatePost = (id: string, payload: PostPayload) =>
  request<AdminPost>(`/posts/${enc(id)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const publishPost = (id: string) =>
  request<AdminPost>(`/posts/${enc(id)}/publish`, { method: "PATCH" });

export const unpublishPost = (id: string) =>
  request<AdminPost>(`/posts/${enc(id)}/unpublish`, { method: "PATCH" });

// Backend trả phản hồi rỗng khi xóa.
export const deletePost = (id: string) =>
  request<null>(`/posts/${enc(id)}`, { method: "DELETE" });

// Ảnh bài viết BẮT BUỘC đi qua ?folder=posts, nếu không backend từ chối khi lưu bài.
export async function uploadPostImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, ["Chỉ nhận tệp ảnh (PNG, JPG, WEBP, GIF, HEIC)."]);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(400, ["Ảnh quá lớn (tối đa 10MB)."]);
  }
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>("/uploads?folder=posts", {
    method: "POST",
    body: form,
  });
}
