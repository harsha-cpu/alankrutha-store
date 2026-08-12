"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAppUser, signOutUser } from "@/lib/auth";

export default function BrandHeader() {
  const [user, setUser] = useState<{
    full_name: string;
    is_admin: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentAppUser();
      setUser(currentUser);
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await signOutUser();
    setUser(null);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e9dcc7] bg-[#FFFDF8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Alankrutha Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5b4450]">

          <Link
            href="/"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            Home
          </Link>

          <Link
            href="/catalog"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            Sarees
          </Link>

          <Link
            href="/suit-sets"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            Suit Sets
          </Link>

          <Link
            href="/new-arrivals"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            New Arrivals
          </Link>

          <Link
            href="/about"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            Contact
          </Link>

          <Link
            href="/cart"
            className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
          >
            Cart
          </Link>

          {user && (
            <Link
              href="/orders"
              className="rounded-full px-3 py-2 transition hover:bg-[#F8F1E7]"
            >
              Orders
            </Link>
          )}

          {user?.is_admin && (
            <Link
              href="/admin"
              className="rounded-full border border-[#d8bb87] px-4 py-2 font-medium text-[#7A1F3D] transition hover:bg-[#F8F1E7]"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              className="rounded-full bg-[#7A1F3D] px-4 py-2 font-medium text-white transition hover:bg-[#5b152d]"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#7A1F3D] px-4 py-2 font-medium text-white transition hover:bg-[#5b152d]"
            >
              Login
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}