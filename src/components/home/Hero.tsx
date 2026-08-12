"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F8F3EE]">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {showWelcome ? (
          <div className="text-center transition-all duration-1000">
            <h1 className="text-5xl font-bold text-[#2f1d24]">
              Welcome to Alankrutha
            </h1>

            <p className="mt-5 text-xl text-gray-600">
              Premium Indian Ethnic Wear
            </p>

            <Link
              href="/catalog"
              className="mt-8 inline-block rounded-full bg-[#7A1F3D] px-8 py-3 text-white transition hover:bg-[#5d1830]"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                New Arrival
              </span>

              <h2 className="mt-5 text-5xl font-bold text-[#2f1d24]">
                Emerald Green Lehenga
              </h2>

              <p className="mt-5 text-lg text-gray-600">
                Elegant handcrafted ethnic wear designed for weddings,
                festivals and special occasions.
              </p>

              <h3 className="mt-6 text-3xl font-bold text-[#7A1F3D]">
                ₹12,500
              </h3>

              <Link
                href="/product/emerald-green-lehenga"
                className="mt-8 inline-block rounded-full bg-[#7A1F3D] px-8 py-3 text-white transition hover:bg-[#5d1830]"
              >
                Shop Now
              </Link>
            </div>

            <div>
              <img
                src="/WhatsApp Image 2026-07-16 at 22.46.26.png"
                alt="Featured Product"
                className="mx-auto rounded-2xl shadow-xl"
              />
            </div>

          </div>
        )}

      </div>
    </section>
  );
}