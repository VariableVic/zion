import { CartSidebar } from "@/components/cart/cart-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { CartProvider } from "@/context/cart-context";
import { listCategories } from "@/lib/data/categories";
import { Suspense } from "react";

export async function Storefront() {
  const categories = await listCategories();

  return (
    <CartProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <Suspense
          fallback={<div className="p-8">Loading chat interface...</div>}
        >
          <ChatInterface categories={categories} />
        </Suspense>
        <CartSidebar />
      </div>
    </CartProvider>
  );
}
