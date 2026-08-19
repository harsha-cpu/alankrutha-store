import Link from "next/link";
import { getCustomerOrderHistory } from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getItemCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export default async function OrdersPage() {
  const { user, orders } = await getCustomerOrderHistory();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Order history</p>
          <h1 className="font-serif text-3xl text-[#7A1F3D]">Sign in to view orders</h1>
          <p className="text-stone-600">Your Alankrutha orders are linked to your customer account.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login?next=/orders" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
              Sign in
            </Link>
            <Link href="/catalog" className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Customer orders</p>
          <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">Order history</h1>
          <p className="mt-3 text-stone-600">Signed in as {user.full_name}.</p>
        </section>

        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const previewItems = order.items.slice(0, 3);

              return (
                <article key={order.id} className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-serif text-2xl text-[#7A1F3D]">{order.orderNumber}</h2>
                        <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-sm font-medium capitalize text-[#7A1F3D]">{order.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">{formatDate(order.createdAt)} | {getItemCountLabel(itemCount)}</p>
                      <div className="mt-5 space-y-3">
                        {previewItems.map((item) => (
                          <div key={item.id} className="flex gap-4 rounded-[1.15rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-[1rem] object-cover" />
                            <div className="min-w-0 flex-1">
                              <Link href={`/product/${item.slug}`} className="font-semibold text-[#2f1d24] transition hover:text-[#7A1F3D]">
                                {item.name}
                              </Link>
                              <p className="mt-1 text-sm text-stone-600">Qty {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > previewItems.length ? (
                          <p className="text-sm font-medium text-[#7A1F3D]">+{order.items.length - previewItems.length} more</p>
                        ) : null}
                      </div>
                    </div>

                    <aside className="w-full rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-5 lg:w-72">
                      <div className="space-y-3 text-sm text-stone-700">
                        <div className="flex justify-between"><span>Payment</span><span className="font-medium capitalize">{order.paymentStatus}</span></div>
                        <div className="flex justify-between"><span>Method</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
                        <div className="flex justify-between border-t border-[#f0dfcf] pt-3 text-base font-semibold text-[#7A1F3D]"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                      </div>
                      <Link href={`/checkout/success/${encodeURIComponent(order.orderNumber)}`} className="mt-5 block w-full rounded-full border border-[#d8bb87] px-5 py-3 text-center font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">
                        View details
                      </Link>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-8 text-center shadow-sm">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">No orders yet</h2>
            <p className="mt-3 text-stone-600">Your first Alankrutha order will appear here.</p>
            <Link href="/catalog" className="mt-5 inline-flex rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
              Browse catalog
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}