import { AdminResourceTable } from "@/components/admin/resources/resource-table";
import { ApplicationsPanel } from "@/components/admin/resources/applications-panel";
import { JOBS_CONFIG } from "@/lib/admin/resources/config";

// Mỗi khối tự bọc AdminPage nên không cần div padding riêng ở đây.
export default function AdminJobsPage() {
  return (
    <div>
      <AdminResourceTable config={JOBS_CONFIG} />
      <ApplicationsPanel />
    </div>
  );
}
