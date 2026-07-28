import { getCurrentAppUser } from './auth';
import { insforge } from './insforge';
import {
  captureRazorpayPayment,
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayPublicKeyId,
  toRazorpayAmount,
  verifyRazorpaySignature,
  type RazorpayPaymentResponse,
} from './razorpay';

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  category: string;
  categoryId: string;
  fabric: string;
  sizes: string[];
  colours: string[];
  stockQuantity: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  discountPercentage: number;
  images: Array<{ url: string; alt: string }>;
  washCareInstructions: string[];
  shippingInfo: string;
  returnPolicy: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product?: StorefrontProduct;
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  grandTotal: number;
};
export type SavedAddress = {
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
  isDefault: boolean;
};

export type ShippingAddressInput = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type CheckoutData = {
  user: Awaited<ReturnType<typeof getCurrentAppUser>>;
  addresses: SavedAddress[];
  items: CartItem[];
  summary: CartSummary;
};

export type PlaceOrderInput = {
  addressId?: string | null;
  address?: ShippingAddressInput | null;
  notes?: string;
};

export type PlaceOrderResult = {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  total?: number;
  error?: string | null;
};

export type RazorpayCheckoutOrder = {
  keyId: string;
  razorpayOrderId: string;
  orderNumber: string;
  amountPaise: number;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export type RazorpayPaymentVerificationInput = {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type OrderDetails = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  address: SavedAddress | null;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export type CustomerOrderHistoryData = {
  user: Awaited<ReturnType<typeof getCurrentAppUser>>;
  orders: OrderDetails[];
};
type DbRow = Record<string, unknown>;

type DbErrorLike = {
  code?: string;
  message?: string;
};

function asDbRow(value: unknown): DbRow {
  return value && typeof value === 'object' ? (value as DbRow) : {};
}

function asDbRows(value: unknown): DbRow[] {
  return Array.isArray(value) ? value.map(asDbRow) : [];
}

function firstRelationRow(value: unknown): DbRow {
  return asDbRow(Array.isArray(value) ? value[0] : value);
}

function parseJsonObject(value: string): DbRow {
  try {
    return asDbRow(JSON.parse(value));
  } catch {
    return {};
  }
}
const fallbackImagesBySlug: Record<string, string[]> = {
  'banarasi-silk-saree': [
    '/placeholder-images/banarasi-silk-saree.svg',
    '/placeholder-images/premium-cotton-suit-set.svg',
    '/placeholder-images/designer-tissue-silk-suit-set.svg',
    '/placeholder-images/organza-festive-saree.svg',
  ],
  'premium-cotton-suit-set': [
    '/placeholder-images/premium-cotton-suit-set.svg',
    '/placeholder-images/banarasi-silk-saree.svg',
    '/placeholder-images/designer-tissue-silk-suit-set.svg',
    '/placeholder-images/organza-festive-saree.svg',
  ],
  'designer-tissue-silk-suit-set': [
    '/placeholder-images/designer-tissue-silk-suit-set.svg',
    '/placeholder-images/organza-festive-saree.svg',
    '/placeholder-images/premium-cotton-suit-set.svg',
    '/placeholder-images/banarasi-silk-saree.svg',
  ],
  'organza-festive-saree': [
    '/placeholder-images/organza-festive-saree.svg',
    '/placeholder-images/banarasi-silk-saree.svg',
    '/placeholder-images/designer-tissue-silk-suit-set.svg',
    '/placeholder-images/premium-cotton-suit-set.svg',
  ],
};

function buildAvailability(stockQuantity: number): StorefrontProduct['availability'] {
  if (stockQuantity <= 0) return 'Out of Stock';
  if (stockQuantity < 5) return 'Low Stock';
  return 'In Stock';
}

function buildDiscountPercentage(price: number, compareAtPrice: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function buildProductFromRow(row: DbRow): StorefrontProduct {
  const slug = String(row.slug || '');
  const fallbackImages = fallbackImagesBySlug[slug] || fallbackImagesBySlug['banarasi-silk-saree'];
  const category = firstRelationRow(row.categories);
  const rawImages = asDbRows(row.product_images);
  const images = rawImages.length
    ? rawImages
        .filter(Boolean)
        .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
        .map((image) => ({
          url: String(image.image_url || fallbackImages[0]),
          alt: String(image.alt_text || row.name || 'Product image'),
        }))
    : fallbackImages.map((url, index) => ({ url, alt: `${row.name || 'Product'} image ${index + 1}` }));

  const rowSizes = Array.isArray(row.sizes) ? row.sizes.map(String) : [];
  const sizes = rowSizes.length ? rowSizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const colours = getColoursForProduct(slug);
  const price = Number(row.price || 0);
  const compareAtPrice = row.compare_at_price != null ? Number(row.compare_at_price) : null;

  return {
    id: String(row.id),
    name: String(row.name || 'Product'),
    slug,
    description: String(row.description || 'Crafted for elegance, comfort, and enduring style.'),
    sku: String(row.sku || 'SKU-001'),
    price,
    compareAtPrice: compareAtPrice,
    currency: String(row.currency || 'INR'),
    category: String(category.name || 'Signature Collection'),
    categoryId: String(row.category_id || ''),
    fabric: String(row.fabric || 'Premium fabric'),
    sizes,
    colours,
    stockQuantity: Number(row.stock_quantity || 0),
    isFeatured: Boolean(row.is_featured),
    isNewArrival: Boolean(row.is_new_arrival),
    isBestseller: Boolean(row.is_bestseller),
    availability: buildAvailability(Number(row.stock_quantity || 0)),
    discountPercentage: buildDiscountPercentage(price, compareAtPrice),
    images,
    washCareInstructions: getWashCareInstructions(slug),
    shippingInfo: 'Express delivery across India in 3-5 business days. Complimentary shipping on orders above Rs. 5,000.',
    returnPolicy: 'Easy returns within 7 days of delivery for unused items in original condition.',
  };
}

function getColoursForProduct(slug: string) {
  const palette: Record<string, string[]> = {
    'banarasi-silk-saree': ['Deep Maroon', 'Antique Gold', 'Emerald'],
    'premium-cotton-suit-set': ['Ivory', 'Blush Pink', 'Sage'],
    'designer-tissue-silk-suit-set': ['Antique Gold', 'Deep Maroon', 'Royal Blue'],
    'organza-festive-saree': ['Soft Ivory', 'Rose', 'Champagne'],
  };

  return palette[slug] || ['Deep Maroon', 'Ivory', 'Rose'];
}

function getWashCareInstructions(slug: string) {
  const map: Record<string, string[]> = {
    'banarasi-silk-saree': ['Dry clean only', 'Store folded in a muslin cloth', 'Avoid direct sunlight'],
    'premium-cotton-suit-set': ['Gentle hand wash', 'Steam iron on reverse side', 'Do not bleach'],
    'designer-tissue-silk-suit-set': ['Dry clean only', 'Use a padded hanger', 'Store away from moisture'],
    'organza-festive-saree': ['Dry clean only', 'Handle with care', 'Avoid sharp folds'],
  };

  return map[slug] || ['Dry clean only', 'Store in a cool, dry place', 'Avoid direct sunlight'];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await insforge.database
    .from('products')
    .select(
      'id,name,slug,description,sku,price,compare_at_price,currency,stock_quantity,category_id,is_featured,categories(name),product_images(image_url,alt_text,is_primary,sort_order)'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return buildProductFromRow(asDbRow(data));
}

export async function getActiveProducts() {
  const { data, error } = await insforge.database
    .from('products')
    .select(
      'id,name,slug,description,sku,price,compare_at_price,currency,stock_quantity,category_id,is_featured,categories(name),product_images(image_url,alt_text,is_primary,sort_order)'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [] as StorefrontProduct[];
  }

  return asDbRows(data).map((row) => buildProductFromRow(row));
}

export async function getRelatedProducts(product: StorefrontProduct, limit = 4) {
  const { data, error } = await insforge.database
    .from('products')
    .select(
      'id,name,slug,description,price,compare_at_price,currency,stock_quantity,category_id,is_featured,categories(name),product_images(image_url,alt_text,is_primary,sort_order)'
    )
    .eq('category_id', product.categoryId)
    .neq('id', product.id)
    .limit(limit);

  if (error || !data) {
    return [] as StorefrontProduct[];
  }

  return asDbRows(data).map((row) => buildProductFromRow({ ...row, categories: row.categories || { name: product.category } }));
}

export async function getSimilarProducts(product: StorefrontProduct, limit = 4) {
  const { data, error } = await insforge.database
    .from('products')
    .select(
      'id,name,slug,description,price,compare_at_price,currency,stock_quantity,category_id,is_featured,categories(name),product_images(image_url,alt_text,is_primary,sort_order)'
    )
    .eq('is_featured', true)
    .neq('id', product.id)
    .limit(limit);

  if (error || !data) {
    return [] as StorefrontProduct[];
  }

  return asDbRows(data).map((row) => buildProductFromRow({ ...row, categories: row.categories || { name: product.category } }));
}

export async function getCartItemsForUser() {
  const user = await getCurrentAppUser();
  if (!user) {
    return { items: [] as CartItem[], summary: buildCartSummary([]) };
  }

  const { data, error } = await insforge.database
    .from('cart')
    .select('id,product_id,quantity,updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return { items: [] as CartItem[], summary: buildCartSummary([]) };
  }

  const products = await Promise.all(
    asDbRows(data).map(async (row) => {
      const { data: productData, error: productError } = await insforge.database
        .from('products')
        .select(
          'id,name,slug,description,sku,price,compare_at_price,currency,stock_quantity,category_id,is_featured,categories(name),product_images(image_url,alt_text,is_primary,sort_order)'
        )
        .eq('id', row.product_id)
        .maybeSingle();

      if (productError || !productData) {
        return null;
      }

      return {
        id: String(row.id),
        productId: String(row.product_id),
        quantity: Number(row.quantity || 1),
        product: buildProductFromRow({ ...asDbRow(productData), categories: asDbRow(productData).categories || { name: 'Collection' } }),
      } as CartItem;
    })
  );

  const items = products.filter(Boolean) as CartItem[];
  return { items, summary: buildCartSummary(items) };
}

export async function addToCart(productId: string, quantity = 1) {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to save your cart.' };
  }

  const { data: existingRows, error: existingError } = await insforge.database
    .from('cart')
    .select('id,quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (existingError) {
    return { success: false, error: 'Unable to update cart.' };
  }

  const existingItem = asDbRows(existingRows)[0];

  if (existingItem) {
    const nextQuantity = Number(existingItem.quantity || 0) + quantity;
    const { error } = await insforge.database.from('cart').update({ quantity: nextQuantity }).eq('id', existingItem.id);
    return { success: !error, error: error?.message || null };
  }

  const { error } = await insforge.database.from('cart').insert([{ user_id: user.id, product_id: productId, quantity }]);
  return { success: !error, error: error?.message || null };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to save your cart.' };
  }

  if (quantity <= 0) {
    return removeCartItem(itemId);
  }

  const { error } = await insforge.database.from('cart').update({ quantity }).eq('id', itemId).eq('user_id', user.id);
  return { success: !error, error: error?.message || null };
}

export async function removeCartItem(itemId: string) {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to save your cart.' };
  }

  const { error } = await insforge.database.from('cart').delete().eq('id', itemId).eq('user_id', user.id);
  return { success: !error, error: error?.message || null };
}

export async function clearCart() {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to save your cart.' };
  }

  const { error } = await insforge.database.from('cart').delete().eq('user_id', user.id);
  return { success: !error, error: error?.message || null };
}

