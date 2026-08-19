import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-12 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-[#f2e2d0] bg-white/80 p-8 shadow-[0_20px_80px_rgba(122,31,61,0.08)] backdrop-blur lg:p-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7A1F3D]">Contact</p>
          <h1 className="font-serif text-4xl text-[#7A1F3D] sm:text-5xl">Let’s create something unforgettable.</h1>
          <p className="text-lg text-stone-600">Reach out for styling guidance, custom orders, or bridal appointments.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[#F5EBDD] p-6">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Book a consultation</h2>
            <p className="mt-3 text-stone-700">WhatsApp: +91 98765 43210</p>
            <p className="mt-1 text-stone-700">Email: hello@alankrutha.com</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f2e2d0] bg-[#FFFDF8] p-6">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Visit the boutique</h2>
            <p className="mt-3 text-stone-700">12, Garden Lane, South Extension, New Delhi</p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-[#7A1F3D] px-4 py-2 font-medium text-white transition hover:bg-[#5b152d]">Back to home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
