import Link from "next/link";
import Image from "next/image";
import type { StorefrontProduct } from "@/lib/storefront-data";

interface RelatedProductsProps {
  products: StorefrontProduct[];
}

export function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">
        You Might Also Like
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => {
          const image =
            product.images.find(
              (item) =>
                "isPrimary" in item &&
                item.isPrimary === true,
            )?.url ?? product.images[0]?.url;

          return (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className="group"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <h3 className="mt-2 text-sm font-medium text-gray-800">
                {product.name}
              </h3>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: product.currency || "INR",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}