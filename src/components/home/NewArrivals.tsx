import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({
  products,
}: NewArrivalsProps) {
  return (
    <section className="py-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8A24A]">
            JUST ARRIVED
          </p>

          <h2 className="mt-2 text-4xl font-bold text-[#7A1F3D]">
            ✨ New Arrivals
          </h2>

          <p className="mt-3 text-gray-600">
            Discover the newest additions to our collection.
          </p>
        </div>

        <Link
          href="/new-arrivals"
          className="rounded-full border border-[#7A1F3D] px-6 py-3 font-semibold text-[#7A1F3D] transition hover:bg-[#7A1F3D] hover:text-white"
        >
          View All →
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative h-80 overflow-hidden">
              <Image
                src={product.mainImageUrl}
                alt={product.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
              />

              <span className="absolute left-4 top-4 rounded-full bg-[#7A1F3D] px-4 py-2 text-xs font-bold text-white">
                NEW
              </span>

              <button className="absolute right-4 top-4 rounded-full bg-white p-2 shadow">
                ❤️
              </button>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-[#222]">
                {product.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {product.fabric}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#7A1F3D]">
                ₹{product.price}
              </p>

              <div className="mt-2 text-yellow-500">
                ★★★★★
              </div>

              <Link
                href={`/product/${product.slug}`}
                className="mt-6 block rounded-full bg-[#7A1F3D] py-3 text-center font-semibold text-white transition hover:bg-[#5A1730]"
              >
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}