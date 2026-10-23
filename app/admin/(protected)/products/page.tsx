import { AdminResourceTable } from "@/components/admin/resources/resource-table";
import { PRODUCTS_CONFIG } from "@/lib/admin/resources/config";

export default function AdminProductsPage() {
  return <AdminResourceTable config={PRODUCTS_CONFIG} />;
}
