import Link from "next/link";

// Thanh thông báo cố định ở đáy trang xem trước (chỉ admin thấy). Chữ gõ cứng tiếng Việt, không
// nằm trong messages/*.json. Dùng Link của next/link, không dùng Link của i18n/navigation, vì
// /admin không có tiền tố ngôn ngữ.
export function PagePreviewBar({ hasDraft }: { hasDraft: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--vcb-line-strong)] bg-[color-mix(in_srgb,var(--vcb-panel)_92%,transparent)] backdrop-blur-[22px]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-sm">
        <p className="text-foreground">
          {hasDraft
            ? "Đang xem bản nháp (chưa đăng). Sau khi lưu nháp lần nữa, tải lại tab này để thấy bản mới."
            : "Trang chưa có bản nháp: đang hiện bản đã đăng."}
        </p>
        <Link
          href="/admin/pages"
          prefetch={false}
          className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Về trang soạn
        </Link>
      </div>
    </div>
  );
}
