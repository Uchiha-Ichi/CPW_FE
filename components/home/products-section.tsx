import { Card } from "@/components/ui/card";
import { getPublicProducts } from "@/lib/api/products";

export async function ProductsSection() {
  const products = await getPublicProducts();
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Sản phẩm</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.name} className="p-6">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
              {product.category}
            </p>
            {product.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
