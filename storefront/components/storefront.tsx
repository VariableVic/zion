import { AiCanvas } from "@/components/canvas/ai-canvas";
import { AiCanvasSkeleton } from "@/components/canvas/ai-canvas-skeleton";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatInterfaceSkeleton } from "@/components/chat/chat-interface-skeleton";
import { Header } from "@/components/header";
import { Suspense } from "react";

export async function Storefront() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="h-full w-full flex flex-row overflow-hidden p-4 space-x-4">
        <Suspense fallback={<ChatInterfaceSkeleton />}>
          <ChatInterface />
        </Suspense>
        <Suspense fallback={<AiCanvasSkeleton />}>
          <AiCanvas />
        </Suspense>
      </div>
    </div>
  );
}
