import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { getCanvasId } from "@/lib/data/cookies";
import { retrieveCart } from "@/lib/data/cart";
import { listCategories } from "@/lib/data/categories";
import { Suspense } from "react";
import { AiCanvas } from "./canvas/ai-canvas";

export async function Storefront() {
  const categories = await listCategories();
  const cart = await retrieveCart();
  const canvasId = await getCanvasId();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header categories={categories} cart={cart} />
      <Suspense fallback={<div className="p-8">Loading chat interface...</div>}>
        <div className="h-full w-full flex flex-row overflow-hidden p-4 space-x-4">
          <ChatInterface categories={categories} cart={cart} />
          <AiCanvas canvasId={canvasId || ""} cart={cart} />
        </div>
      </Suspense>
    </div>
  );
}
