import Link from 'next/link';
import { getAdminOrders, orderStatusOptions, type AdminOrderSort } from '@/lib/admin-orders-data';
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
  getItemCountLabel,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
} from './order-ui';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type AdminOrdersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const query = readParam(params.q);
  const rawStatus = readParam(params.status);
  const activeStatus = (orderStatusOptions as readonly string[]).includes(rawStatus) ? rawStatus : 'all';
  const sort: AdminOrderSort = readParam(params.sort) === 'oldest' ? 'oldest' : 'newest';
  const hasActiveFilters = Boolean(query || activeStatus !== 'all' || sort !== 'newest');
  const { data: orders, error } = await getAdminOrders({ query, status: activeStatus, sort });
  const visibleRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingCount = orders.filter((order) => order.status === 'pending').length;

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">Admin</p>
              <h1 className="mt-2 font-serif text-3xl text-[#7A1F3D]">Order Management</h1>
              <p className="mt-2 text-stone-600">Search, review, and update customer orders.</p>
            </div>
            <Link
              href="/admin"
              className="w-fit rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
            >
              Product dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7A1F3D]">Visible Orders</p>
            <p className="mt-3 text-2xl font-semibold text-[#2f1d24]">{orders.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7A1F3D]">Pending Orders</p>
            <p className="mt-3 text-2xl font-semibold text-[#2f1d24]">{pendingCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7A1F3D]">Visible Revenue</p>
            <p className="mt-3 text-2xl font-semibold text-[#2f1d24]">{formatCurrency(visibleRevenue)}</p>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
          <form action="/admin/orders" method="get" className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search order number, customer name, or email"
              className="w-full rounded-full border border-stone-300 px-4 py-3 outline-none transition focus:border-[#7A1F3D]"
            />
            <select
              name="status"
              defaultValue={activeStatus}
              className="w-full rounded-full border border-stone-300 px-4 py-3 outline-none transition focus:border-[#7A1F3D]"
            >
              <option value="all">All statuses</option>
              {orderStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-full border border-stone-300 px-4 py-3 outline-none transition focus:border-[#7A1F3D]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button type="submit" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d]">
              Apply
            </button>
            {hasActiveFilters ? (
              <Link
                href="/admin/orders"
                className="rounded-full border border-[#d8bb87] px-5 py-3 text-center font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
              >
                Reset
              </Link>
            ) : null}
          </form>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-red-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-red-700">Unable to load orders</h2>
            <p className="mt-3 text-stone-600">{error.message || 'Please refresh the page and try again.'}</p>
          </section>
        ) : orders.length ? (
          <section className="space-y-4">
            {orders.map((order) => {
              const orderStatus = String(order.status);
              const paymentStatus = String(order.paymentStatus);

              return (
                <article key={order.id} className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-serif text-2xl text-[#7A1F3D] transition hover:text-[#5b152d]">
                          {order.orderNumber}
                        </Link>
                        <span className={getOrderStatusBadgeClass(orderStatus)}>{formatStatusLabel(orderStatus)}</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {formatDate(order.createdAt)} | {getItemCountLabel(order.itemCount)}
                      </p>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[1rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A24A]">Customer</p>
                          <p className="mt-2 font-semibold text-[#2f1d24]">{order.customerName}</p>
                          <p className="mt-1 break-words text-sm text-stone-600">{order.customerEmail || 'No email saved'}</p>
                        </div>
                        <div className="rounded-[1rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A24A]">Payment</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={getPaymentStatusBadgeClass(paymentStatus)}>{formatStatusLabel(paymentStatus)}</span>
                            <span className="text-sm font-medium uppercase text-stone-600">{order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="rounded-[1rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A24A]">Total</p>
                          <p className="mt-2 text-xl font-semibold text-[#7A1F3D]">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="w-full rounded-full bg-[#7A1F3D] px-5 py-3 text-center font-medium text-white transition hover:bg-[#5b152d] lg:w-auto"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-8 text-center shadow-sm">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">{hasActiveFilters ? 'No matching orders' : 'No orders yet'}</h2>
            <p className="mt-3 text-stone-600">
              {hasActiveFilters ? 'Try changing the search, status filter, or sort order.' : 'New customer orders will appear here.'}
            </p>
            {hasActiveFilters ? (
              <Link
                href="/admin/orders"
                className="mt-5 inline-flex rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
              >
                Clear filters
              </Link>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