export async function getSavedAddressesForUser() {
  const user = await getCurrentAppUser();
  if (!user) {
    return [] as SavedAddress[];
  }

  const { data, error } = await insforge.database
    .from('addresses')
    .select('id,label,full_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default,updated_at')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [] as SavedAddress[];
  }

  return asDbRows(data).map(mapAddressRow);
}

export async function getCheckoutData(): Promise<CheckoutData> {
  const user = await getCurrentAppUser();

  if (!user) {
    return {
      user: null,
      addresses: [],
      items: [],
      summary: buildCartSummary([]),
    };
  }

  const [{ items, summary }, addresses] = await Promise.all([
    getCartItemsForUser(),
    getSavedAddressesForUser(),
  ]);

  return { user, addresses, items, summary };
}

export async function placeCodOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to place your order.' };
  }

  const normalizedAddress = input.addressId ? null : normalizeAddressInput(input.address);
  if (!input.addressId && !normalizedAddress) {
    return { success: false, error: 'Please add a complete shipping address.' };
  }

  const rpcResult = await placeCodOrderWithRpc(input.addressId || null, normalizedAddress, input.notes || '');
  if (rpcResult.success || !rpcResult.shouldFallback) {
    return rpcResult;
  }

  return placeCodOrderWithClientWrites(input.addressId || null, normalizedAddress, input.notes || '');
}

