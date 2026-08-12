"use client";

import { ShoppingBag } from "lucide-react";
import type { ProductSize } from "@/types";
import type { StorefrontProduct } from "@/lib/storefront-data";

interface AddToCartButtonProps {
  product: StorefrontProduct;
  selectedSize: ProductSize | null;
  selectedColor: string | null;
  quantity: number;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  quantity,
  disabled = false,
}: AddToCartButtonProps) {
  const handleAddToCart = () => {
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

    console.log("Added to cart:", {
      productId: product.id,
      productName: product.name,
      selectedSize,
      selectedColor,
      quantity,
    });

    // TODO:
    // Connect this button to the existing CartContext/cart implementation.
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingBag size={20} />

      {disabled ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}