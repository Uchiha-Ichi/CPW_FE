import { AdminResourceTable } from "@/components/admin/resource-table";
import { NETWORK_CONFIG } from "@/lib/admin/resource-config";

export default function AdminNetworkPage() {
  return <AdminResourceTable config={NETWORK_CONFIG} />;
}
