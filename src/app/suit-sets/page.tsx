import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SuitSetsPage() {
  const products = await getFeaturedProducts();

  const suitSets = products.filter((product) => {
    const searchText = [
      product.name,
      product.description,
      product.fabric,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      searchText.includes("suit") ||
      searchText.includes("salwar") ||
      searchText.includes("anarkali")
    );
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-[#7A1F3D]">
          Suit Sets
        </h1>

        <p className="mt-4 text-gray-600">
          Discover elegant suit sets and traditional outfits for every
          occasion.
        </p>
      </div>

      {/* Products */}
      {suitSets.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {suitSets.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
                  className="h-80 w-full object-cover"
                />

                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#7A1F3D] px-3 py-1 text-sm font-semibold text-white">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Information */}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-[#2f1d24]">
                  {product.name}
                </h2>

                {product.fabric && (
                  <p className="mt-2 text-sm text-gray-500">
                    {product.fabric}
                  </p>
                )}

                <p className="mt-3 text-lg font-bold text-[#7A1F3D]">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <Link
                  href={`/product/${product.slug}`}
                  className="mt-5 inline-block rounded-lg bg-[#7A1F3D] px-5 py-2 text-white transition hover:bg-[#5A1730]"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#2f1d24]">
            Suit Sets Coming Soon
          </h2>

          <p className="mt-3 text-gray-600">
            We are adding beautiful new suit sets to our collection.
          </p>

          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-lg bg-[#7A1F3D] px-6 py-3 font-semibold text-white"
          >
            Browse All Products
          </Link>
        </div>
      )}
    </main>
  );
}