import { retrieveCart } from "@/lib/data/cart";
import { CartButtonClient } from "./cart-button-client";

export async function CartButton() {
  const cart = await retrieveCart();

  return <CartButtonClient cart={cart} />;
}
