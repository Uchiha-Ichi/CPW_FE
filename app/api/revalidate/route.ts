import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTag } from "@/lib/api/tags";

// Chỉ backend gọi route này: admin ghi dữ liệu thành công thì cpw_be (RevalidateFeInterceptor) gửi danh sách tag
// cần xoá cache kèm khoá chung REVALIDATE_SECRET, để site public hiện bản mới ngay. Không dính cookie nào.
const SECRET_HEADER = "x-revalidate-secret";
const KNOWN_TAGS = new Set<string>(Object.values(CACHE_TAGS));

function secretMatches(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function readTags(body: unknown): CacheTag[] {
  if (typeof body !== "object" || body === null) return [];
  const { tags } = body as { tags?: unknown };
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag): tag is CacheTag => typeof tag === "string" && KNOWN_TAGS.has(tag));
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error("POST /api/revalidate: missing environment variable REVALIDATE_SECRET");
    return NextResponse.json({ message: "Chưa cấu hình xoá cache" }, { status: 503 });
  }
  if (!secretMatches(req.headers.get(SECRET_HEADER), secret)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 401 });
  }

  const tags = readTags(await req.json().catch(() => null));
  if (tags.length === 0) {
    return NextResponse.json({ message: "Không có tag hợp lệ" }, { status: 400 });
  }
  // Gọi từ ngoài Server Action (webhook): tài liệu Next 16 dặn dùng { expire: 0 } để dữ liệu hết hạn ngay.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
