import { AdminResourceTable } from "@/components/admin/resource-table";
import { PRODUCTS_CONFIG } from "@/lib/admin/resource-config";

export default function AdminProductsPage() {
  return <AdminResourceTable config={PRODUCTS_CONFIG} />;
}
