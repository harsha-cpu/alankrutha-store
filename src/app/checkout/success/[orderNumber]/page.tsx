import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type SuccessPageProps = {
  params: Promise<{ orderNumber: string }>;
};

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-[#f0dfcf] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Order confirmed</p>
          <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">Thank you for your order</h1>
          <p className="mt-3 text-stone-600">Order {order.orderNumber} was placed on {formatDate(order.createdAt)}.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/catalog" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
              Continue shopping
            </Link>
            <Link href="/cart" className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]">
              View cart
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Items</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-[1.15rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-[1rem] object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.slug}`} className="font-semibold text-[#2f1d24] transition hover:text-[#7A1F3D]">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-stone-600">Qty {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                    <p className="mt-2 font-semibold text-[#7A1F3D]">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Payment</h2>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="flex justify-between"><span>Method</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="font-medium capitalize">{order.paymentStatus}</span></div>
                <div className="flex justify-between"><span>Order status</span><span className="font-medium capitalize">{order.status}</span></div>
              </div>
            </section>

            {order.address ? (
              <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-[#7A1F3D]">Delivery</h2>
                <div className="mt-4 text-sm leading-6 text-stone-700">
                  <p className="font-semibold text-[#2f1d24]">{order.address.fullName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 ? <p>{order.address.addressLine2}</p> : null}
                  <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  <p>{order.address.country}</p>
                  {order.address.phone ? <p>Phone: {order.address.phone}</p> : null}
                </div>
              </section>
            ) : null}

            <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Totals</h2>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
                <div className="flex justify-between border-t border-[#f0dfcf] pt-3 text-base font-semibold text-[#7A1F3D]"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}