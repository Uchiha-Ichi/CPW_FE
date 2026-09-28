import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LenisProvider } from "@/components/layout/lenis-provider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LenisProvider>
  );
}
