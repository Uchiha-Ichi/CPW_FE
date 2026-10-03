import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold leading-[1.2]">Thông tin liên hệ</h1>
      <SiteSettingsForm />
    </div>
  );
}
