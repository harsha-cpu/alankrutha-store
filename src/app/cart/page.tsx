import CartView from "./CartView";
import { getCartItemsForUser } from "@/lib/storefront-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function CartPage() {
  const { items, summary } = await getCartItemsForUser();
  const cartVersion = items.map((item) => `${item.id}:${item.quantity}`).join("|");

  return <CartView key={`${cartVersion}:${summary.grandTotal}`} initialItems={items} initialSummary={summary} />;
}