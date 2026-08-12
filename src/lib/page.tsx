import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/storefront-data";

import ProductGallery from "@/components/ProductGallery";
import { ProductInfo } from "@/lib/ProductInfo";
import { ProductPrice } from "@/lib/ProductPrice";
import { ProductActions } from "@/lib/ProductActions";
import { RelatedProducts } from "@/lib/RelatedProducts";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | Alankrutha Store",
    };
  }

  const primaryImage =
    product.images.find((image) => {
      return "isPrimary" in image && image.isPrimary;
    })?.url ?? product.images[0]?.url;

  return {
    title: `${product.name} | Alankrutha Store`,
    description: product.description,

    openGraph: {
      title: product.name,
      description: product.description,

      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage,
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          product={{
            name: product.name,
            images: product.images.map((image) => ({
              url: image.url,
              alt: image.alt,
            })),
          }}
        />

        <div className="flex flex-col gap-4">
          <ProductInfo
            name={product.name}
            badge={
              product.isNewArrival
                ? "New Arrival"
                : product.isBestseller
                  ? "Best Seller"
                  : undefined
            }
            fabric={product.fabric}
            description={product.description}
          />

          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={product.currency}
          />

          <ProductActions product={product} />
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
    </main>
  );
}