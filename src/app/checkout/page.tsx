import Link from "next/link";
import CheckoutView from "./CheckoutView";
import { getCheckoutData } from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function CheckoutPage() {
  const { user, addresses, items, summary } = await getCheckoutData();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Checkout</p>
          <h1 className="font-serif text-3xl text-[#7A1F3D]">Sign in to checkout</h1>
          <p className="text-stone-600">Your cart and saved delivery details are linked to your Alankrutha account.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login?next=/checkout" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
              Sign in
            </Link>
            <Link href="/catalog" className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Checkout</p>
          <h1 className="font-serif text-3xl text-[#7A1F3D]">Your cart is empty</h1>
          <p className="text-stone-600">Add a few pieces before starting checkout.</p>
          <Link href="/catalog" className="w-fit rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
            Browse catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CheckoutView
      userName={user.full_name}
      userEmail={user.email}
      addresses={addresses}
      items={items}
      summary={summary}
    />
  );
}