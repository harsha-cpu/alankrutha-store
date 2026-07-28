"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/storefront-data";

type Props = {
  productId: string;
  disabled?: boolean;
  label?: string;
  redirectAfterAdd?: string;
};

export default function CartActions({ productId, disabled = false, label = "Add to Cart", redirectAfterAdd }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleAddToCart() {
    if (disabled) return;
    setIsAdding(true);
    setStatus(null);
    const result = await addToCart(productId);
    setIsAdding(false);
    if (result.success) {
      setStatus("Added to cart.");
      if (redirectAfterAdd) {
        router.push(redirectAfterAdd);
        return;
      }
      router.refresh();
    } else {
      setStatus(result.error || "Unable to add item to cart.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAdding ? "Adding..." : label}
      </button>
      {status ? <p className="text-sm text-stone-600">{status}</p> : null}
    </div>
  );
}