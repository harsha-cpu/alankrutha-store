"use client";

import { useEffect, useMemo, useState } from "react";
import { createCategory, createProduct, deleteCategory, deleteProduct, getAdminCategories, getAdminProducts, updateCategory, updateProduct } from "@/lib/admin-data";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
};

type ProductRow = {
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
  categories?: { name?: string } | null;
};

export default function AdminPanel() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    slug: "",
    category_id: "",
    description: "",
    sku: "",
    fabric: "",
    price: "",
    compare_at_price: "",
    stock_quantity: "",
    sizes: "S, M, L, XL, XXL",
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
  });
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", slug: "", description: "", is_active: true });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: productData }, { data: categoryData }] = await Promise.all([getAdminProducts(), getAdminCategories()]);
      setProducts((productData ?? []) as ProductRow[]);
      setCategories((categoryData ?? []) as CategoryRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = !query || [product.name, product.sku, product.description].some((value) => value?.toString().toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, categoryFilter]);

  async function handleProductSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: productForm.name,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category_id: productForm.category_id,
      description: productForm.description,
      sku: productForm.sku,
      fabric: productForm.fabric,
      price: Number(productForm.price),
      compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : null,
      sizes: productForm.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      stock_quantity: Number(productForm.stock_quantity || 0),
      is_active: productForm.is_active,
      is_featured: productForm.is_featured,
      is_new_arrival: productForm.is_new_arrival,
      is_bestseller: productForm.is_bestseller,
    };

    const result = productForm.id
      ? await updateProduct(productForm.id, payload)
      : await createProduct(payload);

    if (result.error) {
      setStatusMessage(result.error.message || "Unable to save product.");
      return;
    }

    const refreshed = await getAdminProducts();
    setProducts((refreshed.data ?? []) as ProductRow[]);
    setStatusMessage(productForm.id ? "Product updated." : "Product created.");
    resetProductForm();
  }

  async function handleCategorySubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: categoryForm.description,
      is_active: categoryForm.is_active,
    };

    const result = categoryForm.id
      ? await updateCategory(categoryForm.id, payload)
      : await createCategory(payload);

    if (result.error) {
      setStatusMessage(result.error.message || "Unable to save category.");
      return;
    }

    const refreshed = await getAdminCategories();
    setCategories((refreshed.data ?? []) as CategoryRow[]);
    setStatusMessage(categoryForm.id ? "Category updated." : "Category created.");
    setCategoryForm({ id: "", name: "", slug: "", description: "", is_active: true });
  }

  async function handleDeleteProduct(id: string) {
    const result = await deleteProduct(id);
    if (result.error) {
      setStatusMessage(result.error.message || "Unable to delete product.");
      return;
    }
    setProducts((current) => current.filter((product) => product.id !== id));
    setStatusMessage("Product deleted.");
  }

  async function handleDeleteCategory(id: string) {
    const result = await deleteCategory(id);
    if (result.error) {
      setStatusMessage(result.error.message || "Unable to delete category.");
      return;
    }
    setCategories((current) => current.filter((category) => category.id !== id));
    setStatusMessage("Category deleted.");
  }

  function resetProductForm() {
    setProductForm({
      id: "",
      name: "",
      slug: "",
      category_id: categories[0]?.id || "",
      description: "",
      sku: "",
      fabric: "",
      price: "",
      compare_at_price: "",
      stock_quantity: "",
      sizes: "S, M, L, XL, XXL",
      is_active: true,
      is_featured: false,
      is_new_arrival: false,
      is_bestseller: false,
    });
  }

  function editProduct(product: ProductRow) {
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      description: product.description || "",
      sku: product.sku || "",
      fabric: product.fabric || "",
      price: String(product.price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      stock_quantity: String(product.stock_quantity),
      sizes: (product.sizes || ["S", "M", "L", "XL", "XXL"]).join(", "),
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_bestseller: product.is_bestseller,
    });
  }

  function editCategory(category: CategoryRow) {
    setCategoryForm({ id: category.id, name: category.name, slug: category.slug, description: category.description || "", is_active: category.is_active });
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
          <h1 className="font-serif text-3xl text-[#7A1F3D]">Admin Product Management</h1>
          <p className="mt-2 text-stone-600">Manage products, categories, inventory, and storefront visibility from one place.</p>
          {statusMessage ? <p className="mt-4 rounded-full bg-[#F5EBDD] px-3 py-2 text-sm text-[#7A1F3D]">{statusMessage}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total Products", value: products.length },
            { label: "Total Categories", value: categories.length },
            { label: "Total Orders", value: "—" },
            { label: "Total Customers", value: "—" },
            { label: "Total Revenue", value: "₹0" },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#7A1F3D]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[#2f1d24]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-[#7A1F3D]">Add or edit product</h2>
            <form onSubmit={handleProductSubmit} className="mt-4 space-y-3">
              <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} placeholder="Product name" className="w-full rounded-full border border-stone-300 px-4 py-3" required />
              <input value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} placeholder="Slug" className="w-full rounded-full border border-stone-300 px-4 py-3" />
              <select value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })} className="w-full rounded-full border border-stone-300 px-4 py-3" required>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input value={productForm.fabric} onChange={(event) => setProductForm({ ...productForm, fabric: event.target.value })} placeholder="Fabric" className="w-full rounded-full border border-stone-300 px-4 py-3" />
              <input value={productForm.price} type="number" onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="Price" className="w-full rounded-full border border-stone-300 px-4 py-3" required />
              <input value={productForm.compare_at_price} type="number" onChange={(event) => setProductForm({ ...productForm, compare_at_price: event.target.value })} placeholder="Compare price" className="w-full rounded-full border border-stone-300 px-4 py-3" />
              <input value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} placeholder="SKU" className="w-full rounded-full border border-stone-300 px-4 py-3" />
              <input value={productForm.stock_quantity} type="number" onChange={(event) => setProductForm({ ...productForm, stock_quantity: event.target.value })} placeholder="Stock quantity" className="w-full rounded-full border border-stone-300 px-4 py-3" required />
              <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Description" className="min-h-24 w-full rounded-[1.25rem] border border-stone-300 px-4 py-3" />
              <input value={productForm.sizes} onChange={(event) => setProductForm({ ...productForm, sizes: event.target.value })} placeholder="Sizes (S, M, L, XL, XXL)" className="w-full rounded-full border border-stone-300 px-4 py-3" />
              <div className="grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2"><input type="checkbox" checked={productForm.is_active} onChange={(event) => setProductForm({ ...productForm, is_active: event.target.checked })} /> Active</label>
                <label className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2"><input type="checkbox" checked={productForm.is_featured} onChange={(event) => setProductForm({ ...productForm, is_featured: event.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2"><input type="checkbox" checked={productForm.is_new_arrival} onChange={(event) => setProductForm({ ...productForm, is_new_arrival: event.target.checked })} /> New Arrival</label>
                <label className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2"><input type="checkbox" checked={productForm.is_bestseller} onChange={(event) => setProductForm({ ...productForm, is_bestseller: event.target.checked })} /> Bestseller</label>
              </div>
              <div className="rounded-[1.25rem] border border-dashed border-[#d8bb87] bg-[#FFFDF8] p-4 text-sm text-stone-600">
                Multiple image uploads can be added later via the storage integration layer.
              </div>
              <div className="flex gap-3">
                <button type="submit" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white">Save product</button>
                <button type="button" onClick={resetProductForm} className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D]">Reset</button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#7A1F3D]">Manage categories</h2>
              <form onSubmit={handleCategorySubmit} className="mt-4 space-y-3">
                <input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="Category name" className="w-full rounded-full border border-stone-300 px-4 py-3" required />
                <input value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} placeholder="Slug" className="w-full rounded-full border border-stone-300 px-4 py-3" />
                <textarea value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} placeholder="Description" className="min-h-24 w-full rounded-[1.25rem] border border-stone-300 px-4 py-3" />
                <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={categoryForm.is_active} onChange={(event) => setCategoryForm({ ...categoryForm, is_active: event.target.checked })} /> Active</label>
                <div className="flex gap-3">
                  <button type="submit" className="rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white">Save category</button>
                  <button type="button" onClick={() => setCategoryForm({ id: "", name: "", slug: "", description: "", is_active: true })} className="rounded-full border border-[#d8bb87] px-5 py-3 font-medium text-[#7A1F3D]">Reset</button>
                </div>
              </form>
              <div className="mt-4 space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-[1rem] bg-[#FFFDF8] px-4 py-3">
                    <div>
                      <p className="font-medium text-[#2f1d24]">{category.name}</p>
                      <p className="text-sm text-stone-500">{category.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editCategory(category)} className="rounded-full border border-[#d8bb87] px-3 py-1 text-sm">Edit</button>
                      <button onClick={() => handleDeleteCategory(category.id)} className="rounded-full bg-[#7A1F3D] px-3 py-1 text-sm text-white">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl text-[#7A1F3D]">Products</h2>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="rounded-full border border-stone-300 px-4 py-2" />
              </div>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="mt-3 w-full rounded-full border border-stone-300 px-4 py-2">
                <option value="all">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <div className="mt-4 space-y-3">
                {loading ? <p className="text-sm text-stone-500">Loading products…</p> : filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-[1.1rem] border border-stone-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#2f1d24]">{product.name}</p>
                        <p className="text-sm text-stone-500">{product.categories?.name || "Uncategorized"} • SKU {product.sku || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#7A1F3D]">₹{product.price}</p>
                        <p className={`text-sm ${product.stock_quantity <= 0 ? "text-red-600" : product.stock_quantity < 5 ? "text-amber-600" : "text-emerald-600"}`}>
                          {product.stock_quantity <= 0 ? "Out of stock" : product.stock_quantity < 5 ? "Low stock" : "In stock"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-700"}`}>{product.is_active ? "Active" : "Inactive"}</span>
                      {product.is_featured ? <span className="rounded-full bg-[#F5EBDD] px-2.5 py-1 text-xs text-[#7A1F3D]">Featured</span> : null}
                      {product.is_new_arrival ? <span className="rounded-full bg-[#F5EBDD] px-2.5 py-1 text-xs text-[#7A1F3D]">New Arrival</span> : null}
                      {product.is_bestseller ? <span className="rounded-full bg-[#F5EBDD] px-2.5 py-1 text-xs text-[#7A1F3D]">Bestseller</span> : null}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => editProduct(product)} className="rounded-full border border-[#d8bb87] px-3 py-2 text-sm">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="rounded-full bg-[#7A1F3D] px-3 py-2 text-sm text-white">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
