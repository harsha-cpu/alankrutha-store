import Link from "next/link";

export default function BrandFooter() {
  return (
    <footer className="border-t border-[#e9dcc7] bg-[#F8F1E7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <img src="/logo.png" alt="Alankrutha logo" className="h-12 w-auto object-contain" />
          <p className="mt-3 max-w-sm text-sm leading-7 text-stone-700">
            A premium Indian ethnic fashion house for the modern woman who values grace, craft, and timeless beauty.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Follow</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-stone-700">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-[#7A1F3D]">Instagram</a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="transition hover:text-[#7A1F3D]">WhatsApp</a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Policies</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-stone-700">
            <Link href="/contact" className="transition hover:text-[#7A1F3D]">Contact</Link>
            <Link href="/" className="transition hover:text-[#7A1F3D]">Shipping Policy</Link>
            <Link href="/" className="transition hover:text-[#7A1F3D]">Return Policy</Link>
            <Link href="/" className="transition hover:text-[#7A1F3D]">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
