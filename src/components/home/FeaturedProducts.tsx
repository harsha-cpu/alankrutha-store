"use client";

import Link from "next/link";
import type { Product } from "@/types";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({
  products,
}: FeaturedProductsProps) {
  return (
    <section className="py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#2f1d24]">
          Featured Products
        </h2>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="overflow-hidden rounded-xl border bg-white shadow transition hover:shadow-lg">

              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="h-72 w-full object-cover"
              />

              <div className="p-5">

                <h3 className="text-xl font-semibold">
                  {product.name}
                </h3>

                <p className="mt-2 text-2xl font-bold text-[#7A1F3D]">
                  ₹{product.price}
                </p>

                <Link
                  href={`/product/${product.slug}`}
                  className="mt-5 inline-block rounded-full bg-[#7A1F3D] px-6 py-2 text-white transition hover:bg-[#5d1830]"
                >
                  Shop Now
                </Link>

              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}