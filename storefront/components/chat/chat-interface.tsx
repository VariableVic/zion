import { listCategories } from "@/lib/data/categories";
import { retrieveCart } from "@/lib/data/cart";
import { ChatInterfaceClient } from "./chat-interface-client";

export async function ChatInterface() {
  const categories = await listCategories();
  const cart = await retrieveCart();

  return <ChatInterfaceClient categories={categories} cart={cart} />;
}
