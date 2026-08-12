"use client";

import { ShoppingBag } from "lucide-react";
import type { ProductSize } from "@/types";
import type { StorefrontProduct } from "@/lib/storefront-data";

interface BuyNowButtonProps {
  product: StorefrontProduct;
  selectedSize: ProductSize | null;
  selectedColor: string | null;
  quantity: number;
  disabled?: boolean;
}

export function BuyNowButton({
  product,
  selectedSize,
  selectedColor,
  quantity,
  disabled = false,
}: BuyNowButtonProps) {
  const handleBuyNow = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert("Please select a size.");
      return;
    }

    if (!selectedColor && product.colours.length > 0) {
      alert("Please select a color.");
      return;
    }

    if (product.stockQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    console.log("Buy Now:", {
      productId: product.id,
      productName: product.name,
      selectedSize,
      selectedColor,
      quantity,
    });

    // TODO:
    // Connect this to the existing checkout flow.
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-[#7A1F3D] bg-[#7A1F3D] py-3 font-semibold text-white transition-colors hover:bg-[#5d1830] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingBag size={20} />

      {disabled ? "Out of Stock" : "Buy Now"}
    </button>
  );
}