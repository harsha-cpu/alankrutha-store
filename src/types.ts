export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface Category {
  title: string;
  description: string;
  slug: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;

  mainImageUrl: string;

  badge?: string;
  fabric?: string;
  description: string;

  availableSizes: ProductSize[];
  availableColors: string[];

  images: ProductImage[];

  details: string[];
}