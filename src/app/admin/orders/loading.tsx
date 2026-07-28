export default function AdminOrdersLoading() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Admin</p>
          <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">Loading orders</h1>
          <p className="mt-2 text-stone-600">Fetching the latest order information.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[1.5rem] border border-[#f0dfcf] bg-white shadow-sm" />
          ))}
        </section>
        <section className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-[1.5rem] border border-[#f0dfcf] bg-white shadow-sm" />
          ))}
        </section>
      </div>
    </main>
  );
}
