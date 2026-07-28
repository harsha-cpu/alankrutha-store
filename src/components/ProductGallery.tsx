"use client";

import { useState } from "react";

type ProductImage = {
  url: string;
  alt: string;
};

type Product = {
  name: string;
  images: ProductImage[];
};

export default function ProductGallery({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images.length ? product.images : [{ url: "/placeholder-images/banarasi-silk-saree.svg", alt: product.name }];

  return (
    <div className="space-y-3">
      <div className="group overflow-hidden rounded-[1.5rem] border border-[#f0dfcf] bg-[#FFFDF8] p-2">
        <img
          src={images[activeImage]?.url}
          alt={images[activeImage]?.alt || `${product.name} view ${activeImage + 1}`}
          className="h-[420px] w-full rounded-[1.25rem] object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            onClick={() => setActiveImage(index)}
            className={`overflow-hidden rounded-[0.9rem] border ${activeImage === index ? "border-[#7A1F3D]" : "border-[#f0dfcf]"}`}
          >
            <img src={image.url} alt={image.alt || `${product.name} thumbnail ${index + 1}`} className="h-16 w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
