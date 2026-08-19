import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function CollectionsPage() {
  const products = await getFeaturedProducts();

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-12 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-3xl border border-[#f2e2d0] bg-white p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">
            New Arrivals
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[#7A1F3D]">
            Explore Our Latest Collection
          </h1>

          <p className="mt-4 text-gray-600">
            Discover our newest sarees, suit sets and festive wear.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-[#f2e2d0] bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="h-80 w-full object-cover"
              />

              <div className="p-5">
                {product.badge && (
                  <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-xs font-semibold text-[#7A1F3D]">
                    {product.badge}
                  </span>
                )}

                <h2 className="mt-4 text-xl font-bold text-[#2F1D24]">
                  {product.name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {product.description}
                </p>

                <p className="mt-4 text-lg font-semibold text-[#7A1F3D]">
                  ₹{product.price}
                </p>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/product/${product.slug}`}
                    className="rounded-lg bg-[#7A1F3D] px-5 py-2 text-white transition hover:bg-[#5E1831]"
                  >
                    View Product
                  </Link>

                  <Link
                    href="/catalog"
                    className="rounded-lg border border-[#7A1F3D] px-5 py-2 text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
                  >
                    Shop More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}