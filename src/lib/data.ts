// src/lib/data.ts

import type { Category, Product } from "@/types";

// Fetch Categories
export async function getCategories(): Promise<Category[]> {
  return [
    {
      title: "Bridal Wear",
      description: "Exquisite designs for your special day.",
      slug: "bridal-wear",
    },
    {
      title: "Party Wear",
      description: "Glamorous outfits for every celebration.",
      slug: "party-wear",
    },
    {
      title: "Casual Chic",
      description: "Everyday elegance with a touch of tradition.",
      slug: "casual-chic",
    },
  ];
}

// Fetch Featured Products
export async function getFeaturedProducts(): Promise<Product[]> {
  return [
    {
      id: "prod-001",
      name: "Emerald Green Lehenga",
      slug: "emerald-green-lehenga",
      price: 12500,
      mainImageUrl: "/WhatsApp Image 2026-07-16 at 22.46.26.png",
      badge: "New Arrival",
      fabric: "Silk Blend",
      description:
        "A stunning emerald green lehenga with intricate embroidery.",

      availableSizes: ["S", "M", "L"],
      availableColors: ["Green"],

      images: [
        {
          url: "/WhatsApp Image 2026-07-16 at 22.46.26.png",
          alt: "Emerald Green Lehenga",
        },
      ],

      details: [],
    },

    {
      id: "prod-002",
      name: "Royal Blue Anarkali",
      slug: "royal-blue-anarkali",
      price: 9800,
      mainImageUrl: "/WhatsApp Image 2026-07-16 at 22.46.26.png",
      badge: "Best Seller",
      fabric: "Georgette",
      description:
        "Elegant royal blue anarkali with delicate sequin work.",

      availableSizes: ["M", "L", "XL"],
      availableColors: ["Blue"],

      images: [
        {
          url: "/WhatsApp Image 2026-07-16 at 22.46.26.png",
          alt: "Royal Blue Anarkali",
        },
      ],

      details: [],
    },
  ];
}