export async function createRazorpayCheckoutOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult & { checkout?: RazorpayCheckoutOrder }> {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to place your order.' };
  }

  const normalizedAddress = input.addressId ? null : normalizeAddressInput(input.address);
  if (!input.addressId && !normalizedAddress) {
    return { success: false, error: 'Please add a complete shipping address.' };
  }

  const { items, summary } = await getCartItemsForUser();
  const purchasableItems = items.filter((item) => item.product);

  if (!purchasableItems.length) {
    return { success: false, error: 'Your cart is empty.' };
  }

  const unavailableItem = purchasableItems.find((item) => Number(item.product?.stockQuantity || 0) < Number(item.quantity || 0));
  if (unavailableItem) {
    return { success: false, error: (unavailableItem.product?.name || 'An item') + ' is no longer available in the requested quantity.' };
  }

  const amountPaise = toRazorpayAmount(summary.grandTotal);
  if (amountPaise <= 0) {
    return { success: false, error: 'Unable to create a payment for an empty order.' };
  }

  const orderNumber = generateOrderNumber();
  let razorpayOrder: Awaited<ReturnType<typeof createRazorpayOrder>>;

  try {
    razorpayOrder = await createRazorpayOrder({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        order_number: orderNumber,
        user_id: user.id,
      },
    });
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Unable to start Razorpay payment.') };
  }

  const resolvedAddressId = input.addressId || (await createAddressForOrder(user.id, normalizedAddress));
  if (!resolvedAddressId) {
    return { success: false, error: 'Unable to save the shipping address.' };
  }

  const orderResult = await createOrderRecord(user.id, resolvedAddressId, summary, input.notes || '', orderNumber);
  if (!orderResult.success || !orderResult.orderId || !orderResult.orderNumber) {
    return orderResult;
  }

  const itemPayloads = purchasableItems.map((item) => ({
    order_id: orderResult.orderId,
    product_id: item.productId,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.product?.price || 0),
    total_price: roundCurrency(Number(item.product?.price || 0) * Number(item.quantity || 1)),
  }));

  const { error: itemError } = await insforge.database.from('order_items').insert(itemPayloads);
  if (itemError) {
    return { success: false, error: itemError.message || 'Unable to save order items.' };
  }

  const { error: paymentError } = await insforge.database.from('payments').insert([
    {
      order_id: orderResult.orderId,
      user_id: user.id,
      payment_method: 'card',
      payment_status: 'pending',
      transaction_id: razorpayOrder.id,
      amount: summary.grandTotal,
      currency: 'INR',
    },
  ]);

  if (paymentError) {
    return { success: false, error: paymentError.message || 'Unable to save payment details.' };
  }

  return {
    success: true,
    orderId: orderResult.orderId,
    orderNumber: orderResult.orderNumber,
    total: summary.grandTotal,
    checkout: {
      keyId: getRazorpayPublicKeyId(),
      razorpayOrderId: razorpayOrder.id,
      orderNumber: orderResult.orderNumber,
      amountPaise: Number(razorpayOrder.amount || amountPaise),
      amount: summary.grandTotal,
      currency: String(razorpayOrder.currency || 'INR'),
      customerName: user.full_name,
      customerEmail: user.email,
      customerPhone: normalizedAddress?.phone ? String(normalizedAddress.phone) : '',
    },
    error: null,
  };
}

