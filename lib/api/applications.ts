import { API_BASE } from "./config";

export type SubmitApplicationResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "failed" };

// POST /applications (public, multipart/form-data vì có file CV). Gọi trực tiếp từ client component
// (API_BASE là NEXT_PUBLIC_*): đi qua Server Action sẽ phải mã hoá lại File, tốn thêm một vòng.
export async function createApplication(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    if (res.status === 400) return { ok: false, reason: "invalid" };
    console.error(`createApplication: API responded ${res.status}`);
    return { ok: false, reason: "failed" };
  } catch (err) {
    console.error("createApplication: request failed", err);
    return { ok: false, reason: "failed" };
  }
}
