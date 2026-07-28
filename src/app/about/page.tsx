import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-12 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[2rem] border border-[#f2e2d0] bg-white/80 p-8 shadow-[0_20px_80px_rgba(122,31,61,0.08)] backdrop-blur lg:p-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7A1F3D]">About Alankrutha</p>
          <h1 className="font-serif text-4xl text-[#7A1F3D] sm:text-5xl">Crafted for the woman who carries grace with confidence.</h1>
          <p className="text-lg leading-8 text-stone-600">
            Alankrutha celebrates the elegance of modern Indian femininity through heirloom-inspired silhouettes, luxurious fabrics, and timeless detailing.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[#F5EBDD] p-6">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Our philosophy</h2>
            <p className="mt-3 text-stone-700">Each piece is thoughtfully designed to blend tradition, comfort, and contemporary polish.</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f2e2d0] bg-[#FFFDF8] p-6">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">The experience</h2>
            <p className="mt-3 text-stone-700">From first discovery to final fitting, every moment is curated with care and refinement.</p>
          </div>
        </div>
        <Link href="/collections" className="inline-flex w-fit rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">Explore the collection</Link>
      </section>
    </main>
  );
}
