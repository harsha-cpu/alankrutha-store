"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartItem, CartSummary } from "@/lib/storefront-data";
import { clearCart, getCartItemsForUser, removeCartItem, updateCartQuantity } from "@/lib/storefront-data";

type Props = {
  initialItems: CartItem[];
  initialSummary: CartSummary;
};

export default function CartView({ initialItems, initialSummary }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  async function refreshCart() {
    const result = await getCartItemsForUser();
    setItems(result.items);
    setSummary(result.summary);
  }

  async function handleQuantityChange(itemId: string, nextQuantity: number) {
    setBusyItemId(itemId);
    const result = await updateCartQuantity(itemId, nextQuantity);
    setBusyItemId(null);
    if (result.success) {
      await refreshCart();
      setFeedback("Cart updated.");
    } else {
      setFeedback(result.error || "Unable to update quantity.");
    }
  }

  async function handleRemove(itemId: string) {
    setBusyItemId(itemId);
    const result = await removeCartItem(itemId);
    setBusyItemId(null);
    if (result.success) {
      await refreshCart();
      setFeedback("Item removed from cart.");
    } else {
      setFeedback(result.error || "Unable to remove item.");
    }
  }

  async function handleClearCart() {
    const result = await clearCart();
    if (result.success) {
      await refreshCart();
      setFeedback("Cart cleared.");
    } else {
      setFeedback(result.error || "Unable to clear cart.");
    }
  }

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Cart</p>
            <h1 className="font-serif text-3xl text-[#7A1F3D]">Your cart is empty</h1>
            <p className="mt-3 text-stone-600">Curate your favourite pieces and continue your journey with Alankrutha.</p>
          </div>
          <Link href="/catalog" className="w-fit rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">Continue shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#f0dfcf] bg-white/80 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Cart</p>
            <h1 className="font-serif text-3xl text-[#7A1F3D]">Your curated selection</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/catalog" className="rounded-full border border-[#d8bb87] px-4 py-2 text-sm font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">Continue shopping</Link>
            <button onClick={handleClearCart} className="rounded-full border border-[#d8bb87] px-4 py-2 text-sm font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">Clear cart</button>
          </div>
        </div>

        {feedback ? <p className="rounded-full bg-[#F8F1E7] px-4 py-2 text-sm text-stone-700">{feedback}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.product?.images?.[0]?.url || "/placeholder-images/banarasi-silk-saree.svg"} alt={item.product?.name || "Cart item"} className="h-20 w-20 rounded-[1rem] object-cover" />
                  <div>
                    <p className="font-semibold text-[#2f1d24]">{item.product?.name}</p>
                    <p className="text-sm text-stone-600">Size: {item.product?.sizes?.[0] || "S"} • Colour: {item.product?.colours?.[0] || "Deep Maroon"}</p>
                    <p className="text-sm text-stone-600">Unit price: ₹{(item.product?.price || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[#f0dfcf] px-3 py-2">
                    <button onClick={() => handleQuantityChange(item.id, Math.max(1, (item.quantity || 1) - 1))} disabled={busyItemId === item.id} className="text-lg">−</button>
                    <span className="min-w-8 text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)} disabled={busyItemId === item.id} className="text-lg">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#7A1F3D]">₹{((item.product?.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</p>
                    <button onClick={() => handleRemove(item.id)} className="text-sm text-[#7A1F3D] underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Summary</p>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <div className="flex justify-between"><span>Total items</span><span>{summary.itemCount}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{summary.shipping === 0 ? "Free" : `₹${summary.shipping.toLocaleString("en-IN")}`}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-₹{summary.discount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Estimated tax</span><span>₹{summary.tax.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between border-t border-[#f0dfcf] pt-3 text-base font-semibold text-[#7A1F3D]"><span>Grand total</span><span>₹{summary.grandTotal.toLocaleString("en-IN")}</span></div>
            </div>
            <Link href="/checkout" className="mt-6 block w-full rounded-full bg-[#7A1F3D] px-5 py-3 text-center font-medium text-white transition hover:bg-[#5b152d]">Proceed to checkout</Link>
            <button onClick={() => router.push("/catalog")} className="mt-3 w-full rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">Continue shopping</button>
          </div>
        </div>
      </div>
    </main>
  );
}
