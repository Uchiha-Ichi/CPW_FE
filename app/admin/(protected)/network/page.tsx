import { AdminResourceTable } from "@/components/admin/resources/resource-table";
import { NETWORK_CONFIG } from "@/lib/admin/resources/config";

export default function AdminNetworkPage() {
  return <AdminResourceTable config={NETWORK_CONFIG} />;
}
