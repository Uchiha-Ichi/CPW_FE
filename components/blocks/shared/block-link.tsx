import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { hasLocale, type Locale } from "@/lib/i18n/config";

// Đường dẫn nội bộ đã có tiền tố ngôn ngữ ("/vi/about", "/en")? Lấy đoạn đầu, bỏ ?query và #hash.
function hasLocalePrefix(href: string): boolean {
  const firstSegment = href.slice(1).split(/[/?#]/, 1)[0];
  return hasLocale(firstSegment);
}

// "/path" thành liên kết nội bộ có tiền tố ngôn ngữ; "/vi/..." đã có tiền tố thì giữ nguyên;
// https://... mở tab mới.
export function BlockLink({
  href,
  lang,
  className,
  children,
}: {
  href: string;
  lang: Locale;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    if (hasLocalePrefix(href)) {
      return (
        <NextLink href={href} className={className}>
          {children}
        </NextLink>
      );
    }
    return (
      <Link href={href} locale={lang} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
