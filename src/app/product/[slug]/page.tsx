import { notFound } from "next/navigation";
import ProductDetailView from "./ProductDetailView";
import { getProductBySlug, getRelatedProducts, getSimilarProducts } from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, similarProducts] = await Promise.all([
    getRelatedProducts(product, 4),
    getSimilarProducts(product, 4),
  ]);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} similarProducts={similarProducts} />;
}