export async function verifyRazorpayPayment(input: RazorpayPaymentVerificationInput): Promise<PlaceOrderResult> {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to confirm your payment.' };
  }

  const orderNumber = input.orderNumber.trim();
  const razorpayOrderId = input.razorpayOrderId.trim();
  const razorpayPaymentId = input.razorpayPaymentId.trim();
  const razorpaySignature = input.razorpaySignature.trim();

  if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return { success: false, error: 'Payment confirmation details are incomplete.' };
  }

  const { data: orderData, error: orderError } = await insforge.database
    .from('orders')
    .select('id,order_number,total_amount,status')
    .eq('user_id', user.id)
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderError || !orderData) {
    return { success: false, error: orderError?.message || 'Unable to find the order for this payment.' };
  }

  const orderRow = asDbRow(orderData);
  const { data: paymentRows, error: paymentError } = await insforge.database
    .from('payments')
    .select('id,payment_status,transaction_id,amount,currency')
    .eq('order_id', orderRow.id)
    .limit(1);

  if (paymentError) {
    return { success: false, error: paymentError.message || 'Unable to read payment details.' };
  }

  const payment = asDbRows(paymentRows)[0];
  if (!payment) {
    return { success: false, error: 'No payment record was found for this order.' };
  }

  if (String(payment.payment_status) === 'captured' && String(payment.transaction_id) === razorpayPaymentId) {
    return {
      success: true,
      orderId: String(orderRow.id),
      orderNumber: String(orderRow.order_number),
      total: Number(orderRow.total_amount || 0),
      error: null,
    };
  }

  const expectedRazorpayOrderId = String(payment.transaction_id || '');
  if (!expectedRazorpayOrderId || expectedRazorpayOrderId !== razorpayOrderId) {
    return { success: false, error: 'Payment order mismatch. Please try checkout again.' };
  }

  let signatureIsValid = false;
  try {
    signatureIsValid = verifyRazorpaySignature(expectedRazorpayOrderId, razorpayPaymentId, razorpaySignature);
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Unable to verify Razorpay payment.') };
  }

  if (!signatureIsValid) {
    await markPaymentFailedByOrder(String(orderRow.id), expectedRazorpayOrderId);
    return { success: false, error: 'Payment verification failed. Please contact support if money was deducted.' };
  }

  let razorpayPayment: RazorpayPaymentResponse;
  try {
    razorpayPayment = await fetchRazorpayPayment(razorpayPaymentId);
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Unable to verify payment status with Razorpay.') };
  }

  if (razorpayPayment.order_id !== expectedRazorpayOrderId) {
    await markPaymentFailedByOrder(String(orderRow.id), expectedRazorpayOrderId);
    return { success: false, error: 'Razorpay payment does not belong to this order.' };
  }

  const expectedAmount = toRazorpayAmount(Number(orderRow.total_amount || payment.amount || 0));
  const expectedCurrency = String(payment.currency || 'INR');
  if (Number(razorpayPayment.amount || 0) !== expectedAmount || String(razorpayPayment.currency || '') !== expectedCurrency) {
    await markPaymentFailedByOrder(String(orderRow.id), expectedRazorpayOrderId);
    return { success: false, error: 'Payment amount mismatch. Please contact support if money was deducted.' };
  }

  if (razorpayPayment.status === 'authorized' && !razorpayPayment.captured) {
    try {
      razorpayPayment = await captureRazorpayPayment(razorpayPaymentId, expectedAmount, expectedCurrency);
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Payment was authorized but could not be captured.') };
    }
  }

  const paymentStatus = mapRazorpayPaymentStatus(razorpayPayment);
  if (paymentStatus !== 'captured' && paymentStatus !== 'authorized') {
    await markPaymentFailedByOrder(String(orderRow.id), expectedRazorpayOrderId);
    return { success: false, error: 'Payment was not completed. Please try again.' };
  }

  const paidAt = razorpayPayment.created_at
    ? new Date(Number(razorpayPayment.created_at) * 1000).toISOString()
    : new Date().toISOString();
  const { error: updateError } = await insforge.database
    .from('payments')
    .update({
      payment_method: mapRazorpayPaymentMethod(razorpayPayment.method),
      payment_status: paymentStatus,
      transaction_id: razorpayPayment.id,
      paid_at: paidAt,
    })
    .eq('id', payment.id)
    .eq('order_id', orderRow.id);

  if (updateError) {
    return { success: false, error: updateError.message || 'Unable to save verified payment details.' };
  }

  await insforge.database.from('orders').update({ status: 'processing' }).eq('id', orderRow.id).eq('status', 'pending');
  await finalizeOnlineOrderAfterPayment(user.id, String(orderRow.id));

  return {
    success: true,
    orderId: String(orderRow.id),
    orderNumber: String(orderRow.order_number),
    total: Number(orderRow.total_amount || payment.amount || 0),
    error: null,
  };
}

