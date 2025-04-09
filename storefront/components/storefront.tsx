import { CartSidebar } from "@/components/cart/cart-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { CartProvider } from "@/context/cart-context";
import { Suspense } from "react";
import { Card } from "./ui/card";
import { ProductCard } from "./ui/product-card";
import { ProductGrid } from "./ui/product-grid";

export function Storefront() {
  return (
    <CartProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <Suspense
          fallback={<div className="p-8">Loading chat interface...</div>}
        >
          <ChatInterface />
        </Suspense>
        <CartSidebar />
      </div>
    </CartProvider>
  );
}
