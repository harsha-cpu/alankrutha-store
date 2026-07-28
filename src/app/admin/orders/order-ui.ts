export function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatusLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getItemCountLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export function getOrderStatusBadgeClass(status: string) {
  const base = 'rounded-full px-3 py-1 text-sm font-medium capitalize';

  if (status === 'delivered') return `${base} bg-emerald-100 text-emerald-700`;
  if (status === 'cancelled' || status === 'returned') return `${base} bg-red-100 text-red-700`;
  if (status === 'shipped') return `${base} bg-blue-100 text-blue-700`;
  if (status === 'processing' || status === 'packed') return `${base} bg-amber-100 text-amber-700`;

  return `${base} bg-[#F5EBDD] text-[#7A1F3D]`;
}

export function getPaymentStatusBadgeClass(status: string) {
  const base = 'rounded-full px-3 py-1 text-sm font-medium capitalize';

  if (status === 'captured' || status === 'authorized') return `${base} bg-emerald-100 text-emerald-700`;
  if (status === 'failed') return `${base} bg-red-100 text-red-700`;
  if (status === 'refunded' || status === 'partially_refunded') return `${base} bg-blue-100 text-blue-700`;

  return `${base} bg-[#F5EBDD] text-[#7A1F3D]`;
}
