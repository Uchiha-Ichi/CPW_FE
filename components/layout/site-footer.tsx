import { getTranslations } from "next-intl/server";
import { SocialLinks } from "@/components/contact/social-links";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/api/site-settings";
import { addressLine, brandName } from "@/lib/site/contact-info";
import { visibleSocials } from "@/lib/site/socials";

const navLinkClass = "max-[519px]:block max-[519px]:py-[11px]";

export async function SiteFooter() {
  const [t, nav, meta, settings] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Header"),
    getTranslations("Meta"),
    getSiteSettings(),
  ]);
  const brand = brandName(settings, meta("siteName"));
  const address = addressLine(settings?.offices.headquarters);
  const socials = visibleSocials(settings);
  const hasContact = Boolean(address || settings?.phone || settings?.email);

  return (
    <footer
      className="relative w-full px-4 pt-11 pb-6 text-sm"
      style={{
        background: "linear-gradient(180deg, transparent, var(--vcb-panel-2))",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vcb-gold),var(--tech-cyan),transparent)]"
      />
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="font-semibold text-[1.05rem] mb-3">
            {brand}
          </div>
          <p className="text-muted-foreground text-[0.9rem] max-w-[36ch]">{t("tagline")}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-3">{t("navigation")}</h2>
          {/* Điện thoại (< 520px): mỗi liên kết cao ~40px để dễ chạm; khoảng cách giữa các dòng nằm trong vùng chạm nên bỏ space-y. */}
          <ul className="space-y-2 text-muted-foreground max-[519px]:space-y-0">
            <li><Link href="/" className={navLinkClass}>{nav("nav.home")}</Link></li>
            <li><Link href="/about" className={navLinkClass}>{nav("nav.about")}</Link></li>
            <li><Link href="/careers" className={navLinkClass}>{nav("nav.careers")}</Link></li>
            <li><Link href="/contact" className={navLinkClass}>{nav("nav.contact")}</Link></li>
            <li><Link href="/news" className={navLinkClass}>{nav("nav.news")}</Link></li>
          </ul>
        </div>
        {(hasContact || socials.length > 0) && (
          <div>
            <h2 className="font-semibold mb-3">{t("contact")}</h2>
            {hasContact && (
              <ul className="text-muted-foreground text-[0.92rem] space-y-2">
                {address && <li>{address}</li>}
                {settings?.phone && <li>{settings.phone}</li>}
                {settings?.email && <li>{settings.email}</li>}
              </ul>
            )}
            {socials.length > 0 && (
              <div className="mt-4">
                <SocialLinks items={socials} size={24} />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center text-muted-foreground pt-6 border-t">
        <span>© {new Date().getFullYear()} {brand}. {t("rights")}</span>
        {settings?.taxId && <span>{t("taxId")}: {settings.taxId}</span>}
      </div>
    </footer>
  );
}
