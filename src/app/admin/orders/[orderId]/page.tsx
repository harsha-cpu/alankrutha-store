import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/lib/admin-orders-data';
import {
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
  getItemCountLabel,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
} from '../order-ui';
import StatusUpdateForms from './StatusUpdateForms';

type AdminOrderDetailsPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function AdminOrderDetailsPage({ params }: AdminOrderDetailsPageProps) {
  const { orderId } = await params;
  const { data: order, error } = await getAdminOrderById(orderId);

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-500">Admin order</p>
          <h1 className="mt-2 font-serif text-3xl text-red-700">Unable to load order</h1>
          <p className="mt-3 text-stone-600">{error.message || 'Please refresh the page and try again.'}</p>
          <Link
            href="/admin/orders"
            className="mt-6 inline-flex rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
          >
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    notFound();
  }

  const orderStatus = String(order.status);
  const paymentStatus = String(order.paymentStatus);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Admin order</p>
                <span className={getOrderStatusBadgeClass(orderStatus)}>{formatStatusLabel(orderStatus)}</span>
              </div>
              <h1 className="mt-3 font-serif text-3xl text-[#7A1F3D]">{order.orderNumber}</h1>
              <p className="mt-2 text-stone-600">
                Placed {formatDateTime(order.createdAt)} | {getItemCountLabel(itemCount)}
              </p>
              <p className="mt-1 text-sm text-stone-500">Order ID {order.id}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/orders"
                className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
              >
                Back to orders
              </Link>
              <Link href="/admin" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
                Product dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Ordered products</h2>
              {order.items.length ? (
                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-[1.15rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                      <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-[1rem] object-cover" />
                      <div className="min-w-0 flex-1">
                        {item.slug ? (
                          <Link href={`/product/${item.slug}`} className="font-semibold text-[#2f1d24] transition hover:text-[#7A1F3D]">
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-[#2f1d24]">{item.name}</p>
                        )}
                        <p className="mt-1 text-sm text-stone-600">
                          Qty {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                        {item.sku ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">SKU {item.sku}</p> : null}
                        <p className="mt-2 font-semibold text-[#7A1F3D]">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-[1rem] bg-[#FFFDF8] px-4 py-3 text-sm text-stone-600">No order items were found.</p>
              )}
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-[#7A1F3D]">Customer</h2>
                {order.customer ? (
                  <div className="mt-4 space-y-2 text-sm text-stone-700">
                    <p className="font-semibold text-[#2f1d24]">{order.customer.fullName}</p>
                    <p className="break-words">{order.customer.email || 'No email saved'}</p>
                    {order.customer.phone ? <p>Phone: {order.customer.phone}</p> : null}
                  </div>
                ) : (
                  <p className="mt-4 rounded-[1rem] bg-[#FFFDF8] px-4 py-3 text-sm text-stone-600">No customer profile was found.</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-[#7A1F3D]">Shipping address</h2>
                {order.address ? (
                  <div className="mt-4 text-sm leading-6 text-stone-700">
                    <p className="font-semibold text-[#2f1d24]">{order.address.fullName}</p>
                    <p>{order.address.addressLine1}</p>
                    {order.address.addressLine2 ? <p>{order.address.addressLine2}</p> : null}
                    <p>
                      {order.address.city}, {order.address.state} {order.address.postalCode}
                    </p>
                    <p>{order.address.country}</p>
                    {order.address.phone ? <p>Phone: {order.address.phone}</p> : null}
                  </div>
                ) : (
                  <p className="mt-4 rounded-[1rem] bg-[#FFFDF8] px-4 py-3 text-sm text-stone-600">No shipping address was found.</p>
                )}
              </div>
            </section>

            {order.notes ? (
              <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-[#7A1F3D]">Order notes</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">{order.notes}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <StatusUpdateForms orderId={order.id} orderStatus={orderStatus} payment={order.payment} />

            <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Payment</h2>
              {order.payment ? (
                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>Status</span>
                    <span className={getPaymentStatusBadgeClass(paymentStatus)}>{formatStatusLabel(paymentStatus)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Method</span>
                    <span className="font-medium uppercase">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Amount</span>
                    <span className="font-medium">{formatCurrency(order.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Currency</span>
                    <span className="font-medium uppercase">{order.payment.currency}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Transaction</span>
                    <span className="break-all text-right font-medium">{order.payment.transactionId || 'Not recorded'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Paid at</span>
                    <span className="text-right font-medium">{order.payment.paidAt ? formatDateTime(order.payment.paidAt) : 'Not recorded'}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[1rem] bg-[#FFFDF8] px-4 py-3 text-sm text-stone-600">No payment information was found.</p>
              )}
            </section>

            <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Totals</h2>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-[#f0dfcf] pt-3 text-base font-semibold text-[#7A1F3D]">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
