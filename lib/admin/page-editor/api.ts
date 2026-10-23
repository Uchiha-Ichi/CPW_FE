import { ApiError } from "@/lib/admin/api-error";
import { pageFriendlyMessages } from "./errors";
import type {
  AdminPageView,
  BlockTypesResponse,
  EditorBlock,
  UploadedImage,
} from "./types";

const BASE = "/api/admin/proxy";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const JSON_HEADERS = { "Content-Type": "application/json" };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, pageFriendlyMessages(0, null));
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
  if (!res.ok) throw new ApiError(res.status, pageFriendlyMessages(res.status, body));
  return body as T;
}

const enc = encodeURIComponent;

export const getBlockTypes = () => request<BlockTypesResponse>("/pages/block-types");

export const getAdminPage = (pageKey: string) =>
  request<AdminPageView>(`/pages/${enc(pageKey)}`);

export const saveDraft = (pageKey: string, baseVersion: number, blocks: EditorBlock[]) =>
  request<AdminPageView>(`/pages/${enc(pageKey)}/draft`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ baseVersion, blocks }),
  });

export const publishPage = (pageKey: string, baseVersion: number) =>
  request<AdminPageView>(`/pages/${enc(pageKey)}/publish`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ baseVersion }),
  });

export const discardDraft = (pageKey: string, baseVersion: number) =>
  request<AdminPageView>(`/pages/${enc(pageKey)}/discard`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ baseVersion }),
  });

// Ảnh của trang BẮT BUỘC đi qua ?folder=pages, nếu không backend từ chối khi lưu nháp.
export async function uploadPageImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, ["Chỉ nhận tệp ảnh (PNG, JPG, WEBP, GIF, HEIC)."]);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(400, ["Ảnh quá lớn (tối đa 10MB)."]);
  }
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>("/uploads?folder=pages", {
    method: "POST",
    body: form,
  });
}

export const MAX_VIDEO_UPLOAD_BYTES = { loop: 30 * 1024 * 1024, player: 100 * 1024 * 1024 } as const;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Video của trang BẮT BUỘC đi qua ?folder=pages&variant=..., giống quy tắc của uploadPageImage.
export async function uploadPageVideo(
  file: File,
  variant: "loop" | "player",
): Promise<UploadedImage> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new ApiError(400, ["Chỉ nhận video MP4, MOV hoặc WEBM."]);
  }
  const maxBytes = MAX_VIDEO_UPLOAD_BYTES[variant];
  if (file.size > maxBytes) {
    throw new ApiError(400, [`Video quá lớn (tối đa ${Math.round(maxBytes / (1024 * 1024))}MB).`]);
  }
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>(`/uploads/video?folder=pages&variant=${variant}`, {
    method: "POST",
    body: form,
  });
}