export async function markRazorpayPaymentFailed(orderNumber: string, razorpayOrderId: string) {
  const user = await getCurrentAppUser();
  if (!user || !orderNumber.trim() || !razorpayOrderId.trim()) {
    return { success: false, error: 'Unable to update payment status.' };
  }

  const { data: orderData } = await insforge.database
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('order_number', orderNumber.trim())
    .maybeSingle();

  const orderRow = asDbRow(orderData);
  if (!orderRow.id) {
    return { success: false, error: 'Order was not found.' };
  }

  const { error } = await insforge.database
    .from('payments')
    .update({ payment_status: 'failed' })
    .eq('order_id', orderRow.id)
    .eq('transaction_id', razorpayOrderId.trim())
    .eq('payment_status', 'pending');

  return { success: !error, error: error?.message || null };
}

export async function getOrderByNumber(orderNumber: string) {
  const user = await getCurrentAppUser();
  const cleanOrderNumber = orderNumber.trim();

  if (!user || !cleanOrderNumber) {
    return null;
  }

  const { data: order, error } = await insforge.database
    .from('orders')
    .select(
      'id,order_number,status,subtotal,shipping_amount,tax_amount,discount_amount,total_amount,created_at,addresses(id,label,full_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default)'
    )
    .eq('user_id', user.id)
    .eq('order_number', cleanOrderNumber)
    .maybeSingle();

  if (error || !order) {
    return null;
  }

  const orderRow = asDbRow(order);
  const [{ data: itemRows }, { data: paymentRows }] = await Promise.all([
    insforge.database
      .from('order_items')
      .select('id,product_id,quantity,unit_price,total_price,products(name,slug,product_images(image_url,alt_text,is_primary,sort_order))')
      .eq('order_id', orderRow.id),
    insforge.database
      .from('payments')
      .select('payment_method,payment_status')
      .eq('order_id', orderRow.id)
      .limit(1),
  ]);

  const payment = asDbRows(paymentRows)[0];
  const addressValue = Array.isArray(orderRow.addresses) ? orderRow.addresses[0] : orderRow.addresses;
  const addressRow = addressValue ? asDbRow(addressValue) : null;

  return {
    id: String(orderRow.id),
    orderNumber: String(orderRow.order_number),
    status: String(orderRow.status || 'pending'),
    createdAt: String(orderRow.created_at || ''),
    paymentMethod: String(payment?.payment_method || 'cod'),
    paymentStatus: String(payment?.payment_status || 'pending'),
    subtotal: Number(orderRow.subtotal || 0),
    shipping: Number(orderRow.shipping_amount || 0),
    discount: Number(orderRow.discount_amount || 0),
    tax: Number(orderRow.tax_amount || 0),
    total: Number(orderRow.total_amount || 0),
    address: addressRow ? mapAddressRow(addressRow) : null,
    items: asDbRows(itemRows).map(mapOrderItemRow),
  } as OrderDetails;
}

