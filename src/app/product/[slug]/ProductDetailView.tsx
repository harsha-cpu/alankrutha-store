"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import CartActions from "@/components/CartActions";
import type { StorefrontProduct } from "@/lib/storefront-data";

type Props = {
  product: StorefrontProduct;
  relatedProducts: StorefrontProduct[];
  similarProducts: StorefrontProduct[];
};

export default function ProductDetailView({ product, relatedProducts, similarProducts }: Props) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "S");
  const [selectedColour, setSelectedColour] = useState(product.colours[0] || "Deep Maroon");

  const availabilityBadge = useMemo(() => {
    if (product.availability === "Out of Stock") return "Out of Stock";
    if (product.availability === "Low Stock") return "Low Stock";
    return "In Stock";
  }, [product.availability]);

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-[0_20px_80px_rgba(122,31,61,0.08)]">
        <Link href="/catalog" className="text-sm font-medium text-[#7A1F3D] underline underline-offset-4">← Back to catalog</Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery product={product} />

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Product details</p>
            <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">{product.name}</h1>
            <p className="mt-3 text-stone-700">{product.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-sm font-medium text-[#7A1F3D]">{product.category}</span>
              <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-sm font-medium text-[#C8A24A]">{availabilityBadge}</span>
              {product.isFeatured ? <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-sm font-medium text-[#7A1F3D]">Featured</span> : null}
              {product.isNewArrival ? <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-sm font-medium text-[#7A1F3D]">New Arrival</span> : null}
              {product.isBestseller ? <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-sm font-medium text-[#7A1F3D]">Best Seller</span> : null}
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="text-3xl font-semibold text-[#7A1F3D]">₹{product.price.toLocaleString("en-IN")}</div>
              {product.discountPercentage > 0 ? <div className="text-sm text-emerald-700">{product.discountPercentage}% off</div> : null}
            </div>

            <div className="mt-6 grid gap-3 text-sm text-stone-700">
              <div className="rounded-[1rem] bg-[#FFFDF8] p-3"><strong>SKU:</strong> {product.sku}</div>
              <div className="rounded-[1rem] bg-[#FFFDF8] p-3"><strong>Fabric:</strong> {product.fabric}</div>
              <div className="rounded-[1rem] bg-[#FFFDF8] p-3"><strong>Colour:</strong> {selectedColour}</div>
              <div className="rounded-[1rem] bg-[#FFFDF8] p-3"><strong>Sizes:</strong> {product.sizes.join(" • ")}</div>
              <div className="rounded-[1rem] bg-[#FFFDF8] p-3"><strong>Stock:</strong> {product.stockQuantity} available</div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8A24A]">Choose size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-3 py-2 text-sm ${selectedSize === size ? "border-[#7A1F3D] bg-[#7A1F3D] text-white" : "border-[#f0dfcf] text-[#7A1F3D]"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8A24A]">Choose colour</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colours.map((colour) => (
                  <button
                    key={colour}
                    onClick={() => setSelectedColour(colour)}
                    className={`rounded-full border px-3 py-2 text-sm ${selectedColour === colour ? "border-[#7A1F3D] bg-[#7A1F3D] text-white" : "border-[#f0dfcf] text-[#7A1F3D]"}`}
                  >
                    {colour}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <CartActions productId={product.id} disabled={product.availability === "Out of Stock"} label="Add to Cart" />
              <CartActions productId={product.id} disabled={product.availability === "Out of Stock"} label="Buy Now" redirectAfterAdd="/checkout" />
              <button className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">Add to Wishlist</button>
              <button className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">Share Product</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-[#F8F1E7] p-6 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-xl text-[#7A1F3D]">Care instructions</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              {product.washCareInstructions.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#7A1F3D]">Shipping</h2>
            <p className="mt-3 text-sm text-stone-700">{product.shippingInfo}</p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#7A1F3D]">Returns</h2>
            <p className="mt-3 text-sm text-stone-700">{product.returnPolicy}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Related products</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} className="rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                  <p className="font-semibold text-[#2f1d24]">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{item.category}</p>
                  <p className="mt-2 font-semibold text-[#7A1F3D]">₹{item.price.toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Similar products</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {similarProducts.map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} className="rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                  <p className="font-semibold text-[#2f1d24]">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{item.category}</p>
                  <p className="mt-2 font-semibold text-[#7A1F3D]">₹{item.price.toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
