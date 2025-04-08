import { Suspense } from "react";
import { CartProvider } from "@/context/cart-context";
import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export function Storefront() {
  return (
    <CartProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden hide-scrollbar">
            <Suspense
              fallback={<div className="p-8">Loading chat interface...</div>}
            >
              <ChatInterface />
            </Suspense>
          </div>
          <CartSidebar />
        </div>
      </div>
    </CartProvider>
  );
}
