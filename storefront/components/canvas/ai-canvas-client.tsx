"use client";

import { addToCanvas } from "@/lib/data/canvas";
import { cn } from "@/lib/utils";
import { Canvas } from "@/types";
import { HttpTypes } from "@medusajs/types";
import { useEffect, useState } from "react";
import { ParticleBackground } from "../chat/particle-background";
import { CheckoutDrawer } from "./checkout-drawer";
import { ProductRecommendations } from "./product-recommendations";

export function AiCanvasClient({
  canvasId,
  cart,
}: {
  canvasId: string;
  cart?: HttpTypes.StoreCart | null;
}) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cancelCheckout = async () => {
    await addToCanvas({
      checkout_initialized: false,
    });
    setCheckoutOpen(false);
  };

  useEffect(() => {
    if (!canvasId) return;

    // Create an EventSource connection to the SSE endpoint
    const eventSource = new EventSource(`/api/canvas/${canvasId}/stream`);

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newCanvas = data.canvas;
        setCanvas(newCanvas);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        eventSource.close();
        // The browser will automatically attempt to reconnect
      }, 5000);
    };

    // Clean up the connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [canvasId]);

  const productRecommendations = canvas?.product_recommendations || [];
  const hasProductRecommendations = productRecommendations.length > 0;
  const checkoutInitialized = canvas?.checkout_initialized;

  useEffect(() => {
    if (checkoutInitialized) {
      setCheckoutOpen(true);
    }
  }, [checkoutInitialized]);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-1/2 overflow-hidden space-y-4 rounded-lg border scroll-smooth",
        hasProductRecommendations && "p-6"
      )}
    >
      {checkoutInitialized && (
        <CheckoutDrawer
          cart={cart || null}
          isOpen={checkoutOpen}
          onClose={() => {
            cancelCheckout();
          }}
        />
      )}

      {hasProductRecommendations && !checkoutOpen && (
        <ProductRecommendations
          productRecommendations={productRecommendations}
        />
      )}

      {!checkoutOpen && !hasProductRecommendations && (
        <div className="flex flex-col h-full w-full items-center justify-center relative">
          <ParticleBackground />
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center">
            <h2 className="text-2xl font-bold">This is your canvas</h2>
            <p className="max-w-md text-muted-foreground">
              Zion will use this canvas to show you products, forms, and other
              UI relevant to the conversation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
