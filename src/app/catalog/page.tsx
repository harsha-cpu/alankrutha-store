import Link from "next/link";
import { connection } from "next/server";
import CartActions from "@/components/CartActions";
import {
  getActiveProducts,
  type StorefrontProduct,
} from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rs. ${value.toLocaleString("en-IN")}`;
  }
}

function getBadges(product: StorefrontProduct) {
  const badges = [];

  if (product.isNewArrival) badges.push("New Arrival");
  if (product.isBestseller) badges.push("Best Seller");
  if (product.isFeatured) badges.push("Featured");

  if (product.discountPercentage > 0) {
    badges.push(`${product.discountPercentage}% off`);
  }

  return badges.length ? badges : [product.category];
}

function getStockClasses(
  availability: StorefrontProduct["availability"]
) {
  if (availability === "Out of Stock") {
    return "bg-red-50 text-red-700";
  }

  if (availability === "Low Stock") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

export default async function CatalogPage() {
  // Next.js 16 / Cache Components:
  // The catalog uses live database data, so render this route
  // at request time instead of prerendering it.
  await connection();

  const products = await getActiveProducts();

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#f0dfcf] bg-white/70 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">
              Collections
            </p>

            <h1 className="font-serif text-3xl text-[#7A1F3D] sm:text-4xl">
              Curated for elegant everyday luxury
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-[#d8bb87] px-4 py-2 text-sm font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
          >
            Back home
          </Link>
        </div>

        {products.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
              const image = product.images[0];

              const compareAtPrice =
                product.compareAtPrice &&
                product.compareAtPrice > product.price
                  ? product.compareAtPrice
                  : null;

              return (
                <article
                  key={product.id}
                  className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-5 shadow-[0_12px_40px_rgba(122,31,61,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(122,31,61,0.1)]"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="group block h-60 overflow-hidden rounded-[1.25rem] bg-[#FFFDF8]"
                  >
                    <img
                      src={
                        image?.url ||
                        "/placeholder-images/banarasi-silk-saree.svg"
                      }
                      alt={image?.alt || product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {getBadges(product).map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-[#F5EBDD] px-2.5 py-1 text-xs font-medium text-[#7A1F3D]"
                      >
                        {badge}
                      </span>
                    ))}

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStockClasses(
                        product.availability
                      )}`}
                    >
                      {product.availability}
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-4 block transition hover:text-[#7A1F3D]"
                  >
                    <h2 className="font-serif text-xl text-[#2f1d24]">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="mt-1 text-sm text-stone-600">
                    {product.category}
                  </p>

                  <p className="mt-1 text-sm text-stone-500">
                    {product.fabric}
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="font-semibold text-[#7A1F3D]">
                      {formatCurrency(
                        product.price,
                        product.currency
                      )}
                    </span>

                    {compareAtPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        {formatCurrency(
                          compareAtPrice,
                          product.currency
                        )}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-3">
                    <CartActions
                      productId={product.id}
                      disabled={
                        product.availability === "Out of Stock"
                      }
                      label={
                        product.availability === "Out of Stock"
                          ? "Sold Out"
                          : "Add to Cart"
                      }
                    />

                    <Link
                      href={`/product/${product.slug}`}
                      className="rounded-full border border-[#d8bb87] px-3 py-2 text-sm font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
                    >
                      View
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-8 text-center shadow-sm">
            <p className="font-serif text-2xl text-[#7A1F3D]">
              No active products yet
            </p>

            <p className="mt-2 text-sm text-stone-600">
              Products marked active in the admin dashboard will
              appear here automatically.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}