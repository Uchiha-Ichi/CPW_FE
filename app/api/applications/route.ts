import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/admin/auth/same-origin";
import { forwardedClientIpHeaders } from "@/lib/api/client-ip";
import { API_BASE } from "@/lib/api/config";

// Form nộp hồ sơ (components/careers/application-form-fields.tsx) gửi vào đây thay vì gọi thẳng backend: trình
// duyệt chỉ nói chuyện với domain của FE, URL backend chỉ server Next biết.
// Vercel chặn body trên 4.5 MB trước khi request tới route này, nên form giới hạn CV 4 MB
// (lib/applications/schema.ts). Kiểm cùng ngưỡng ở đây để `next dev` (không có giới hạn của Vercel) cũng ra lỗi
// giống prod.
const MAX_BODY_BYTES = 4_500_000;

export async function POST(req: NextRequest) {
  // Chỉ nhận request từ chính site (lib/admin/auth/same-origin.ts), giống các route ghi dữ liệu của admin.
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 403 });
  }
  if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Tệp gửi lên quá lớn" }, { status: 413 });
  }

  // Chuyển nguyên body cùng Content-Type gốc: boundary của multipart nằm trong Content-Type, giữ nguyên cặp này thì
  // file CV không phải mã hoá lại. Kèm IP thật của người gửi (lib/api/client-ip.ts) để backend giới hạn tần suất
  // theo người dùng, không đếm chung theo IP của server Next.
  const contentType = req.headers.get("content-type");
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...forwardedClientIpHeaders(req.headers),
      },
      body: await req.arrayBuffer(),
      cache: "no-store",
    });
    return new NextResponse(await res.arrayBuffer(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (err) {
    console.error("POST /api/applications: backend request failed", err);
    return NextResponse.json(
      { message: "Không gửi được hồ sơ, vui lòng thử lại sau" },
      { status: 502 },
    );
  }
}
