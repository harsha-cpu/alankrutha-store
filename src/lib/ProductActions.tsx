"use client";

import { useState } from "react";
import type { ProductSize } from "@/types";
import type { StorefrontProduct } from "@/lib/storefront-data";

import { AddToCartButton } from "@/lib/AddToCartButton";
import { BuyNowButton } from "@/lib/BuyNowButton";
import { SizeSelector } from "@/lib/SizeSelector";
import { ColorSelector } from "@/lib/ColorSelector";
import { QuantitySelector } from "@/lib/QuantitySelector";

interface ProductActionsProps {
  product: StorefrontProduct;
}

const VALID_SIZES: ProductSize[] = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

function toProductSizes(
  sizes: string[],
): ProductSize[] {
  return sizes.filter(
    (size): size is ProductSize =>
      VALID_SIZES.includes(size as ProductSize),
  );
}

export function ProductActions({
  product,
}: ProductActionsProps) {
  const sizes = toProductSizes(product.sizes);

  const [selectedSize, setSelectedSize] =
    useState<ProductSize | null>(
      sizes[0] ?? null,
    );

  const [selectedColor, setSelectedColor] =
    useState<string | null>(
      product.colours[0] ?? null,
    );

  const [quantity, setQuantity] = useState(1);

  const isOutOfStock =
    product.stockQuantity <= 0;

  const maxQuantity = Math.max(
    1,
    product.stockQuantity,
  );

  return (
    <div className="space-y-6">

      {sizes.length > 0 && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />
      )}

      {product.colours.length > 0 && (
        <ColorSelector
          colors={product.colours}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      )}

      <QuantitySelector
        quantity={quantity}
        setQuantity={setQuantity}
        maxQuantity={maxQuantity}
        disabled={isOutOfStock}
      />

      <div className="grid gap-3 sm:grid-cols-2">

        <AddToCartButton
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          quantity={quantity}
          disabled={isOutOfStock}
        />

        <BuyNowButton
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          quantity={quantity}
          disabled={isOutOfStock}
        />

      </div>

    </div>
  );
}