import { AdminResourceTable } from "@/components/admin/resource-table";
import { TEAM_CONFIG } from "@/lib/admin/resource-config";

export default function AdminTeamPage() {
  return <AdminResourceTable config={TEAM_CONFIG} />;
}
