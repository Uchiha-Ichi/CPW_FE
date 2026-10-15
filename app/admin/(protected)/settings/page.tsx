import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";

export default function AdminSettingsPage() {
  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Thông tin liên hệ" />
      <SiteSettingsForm />
    </AdminPage>
  );
}
