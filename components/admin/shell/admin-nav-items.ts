import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  MapPin,
  Newspaper,
  Package,
  Phone,
  type LucideIcon,
} from "lucide-react";

// Nguồn duy nhất cho menu admin. Không có "use client" để cả sidebar (client) lẫn trang Tổng quan
// (server) đọc được: mảng nằm trong module "use client" thì server chỉ nhận client reference.
export const ADMIN_NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Nội dung trang", icon: FileText },
  { href: "/admin/news", label: "Tin tức", icon: Newspaper },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/jobs", label: "Tuyển dụng", icon: Briefcase },
  { href: "/admin/contacts", label: "Khách liên hệ", icon: Mail },
  { href: "/admin/network", label: "Bản đồ quốc gia", icon: MapPin },
  { href: "/admin/settings", label: "Thông tin liên hệ", icon: Phone },
];

// `/admin` chỉ khớp chính nó; các mục khác khớp cả trang con (ví dụ /admin/news/new thuộc "Tin tức").
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
