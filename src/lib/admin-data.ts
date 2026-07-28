import { insforge } from './insforge';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  compare_at_price?: number | null;
  fabric?: string | null;
  sizes?: string[] | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  categories?: { name?: string } | { name?: string }[] | null;
};

type ProductRowFromDb = Omit<ProductRow, 'is_new_arrival' | 'is_bestseller'> &
  Partial<Pick<ProductRow, 'fabric' | 'sizes' | 'is_new_arrival' | 'is_bestseller'>>;

const unsupportedProductFields = new Set(['fabric', 'sizes', 'is_new_arrival', 'is_bestseller']);

function stripUnsupportedProductFields(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !unsupportedProductFields.has(key)));
}

function withProductDefaults(product: ProductRowFromDb): ProductRow {
  return {
    ...product,
    fabric: product.fabric ?? null,
    sizes: product.sizes ?? null,
    is_new_arrival: product.is_new_arrival ?? false,
    is_bestseller: product.is_bestseller ?? false,
  };
}

export async function getAdminDashboardData() {
  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }, { data: orders, error: ordersError }, { data: customers, error: customersError }] = await Promise.all([
    insforge.database.from('products').select('id, name, stock_quantity, price, is_active'),
    insforge.database.from('categories').select('id, name, is_active'),
    insforge.database.from('orders').select('id, total_amount'),
    insforge.database.from('users').select('id'),
  ]);

  if (productsError || categoriesError || ordersError || customersError) {
    return {
      metrics: {
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      },
      products: [],
      categories: [],
    };
  }

  const totalRevenue = (orders ?? []).reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return {
    metrics: {
      totalProducts: (products ?? []).length,
      totalCategories: (categories ?? []).length,
      totalOrders: (orders ?? []).length,
      totalCustomers: (customers ?? []).length,
      totalRevenue,
    },
    products: products ?? [],
    categories: categories ?? [],
  };
}

export async function getAdminCategories() {
  const { data, error } = await insforge.database.from('categories').select('id, name, slug, description, is_active').order('name');
  return { data: data ?? [], error };
}

export async function getAdminProducts() {
  const { data, error } = await insforge.database
    .from('products')
    .select('id, name, slug, category_id, description, sku, price, compare_at_price, stock_quantity, is_active, is_featured, categories(name)')
    .order('created_at', { ascending: false });

  return { data: ((data ?? []) as unknown as ProductRowFromDb[]).map(withProductDefaults), error };
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; is_active?: boolean }) {
  const { data, error } = await insforge.database.from('categories').insert([input]).select();
  return { data, error };
}

export async function updateCategory(id: string, updates: Partial<CategoryRow>) {
  const { data, error } = await insforge.database.from('categories').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteCategory(id: string) {
  const { data, error } = await insforge.database.from('categories').delete().eq('id', id).select();
  return { data, error };
}

export async function createProduct(input: Record<string, unknown>) {
  const { data, error } = await insforge.database.from('products').insert([stripUnsupportedProductFields(input)]).select();
  return { data, error };
}

export async function updateProduct(id: string, updates: Record<string, unknown>) {
  const { data, error } = await insforge.database.from('products').update(stripUnsupportedProductFields(updates)).eq('id', id).select();
  return { data, error };
}

export async function deleteProduct(id: string) {
  const { data, error } = await insforge.database.from('products').delete().eq('id', id).select();
  return { data, error };
}
