import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function NewArrivalsPage() {
  const products = await getFeaturedProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#7A1F3D]">
          New Arrivals
        </h1>

        <p className="mt-4 text-gray-600">
          Explore our newest sarees, suit sets and festive wear.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="h-80 w-full object-cover"
            />

            <div className="p-5">
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">
                NEW
              </span>

              <h2 className="mt-3 text-xl font-semibold">
                {product.name}
              </h2>

              <p className="mt-2 text-lg font-bold text-[#7A1F3D]">
                ₹{product.price}
              </p>

              <Link
                href={`/catalog/${product.slug}`}
                className="mt-4 inline-block rounded-lg bg-[#7A1F3D] px-5 py-2 text-white"
              >
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}