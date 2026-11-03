import { ApiError } from "@/lib/admin/api-error";
import {
  assertUploadableImage,
  createAdminRequest,
  JSON_HEADERS,
  type UploadedImage,
} from "@/lib/admin/request";
import { pageFriendlyMessages } from "./errors";
import type { AdminPageView, BlockTypesResponse, EditorBlock } from "./types";

const request = createAdminRequest(pageFriendlyMessages);

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
  assertUploadableImage(file);
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>("/uploads?folder=pages", {
    method: "POST",
    body: form,
  });
}

// Khớp APP_CONSTANTS.MAX_VIDEO_FILE_SIZE ở backend (cpw_be) — trần 100MB của Cloudinary, chung cho loop và player.
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Video của trang BẮT BUỘC đi qua ?folder=pages&variant=..., giống quy tắc của uploadPageImage.
export async function uploadPageVideo(
  file: File,
  variant: "loop" | "player",
): Promise<UploadedImage> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new ApiError(400, ["Chỉ nhận video MP4, MOV hoặc WEBM."]);
  }
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    throw new ApiError(400, [`Video quá lớn (tối đa ${MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024)}MB).`]);
  }
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>(`/uploads/video?folder=pages&variant=${variant}`, {
    method: "POST",
    body: form,
  });
}
