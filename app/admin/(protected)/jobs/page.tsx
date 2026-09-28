import { AdminResourceTable } from "@/components/admin/resource-table";
import { JOBS_CONFIG } from "@/lib/admin/resource-config";

export default function AdminJobsPage() {
  return <AdminResourceTable config={JOBS_CONFIG} />;
}
