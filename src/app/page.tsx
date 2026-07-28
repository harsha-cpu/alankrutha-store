import Link from "next/link";

const categories = [
  { title: "Sarees", description: "Regal drapes in silk, chiffon, and organza." },
  { title: "Cotton Suit Sets", description: "Comfort-first elegance for everyday dressing." },
  { title: "Tissue Silk Suit Sets", description: "Festival finesse with rich texture and polish." },
  { title: "Festive Collection", description: "Statement pieces designed for grand occasions." },
];

const featuredProducts = [
  { name: "Banarasi Silk Saree", fabric: "Pure Banarasi Silk", price: "₹3,499", badge: "Signature" },
  { name: "Premium Cotton Suit Set", fabric: "Cotton Jamdani", price: "₹1,999", badge: "Bestseller" },
  { name: "Designer Tissue Silk Suit Set", fabric: "Tissue Silk", price: "₹2,499", badge: "New Arrival" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#FFFDF8_0%,_#F5EBDD_45%,_#FFFDF8_100%)]">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#f0dfcf] bg-white/80 px-4 py-3 shadow-[0_10px_40px_rgba(122,31,61,0.08)] backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7A1F3D]">Alankrutha</p>
            <h1 className="text-lg font-semibold text-[#2f1d24]">Ethnic elegance, redefined</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5e4450]">
            <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[#F5EBDD]">Home</Link>
            <Link href="/collections" className="rounded-full px-3 py-2 transition hover:bg-[#F5EBDD]">Collections</Link>
            <Link href="/about" className="rounded-full px-3 py-2 transition hover:bg-[#F5EBDD]">About Us</Link>
            <Link href="/contact" className="rounded-full px-3 py-2 transition hover:bg-[#F5EBDD]">Contact</Link>
            <Link href="/cart" className="rounded-full px-3 py-2 transition hover:bg-[#F5EBDD]">Cart</Link>
            <Link href="/login" className="rounded-full bg-[#7A1F3D] px-4 py-2 font-medium text-white transition hover:bg-[#5b152d]">Login</Link>
          </nav>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-[#f0dfcf] bg-[#FFFDF8] shadow-[0_20px_80px_rgba(122,31,61,0.08)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top_left,_#F8D7DA_0%,_#FFFDF8_55%,_#F5EBDD_100%)] p-8 sm:p-10 lg:p-14">
              <div className="inline-flex w-fit rounded-full border border-[#e6cdb6] bg-white/70 px-3 py-1 text-sm font-medium text-[#7A1F3D]">
                Luxury Indian fashion • 2026 edit
              </div>
              <h2 className="mt-6 font-serif text-4xl leading-tight text-[#7A1F3D] sm:text-5xl">
                Graceful silhouettes for every celebration.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-stone-700">
                Discover hand-finished ensembles crafted for the modern Indian woman — elegant, expressive, and effortlessly premium.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalog" className="rounded-full bg-[#7A1F3D] px-6 py-3 font-medium text-white transition hover:bg-[#5b152d]">
                  Shop Now
                </Link>
                <Link href="/collections" className="rounded-full border border-[#c7a56d] px-6 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">
                  Explore Collections
                </Link>
              </div>
            </div>
            <div className="relative min-h-[420px] bg-[url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white/80 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Categories</p>
            <div className="mt-4 space-y-4">
              {categories.map((item) => (
                <div key={item.title} className="rounded-[1.25rem] bg-[#FFFDF8] p-4">
                  <h3 className="font-serif text-xl text-[#7A1F3D]">{item.title}</h3>
                  <p className="mt-1 text-sm text-stone-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Featured products</p>
                <h3 className="font-serif text-3xl text-[#7A1F3D]">Signature pieces for the season</h3>
              </div>
              <Link href="/catalog" className="text-sm font-medium text-[#7A1F3D] underline underline-offset-4">View all</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <div key={product.name} className="rounded-[1.5rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4 shadow-sm">
                  <div className="mb-4 h-28 rounded-[1rem] bg-[linear-gradient(135deg,_#F5EBDD_0%,_#F8D7DA_100%)]" />
                  <p className="text-sm font-semibold text-[#C8A24A]">{product.badge}</p>
                  <p className="mt-2 font-semibold text-[#2f1d24]">{product.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{product.fabric}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-semibold text-[#7A1F3D]">{product.price}</span>
                    <div className="flex items-center gap-2">
                      <button className="rounded-full border border-[#d8bb87] px-2 py-2 text-sm text-[#7A1F3D]">♡</button>
                      <button className="rounded-full bg-[#7A1F3D] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#5b152d]">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
