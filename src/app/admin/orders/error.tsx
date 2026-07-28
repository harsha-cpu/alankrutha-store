'use client';

import Link from 'next/link';

export default function AdminOrdersError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-500">Admin orders</p>
        <h1 className="mt-2 font-serif text-3xl text-red-700">Something went wrong</h1>
        <p className="mt-3 text-stone-600">{error.message || 'The order management page could not be loaded.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={unstable_retry} className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white">
            Try again
          </button>
          <Link href="/admin" className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D]">
            Product dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