export async function getCustomerOrderHistory(): Promise<CustomerOrderHistoryData> {
  const user = await getCurrentAppUser();

  if (!user) {
    return { user: null, orders: [] };
  }

  const { data: orderRows, error } = await insforge.database
    .from('orders')
    .select('id,order_number,status,subtotal,shipping_amount,tax_amount,discount_amount,total_amount,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !orderRows) {
    return { user, orders: [] };
  }

  const orders = await Promise.all(
    asDbRows(orderRows).map(async (orderRow) => {
      const [{ data: itemRows }, { data: paymentRows }] = await Promise.all([
        insforge.database
          .from('order_items')
          .select('id,product_id,quantity,unit_price,total_price,products(name,slug,product_images(image_url,alt_text,is_primary,sort_order))')
          .eq('order_id', orderRow.id),
        insforge.database
          .from('payments')
          .select('payment_method,payment_status')
          .eq('order_id', orderRow.id)
          .limit(1),
      ]);

      const payment = asDbRows(paymentRows)[0];

      return {
        id: String(orderRow.id),
        orderNumber: String(orderRow.order_number),
        status: String(orderRow.status || 'pending'),
        createdAt: String(orderRow.created_at || ''),
        paymentMethod: String(payment?.payment_method || 'cod'),
        paymentStatus: String(payment?.payment_status || 'pending'),
        subtotal: Number(orderRow.subtotal || 0),
        shipping: Number(orderRow.shipping_amount || 0),
        discount: Number(orderRow.discount_amount || 0),
        tax: Number(orderRow.tax_amount || 0),
        total: Number(orderRow.total_amount || 0),
        address: null,
        items: asDbRows(itemRows).map(mapOrderItemRow),
      } as OrderDetails;
    })
  );

  return { user, orders };
}

function mapAddressRow(row: DbRow): SavedAddress {
  return {
    id: String(row.id),
    label: String(row.label || 'Shipping'),
    fullName: String(row.full_name || ''),
    phone: String(row.phone || ''),
    addressLine1: String(row.address_line1 || ''),
    addressLine2: String(row.address_line2 || ''),
    city: String(row.city || ''),
    state: String(row.state || ''),
    postalCode: String(row.postal_code || ''),
    country: String(row.country || 'India'),
    isDefault: Boolean(row.is_default),
  };
}

function normalizeAddressInput(address?: ShippingAddressInput | null) {
  if (!address) return null;

  const normalized = {
    label: address.label.trim() || 'Shipping',
    full_name: address.fullName.trim(),
    phone: address.phone.trim() || null,
    address_line1: address.addressLine1.trim(),
    address_line2: address.addressLine2?.trim() || null,
    city: address.city.trim(),
    state: address.state.trim(),
    postal_code: address.postalCode.trim(),
    country: address.country.trim() || 'India',
    is_default: Boolean(address.isDefault),
  };

  if (!normalized.full_name || !normalized.address_line1 || !normalized.city || !normalized.state || !normalized.postal_code || !normalized.country) {
    return null;
  }

  return normalized;
}

function mapRazorpayPaymentMethod(method: string | null) {
  const normalized = String(method || '').toLowerCase();
  return ['card', 'upi', 'wallet', 'netbanking'].includes(normalized) ? normalized : 'card';
}

function mapRazorpayPaymentStatus(payment: RazorpayPaymentResponse) {
  if (payment.captured || payment.status === 'captured') return 'captured';
  if (payment.status === 'authorized') return 'authorized';
  if (payment.status === 'refunded') return 'refunded';
  if (payment.status === 'failed') return 'failed';
  return 'pending';
}

