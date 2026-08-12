import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface CategoriesProps {
  categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-16">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-[#7A1F3D]">
          Shop by Category
        </h2>

        <p className="mt-3 text-gray-600">
          Discover elegant collections for every occasion.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/catalog?category=${category.slug}`}
            className="group overflow-hidden rounded-2xl shadow-lg"
          >
            <div className="relative h-96">

              <Image
                src="/WhatsApp Image 2026-07-16 at 22.46.26.png"
                alt={category.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/45" />

              <div className="absolute bottom-0 w-full p-6 text-white">
                <h3 className="text-2xl font-bold">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm">
                  {category.description}
                </p>

                <span className="mt-4 inline-block font-semibold">
                  Explore Collection →
                </span>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}