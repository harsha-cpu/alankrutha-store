import CartView from "./CartView";
import { getCartItemsForUser } from "@/lib/storefront-data";

export default async function CartPage() {
  const { items, summary } = await getCartItemsForUser();
  const cartVersion = items.map((item) => `${item.id}:${item.quantity}`).join("|");

  return <CartView key={`${cartVersion}:${summary.grandTotal}`} initialItems={items} initialSummary={summary} />;
}