async function markPaymentFailedByOrder(orderId: string, transactionId: string) {
  await insforge.database
    .from('payments')
    .update({ payment_status: 'failed' })
    .eq('order_id', orderId)
    .eq('transaction_id', transactionId)
    .eq('payment_status', 'pending');
}

async function finalizeOnlineOrderAfterPayment(userId: string, orderId: string) {
  const { data: itemRows, error } = await insforge.database
    .from('order_items')
    .select('product_id,quantity,products(stock_quantity)')
    .eq('order_id', orderId);

  if (!error && itemRows) {
    for (const item of asDbRows(itemRows)) {
      const productId = String(item.product_id || '');
      const quantity = Number(item.quantity || 0);
      const product = firstRelationRow(item.products);
      const currentStock = Number(product.stock_quantity || 0);

      if (!productId || quantity <= 0) continue;

      await insforge.database
        .from('products')
        .update({ stock_quantity: Math.max(0, currentStock - quantity) })
        .eq('id', productId)
        .gte('stock_quantity', quantity);
    }
  }

  await insforge.database.from('cart').delete().eq('user_id', userId);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function placeCodOrderWithRpc(
  addressId: string | null,
  address: ReturnType<typeof normalizeAddressInput>,
  notes: string
): Promise<PlaceOrderResult & { shouldFallback?: boolean }> {
  const { data, error } = await insforge.database.rpc('place_cod_order', {
    p_address_id: addressId,
    p_address: address,
    p_notes: notes.trim() || null,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return { success: false, shouldFallback: true, error: error.message };
    }

    return { success: false, shouldFallback: false, error: error.message || 'Unable to place order.' };
  }

  const payload = normalizeRpcOrderPayload(data);
  if (!payload.orderNumber) {
    return { success: false, shouldFallback: false, error: 'Unable to confirm the order ID.' };
  }

  return {
    success: true,
    shouldFallback: false,
    orderId: payload.orderId,
    orderNumber: payload.orderNumber,
    total: payload.total,
    error: null,
  };
}

async function placeCodOrderWithClientWrites(
  addressId: string | null,
  address: ReturnType<typeof normalizeAddressInput>,
  notes: string
): Promise<PlaceOrderResult> {
  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: 'Please sign in to place your order.' };
  }

  const { items, summary } = await getCartItemsForUser();
  const purchasableItems = items.filter((item) => item.product);

  if (!purchasableItems.length) {
    return { success: false, error: 'Your cart is empty.' };
  }

  const unavailableItem = purchasableItems.find((item) => Number(item.product?.stockQuantity || 0) < Number(item.quantity || 0));
  if (unavailableItem) {
    return { success: false, error: (unavailableItem.product?.name || 'An item') + ' is no longer available in the requested quantity.' };
  }

  const resolvedAddressId = addressId || (await createAddressForOrder(user.id, address));
  if (!resolvedAddressId) {
    return { success: false, error: 'Unable to save the shipping address.' };
  }

  const orderResult = await createOrderRecord(user.id, resolvedAddressId, summary, notes);
  if (!orderResult.success || !orderResult.orderId || !orderResult.orderNumber) {
    return orderResult;
  }

  const itemPayloads = purchasableItems.map((item) => ({
    order_id: orderResult.orderId,
    product_id: item.productId,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.product?.price || 0),
    total_price: roundCurrency(Number(item.product?.price || 0) * Number(item.quantity || 1)),
  }));

  const { error: itemError } = await insforge.database.from('order_items').insert(itemPayloads);
  if (itemError) {
    return { success: false, error: itemError.message || 'Unable to save order items.' };
  }

  const { error: paymentError } = await insforge.database.from('payments').insert([
    {
      order_id: orderResult.orderId,
      user_id: user.id,
      payment_method: 'cod',
      payment_status: 'pending',
      amount: summary.grandTotal,
      currency: 'INR',
    },
  ]);

  if (paymentError) {
    return { success: false, error: paymentError.message || 'Unable to save payment details.' };
  }

  for (const item of purchasableItems) {
    const nextStock = Math.max(0, Number(item.product?.stockQuantity || 0) - Number(item.quantity || 0));
    const { data: stockRows, error: stockError } = await insforge.database
      .from('products')
      .update({ stock_quantity: nextStock })
      .eq('id', item.productId)
      .gte('stock_quantity', Number(item.quantity || 0))
      .select('id,stock_quantity');

    if (stockError || !stockRows || asDbRows(stockRows).length === 0) {
      return { success: false, error: stockError?.message || (item.product?.name || 'An item') + ' is no longer available.' };
    }
  }

  await clearCart();

  return {
    success: true,
    orderId: orderResult.orderId,
    orderNumber: orderResult.orderNumber,
    total: summary.grandTotal,
    error: null,
  };
}

