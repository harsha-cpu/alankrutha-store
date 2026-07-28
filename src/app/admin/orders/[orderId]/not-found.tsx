import Link from 'next/link';

export default function AdminOrderNotFound() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#f0dfcf] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Admin order</p>
        <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">Order not found</h1>
        <p className="mt-3 text-stone-600">The order may have been removed or the link may be incorrect.</p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-flex rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]"
        >
          Back to orders
        </Link>
      </div>
    </main>
  );
}
