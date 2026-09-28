import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t px-4 py-10 text-sm">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="font-semibold text-[1.05rem] mb-3">
            Viễn Chí Bảo
          </div>
          <p className="text-muted-foreground text-[0.9rem] max-w-[36ch]">Trang sức được tạo nên từ sự chỉn chu trong thiết kế, chất liệu và chế tác.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Điều hướng</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/">Trang chủ</Link></li>
            <li><Link href="/about">Về chúng tôi</Link></li>
            <li><Link href="/careers">Tuyển dụng</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
            <li><Link href="/news">Tin tức</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Liên hệ</h4>
          <ul className="text-muted-foreground text-[0.92rem] space-y-2">
            <li>39 Cầu Diễn, Xuân Phương, Hà Nội</li>
            <li>086.836.6662</li>
            <li>vienchibao6868@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center text-muted-foreground pt-6 border-t">
        <span>© {new Date().getFullYear()} Viễn Chí Bảo. Mọi quyền được bảo lưu.</span>
        <span>Mã số doanh nghiệp: 0107994675</span>
      </div>
    </footer>
  );
}