async function createAddressForOrder(userId: string, address: ReturnType<typeof normalizeAddressInput>) {
  if (!address) return null;

  if (address.is_default) {
    await insforge.database.from('addresses').update({ is_default: false }).eq('user_id', userId);
  }

  const { data, error } = await insforge.database
    .from('addresses')
    .insert([{ ...address, user_id: userId }])
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return String(asDbRow(data).id);
}

async function createOrderRecord(userId: string, addressId: string, summary: CartSummary, notes: string, requestedOrderNumber?: string): Promise<PlaceOrderResult> {
  const maxAttempts = requestedOrderNumber ? 1 : 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const orderNumber = requestedOrderNumber || generateOrderNumber();
    const { data, error } = await insforge.database
      .from('orders')
      .insert([
        {
          user_id: userId,
          address_id: addressId,
          order_number: orderNumber,
          status: 'pending',
          subtotal: summary.subtotal,
          shipping_amount: summary.shipping,
          tax_amount: summary.tax,
          discount_amount: summary.discount,
          total_amount: summary.grandTotal,
          notes: notes.trim() || null,
        },
      ])
      .select('id,order_number,total_amount')
      .maybeSingle();

    if (!error && data) {
      const row = asDbRow(data);
      return {
        success: true,
        orderId: String(row.id),
        orderNumber: String(row.order_number),
        total: Number(row.total_amount || summary.grandTotal),
        error: null,
      };
    }

    if (!isUniqueViolation(error) || requestedOrderNumber) {
      return { success: false, error: error?.message || 'Unable to create order.' };
    }
  }

  return { success: false, error: 'Unable to generate a unique order ID. Please try again.' };
}

function normalizeRpcOrderPayload(data: unknown) {
  const value = Array.isArray(data) ? data[0] : data;
  const payload = typeof value === 'string' ? parseJsonObject(value) : asDbRow(value);

  return {
    orderId: String(payload.orderId || payload.order_id || payload.id || ''),
    orderNumber: String(payload.orderNumber || payload.order_number || ''),
    total: Number(payload.total || payload.total_amount || 0),
  };
}

function mapOrderItemRow(row: DbRow) {
  const product = firstRelationRow(row.products);
  const sortedImages = asDbRows(product.product_images)
    .filter(Boolean)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  return {
    id: String(row.id),
    productId: String(row.product_id),
    name: String(product.name || 'Product'),
    slug: String(product.slug || ''),
    imageUrl: String(sortedImages[0]?.image_url || '/placeholder-images/banarasi-silk-saree.svg'),
    quantity: Number(row.quantity || 1),
    unitPrice: Number(row.unit_price || 0),
    totalPrice: Number(row.total_price || 0),
  };
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return 'ALK-' + datePart + '-' + timePart + '-' + randomPart;
}

function isMissingRpcError(error: unknown) {
  const { code, message } = asDbRow(error) as DbErrorLike;
  const normalizedMessage = String(message || '').toLowerCase();
  const normalizedCode = String(code || '');

  return normalizedCode === 'PGRST202' || normalizedCode === '42883' || (normalizedMessage.includes('place_cod_order') && (normalizedMessage.includes('not find') || normalizedMessage.includes('function')));
}

function isUniqueViolation(error: unknown) {
  const { code, message } = asDbRow(error) as DbErrorLike;
  const normalizedMessage = String(message || '').toLowerCase();

  return String(code || '') === '23505' || normalizedMessage.includes('duplicate') || normalizedMessage.includes('unique');
}
function buildCartSummary(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);
    const compareAtPrice = item.product?.compareAtPrice;
    const originalUnitPrice = compareAtPrice && compareAtPrice > price ? compareAtPrice : price;
    return sum + originalUnitPrice * Number(item.quantity || 0);
  }, 0);
  const discountedSubtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0);
  const discount = subtotal - discountedSubtotal;
  const shipping = discountedSubtotal > 5000 ? 0 : discountedSubtotal > 0 ? 199 : 0;
  const tax = discountedSubtotal > 0 ? discountedSubtotal * 0.05 : 0;
  const grandTotal = discountedSubtotal + shipping + tax;

  return {
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal: roundCurrency(subtotal),
    shipping: roundCurrency(shipping),
    discount: roundCurrency(discount),
    tax: roundCurrency(tax),
    grandTotal: roundCurrency(grandTotal),
  };
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
