import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PagePreviewBar } from "@/components/admin/page-editor/page-preview-bar";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { EmptyPage } from "@/components/blocks/empty-page";
import { getPagePreview } from "@/lib/admin/page-editor/preview";
import { hasLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ lang: string; pageKey: string }> };

// Nội dung nháp chỉ dành cho admin: không bao giờ dựng sẵn hay cache.
export const dynamic = "force-dynamic";

// Trang xem trước chỉ dành cho admin: không cho công cụ tìm kiếm lập chỉ mục.
export function generateMetadata(): Metadata {
  return { title: "Xem trước", robots: { index: false, follow: false } };
}

// Cùng khung với EmptyPage. Chữ gõ cứng tiếng Việt vì chỉ admin thấy.
function SessionExpired() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold leading-[1.12] md:text-4xl">Phiên đăng nhập đã hết hạn</h1>
      <p className="mt-4 text-muted-foreground">
        Hãy đăng nhập lại ở trang quản trị rồi bấm Xem trước một lần nữa.
      </p>
      <Link
        href="/admin/login"
        prefetch={false}
        className="mt-6 inline-block font-semibold text-primary underline-offset-4 hover:underline"
      >
        Đăng nhập lại
      </Link>
    </section>
  );
}

export default async function PagePreviewPage({ params }: Props) {
  const { lang, pageKey } = await params;
  // Phải kiểm lang trước khi gọi getPagePreview: hàm đó nối lang vào query string không mã hóa.
  if (!hasLocale(lang)) notFound();

  // Block phải render trên server nên trang này tự hỏi backend. Phiên do backend giữ trong cookie: chỉ chuyển
  // nguyên header Cookie sang (không đọc cookie nào ở đây). Không có cookie hoặc phiên hết hạn thì backend trả 401.
  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return <SessionExpired />;

  const result = await getPagePreview(pageKey, lang, cookieHeader);
  if (result.status === "unauthenticated") return <SessionExpired />;
  if (result.status === "not-found") notFound();
  if (result.status === "error") return <EmptyPage variant="error" />;

  const { data } = result;
  return (
    <>
      {data.blocks.length === 0 ? (
        <EmptyPage />
      ) : (
        <BlockRenderer blocks={data.blocks} lang={lang} />
      )}
      <PagePreviewBar hasDraft={data.hasDraft} />
    </>
  );
}
