import { insforge } from './insforge';

export const orderStatusOptions = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export const paymentStatusOptions = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'] as const;

export type OrderStatus = (typeof orderStatusOptions)[number];
export type PaymentStatus = (typeof paymentStatusOptions)[number];
export type AdminOrderSort = 'newest' | 'oldest';

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus | string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus | string;
};

export type AdminOrderDetails = AdminOrderListItem & {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  notes: string | null;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  address: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    sku: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  payment: {
    id: string;
    method: string;
    status: PaymentStatus | string;
    transactionId: string | null;
    amount: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

type DbRow = Record<string, unknown>;

function asDbRow(value: unknown): DbRow {
  return value && typeof value === 'object' ? (value as DbRow) : {};
}

function asDbRows(value: unknown): DbRow[] {
  return Array.isArray(value) ? value.map(asDbRow) : [];
}

function firstRelationRow(value: unknown): DbRow {
  return asDbRow(Array.isArray(value) ? value[0] : value);
}

function hasRelationData(row: DbRow) {
  return Object.values(row).some((value) => value !== null && value !== undefined && value !== '');
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatusOptions as readonly string[]).includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (paymentStatusOptions as readonly string[]).includes(value);
}

export async function getAdminOrders(input: { query?: string; status?: string; sort?: AdminOrderSort } = {}) {
  const status = input.status && isOrderStatus(input.status) ? input.status : null;
  const sort = input.sort === 'oldest' ? 'oldest' : 'newest';

  let request = insforge.database
    .from('orders')
    .select(
      'id,order_number,status,total_amount,created_at,updated_at,users(full_name,email),order_items(id,quantity),payments(payment_method,payment_status)'
    )
    .order('created_at', { ascending: sort === 'oldest' });

  if (status) {
    request = request.eq('status', status);
  }

  const { data, error } = await request;
  if (error) {
    return { data: [] as AdminOrderListItem[], error };
  }

  const normalizedQuery = input.query?.trim().toLowerCase() || '';
  const orders = asDbRows(data)
    .map(mapAdminOrderListRow)
    .filter((order) => {
      if (!normalizedQuery) return true;

      return [order.orderNumber, order.customerName, order.customerEmail].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    });

  return { data: orders, error: null };
}

export async function getAdminOrderById(orderId: string) {
  const cleanOrderId = orderId.trim();
  if (!cleanOrderId) {
    return { data: null as AdminOrderDetails | null, error: null };
  }

  const { data, error } = await insforge.database
    .from('orders')
    .select(
      'id,order_number,status,subtotal,shipping_amount,tax_amount,discount_amount,total_amount,notes,created_at,updated_at,users(id,full_name,email,phone),addresses(id,label,full_name,phone,address_line1,address_line2,city,state,postal_code,country),order_items(id,product_id,quantity,unit_price,total_price,products(name,slug,sku,product_images(image_url,alt_text,is_primary,sort_order))),payments(id,payment_method,payment_status,transaction_id,amount,currency,paid_at,created_at,updated_at)'
    )
    .eq('id', cleanOrderId)
    .maybeSingle();

  if (error) {
    return { data: null as AdminOrderDetails | null, error };
  }

  if (!data) {
    return { data: null as AdminOrderDetails | null, error: null };
  }

  return { data: mapAdminOrderDetailsRow(asDbRow(data)), error: null };
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const { data, error } = await insforge.database
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('id,status');

  const rows = asDbRows(data);
  if (!error && rows.length === 0) {
    return { data: null, error: { message: 'Order was not found.' } };
  }

  return { data, error };
}

export async function updateAdminPaymentStatus(paymentId: string, orderId: string, status: PaymentStatus) {
  const { data, error } = await insforge.database
    .from('payments')
    .update({ payment_status: status })
    .eq('id', paymentId)
    .eq('order_id', orderId)
    .select('id,payment_status');

  const rows = asDbRows(data);
  if (!error && rows.length === 0) {
    return { data: null, error: { message: 'Payment record was not found.' } };
  }

  return { data, error };
}

function mapAdminOrderListRow(row: DbRow): AdminOrderListItem {
  const customer = firstRelationRow(row.users);
  const payment = asDbRows(row.payments)[0];
  const itemCount = asDbRows(row.order_items).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    id: String(row.id),
    orderNumber: String(row.order_number || ''),
    status: String(row.status || 'pending'),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    customerName: String(customer.full_name || 'Customer'),
    customerEmail: String(customer.email || ''),
    itemCount,
    total: Number(row.total_amount || 0),
    paymentMethod: String(payment?.payment_method || 'cod'),
    paymentStatus: String(payment?.payment_status || 'pending'),
  };
}

function mapAdminOrderDetailsRow(row: DbRow): AdminOrderDetails {
  const listItem = mapAdminOrderListRow(row);
  const customerRow = firstRelationRow(row.users);
  const addressRow = firstRelationRow(row.addresses);
  const paymentRow = asDbRows(row.payments)[0];

  return {
    ...listItem,
    subtotal: Number(row.subtotal || 0),
    shipping: Number(row.shipping_amount || 0),
    discount: Number(row.discount_amount || 0),
    tax: Number(row.tax_amount || 0),
    notes: row.notes ? String(row.notes) : null,
    customer: hasRelationData(customerRow)
      ? {
          id: String(customerRow.id || ''),
          fullName: String(customerRow.full_name || 'Customer'),
          email: String(customerRow.email || ''),
          phone: customerRow.phone ? String(customerRow.phone) : null,
        }
      : null,
    address: hasRelationData(addressRow)
      ? {
          id: String(addressRow.id || ''),
          label: String(addressRow.label || 'Shipping'),
          fullName: String(addressRow.full_name || ''),
          phone: String(addressRow.phone || ''),
          addressLine1: String(addressRow.address_line1 || ''),
          addressLine2: String(addressRow.address_line2 || ''),
          city: String(addressRow.city || ''),
          state: String(addressRow.state || ''),
          postalCode: String(addressRow.postal_code || ''),
          country: String(addressRow.country || 'India'),
        }
      : null,
    items: asDbRows(row.order_items).map(mapAdminOrderItemRow),
    payment: paymentRow ? mapAdminPaymentRow(paymentRow) : null,
  };
}

function mapAdminOrderItemRow(row: DbRow): AdminOrderDetails['items'][number] {
  const product = firstRelationRow(row.products);
  const sortedImages = asDbRows(product.product_images)
    .filter(Boolean)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  return {
    id: String(row.id),
    productId: String(row.product_id),
    name: String(product.name || 'Product'),
    slug: String(product.slug || ''),
    sku: String(product.sku || ''),
    imageUrl: String(sortedImages[0]?.image_url || '/placeholder-images/banarasi-silk-saree.svg'),
    quantity: Number(row.quantity || 1),
    unitPrice: Number(row.unit_price || 0),
    totalPrice: Number(row.total_price || 0),
  };
}

function mapAdminPaymentRow(row: DbRow): AdminOrderDetails['payment'] {
  return {
    id: String(row.id),
    method: String(row.payment_method || 'cod'),
    status: String(row.payment_status || 'pending'),
    transactionId: row.transaction_id ? String(row.transaction_id) : null,
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'INR'),
    paidAt: row.paid_at ? String(row.paid_at) : null,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}
