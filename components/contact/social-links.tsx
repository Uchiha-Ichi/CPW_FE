import type { ReactNode } from "react";
import type { SocialKey } from "@/lib/site/settings-model";
import type { VisibleSocial } from "@/lib/site/socials";

const linkClass =
  "opacity-80 hover:opacity-100 motion-safe:hover:scale-105 transition-opacity motion-safe:transition-transform";

function SocialIcon({ name, size }: { name: SocialKey; size: number }): ReactNode {
  switch (name) {
    case "zalo":
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="9" fill="#0068ff"/><svg x="9" y="9" width="22" height="22" viewBox="0 0 24 24"><path d="M21.821 11.164a6.651 6.651 0 0 0-1.748-4.489C18.256 4.792 15.485 3.5 12.046 3.5c-3.414 0-6.19 1.292-8.031 3.175A6.528 6.528 0 0 0 2.215 11.14c0 3.84 2.822 7.027 6.84 7.643-1.616 1.488-2.616 1.761-3.642 1.637-.113-.013-.238.163-.113.25 1.554 1.139 3.507 1.277 5.253.513l.34-.15c1.477.589 3.255.84 5.153.376 4.606-1.127 5.922-4.996 5.775-10.245zM8.196 15.54h-1.55v-7.1h3.766c.24 0 .385.116.385.342 0 .225-.145.34-.385.34H8.793c.319.462.645.92 1 1.436l2.164 3.093c.125.176.242.345.362.51v-5.38h1.549v7.1h-3.79c-.24 0-.385-.115-.385-.34 0-.226.145-.341.385-.341h1.606c-.322-.455-.654-.917-1.01-1.424l-2.115-3.04a29.835 29.835 0 0 0-.363-.507v5.38z" fill="#fff"/></svg></svg>
      );
    case "facebook":
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="8" fill="#1877f2"/><path d="M22.6 31v-9h3l.5-3.4h-3.5v-2.2c0-1 .3-1.7 1.8-1.7h1.9v-3.1c-.3 0-1.3-.1-2.5-.1-3 0-5 1.8-5 5v2.1h-3.3V22h3.3v9z" fill="#fff"/></svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="9" fill="#111"/><path d="M23.2 10v10.5a4.4 4.4 0 1 1-3.2-4.2v3.2a1.5 1.5 0 1 0 .2 2.8c.9-.1 1.5-.8 1.5-1.8V10h3.1c.3 1.7 1.2 2.8 2.9 3.4v3c-1.4-.2-2.5-.7-3.4-1.5V21a7.2 7.2 0 1 1-7.1-7.2V17a4.2 4.2 0 1 0 2.9 4V10z" fill="#fff"/></svg>
      );
    case "instagram": {
      // id gradient gắn theo kích thước để hai bộ icon (footer 24px, trang liên hệ 32px) cùng trang không trùng id.
      const gradientId = `igGrad-${size}`;
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f58529"/><stop offset=".45" stopColor="#dd2a7b"/><stop offset="1" stopColor="#8134af"/></linearGradient></defs><rect x="5" y="5" width="30" height="30" rx="9" fill={`url(#${gradientId})`}/><rect x="12" y="12" width="16" height="16" rx="5" fill="none" stroke="#fff" strokeWidth="2.2"/><circle cx="20" cy="20" r="4" fill="none" stroke="#fff" strokeWidth="2.2"/><circle cx="26.4" cy="13.7" r="1.5" fill="#fff"/></svg>
      );
    }
    case "youtube":
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><rect x="5" y="9" width="30" height="22" rx="7" fill="#ff0000"/><path d="M17 14.5l9 5.5-9 5.5z" fill="#fff"/></svg>
      );
    case "threads":
      // Tạm: chưa có SVG chính thức của Threads. Thay bằng logo thật khi có.
      return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="9" fill="#111"/><text x="20" y="27" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">@</text></svg>
      );
  }
}

export function SocialLinks({ items, size = 32 }: { items: VisibleSocial[]; size?: number }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={item.label}
          title={item.label}
        >
          <SocialIcon name={item.key} size={size} />
        </a>
      ))}
    </div>
  );
}
