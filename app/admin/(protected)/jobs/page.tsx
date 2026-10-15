import { AdminResourceTable } from "@/components/admin/resource-table";
import { ApplicationsPanel } from "@/components/admin/applications-panel";
import { JOBS_CONFIG } from "@/lib/admin/resource-config";

// Mỗi khối tự bọc AdminPage nên không cần div padding riêng ở đây.
export default function AdminJobsPage() {
  return (
    <div>
      <AdminResourceTable config={JOBS_CONFIG} />
      <ApplicationsPanel />
    </div>
  );
}
