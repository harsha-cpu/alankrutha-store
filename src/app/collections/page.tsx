const collections = [
  { name: "Sarees", description: "Silk and chiffon drapes with luminous detailing.", accent: "Satin drape" },
  { name: "Cotton Suit Sets", description: "Lightweight comfort for everyday elegance.", accent: "Soft tailoring" },
  { name: "Silk Suit Sets", description: "Opulent festive dressing with rich textures.", accent: "Festive glow" },
  { name: "Festive Collection", description: "Celebration-ready pieces in luxe tones.", accent: "Statement finish" },
];

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-12 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[2rem] border border-[#f2e2d0] bg-white/80 p-8 shadow-[0_20px_80px_rgba(122,31,61,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7A1F3D]">Collections</p>
          <h1 className="mt-3 font-serif text-4xl text-[#7A1F3D] sm:text-5xl">Curated edit for every celebration and everyday moment.</h1>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {collections.map((item) => (
            <div key={item.name} className="rounded-[1.5rem] border border-[#f2e2d0] bg-[#FFFDF8] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8A24A]">{item.accent}</p>
              <h2 className="mt-3 font-serif text-2xl text-[#7A1F3D]">{item.name}</h2>
              <p className="mt-3 text-stone-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
