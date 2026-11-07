export type SubmitApplicationResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "failed" };

// Gửi hồ sơ (multipart/form-data vì có file CV) tới /api/applications trên chính domain FE; rewrites trong
// next.config.ts chuyển nguyên sang POST /applications của backend, không qua code nào của FE. Gọi từ client
// component nên không import lib/api/config.ts (server-only): trình duyệt không biết URL backend.
export async function createApplication(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  try {
    const res = await fetch("/api/applications", {
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
