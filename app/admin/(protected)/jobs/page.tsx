import { AdminResourceTable } from "@/components/admin/resource-table";
import { ApplicationsPanel } from "@/components/admin/applications-panel";
import { JOBS_CONFIG } from "@/lib/admin/resource-config";

export default function AdminJobsPage() {
  return (
    <div>
      <AdminResourceTable config={JOBS_CONFIG} />
      <div className="px-6 pb-10">
        <ApplicationsPanel />
      </div>
    </div>
  );
}
