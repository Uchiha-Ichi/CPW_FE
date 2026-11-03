import { friendlyMessages } from "@/lib/admin/api-error";
import {
  assertUploadableImage,
  createAdminRequest,
  JSON_HEADERS,
  type UploadedImage,
} from "@/lib/admin/request";
import type { AdminPost, AdminPostListResponse, PostPayload } from "./types";

const request = createAdminRequest(friendlyMessages);

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
  assertUploadableImage(file);
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>("/uploads?folder=posts", {
    method: "POST",
    body: form,
  });
}
