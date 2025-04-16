import { AiCanvas } from "@/components/canvas/ai-canvas";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { Suspense } from "react";

export async function Storefront() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="h-full w-full flex flex-row overflow-hidden p-4 space-x-4">
        <Suspense
          fallback={<div className="p-8">Loading chat interface...</div>}
        >
          <ChatInterface />
        </Suspense>
        <Suspense fallback={<div className="p-8">Loading canvas...</div>}>
          <AiCanvas />
        </Suspense>
      </div>
    </div>
  );
}
