import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Hero from '@/components/home/Hero';
import { getCategories, getFeaturedProducts } from '@/lib/data';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function HomePage() {
  const categories = await getCategories();
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="space-y-16">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <FeaturedProducts products={featuredProducts} />
      </section>

      {/* Shop by Category */}
      <section className="container mx-auto px-4">
        <Categories categories={categories} />
      </section>
    </main>
  );
}
