"use client";

import { CheckoutDrawer } from "@/components/canvas/checkout-drawer";
import { OrderConfirmation } from "@/components/canvas/order-confirmation";
import { ProductRecommendations } from "@/components/canvas/product-recommendations";
import { ParticleBackground } from "@/components/chat/particle-background";
import { addToCanvas } from "@/lib/data/canvas";
import { cn } from "@/lib/utils";
import { Canvas } from "@/types";
import { HttpTypes } from "@medusajs/types";
import { useEffect, useMemo, useState } from "react";

export function AiCanvasClient({
  canvasId,
  cart,
  availableShippingOptions,
}: {
  canvasId: string;
  cart?: HttpTypes.StoreCart | null;
  availableShippingOptions: HttpTypes.StoreCartShippingOption[] | null;
}) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cancelCheckout = async () => {
    await addToCanvas({
      checkout_initialized: false,
    });
    setCheckoutOpen(false);
  };

  const hasCartItems = useMemo(
    () => cart?.items && cart?.items?.length && cart?.items?.length > 0,
    [cart?.items]
  );

  const hasOrder = useMemo(
    () => canvas?.order && canvas?.order?.id,
    [canvas?.order]
  );

  const orderOpen = useMemo(() => canvas?.order_open, [canvas?.order_open]);

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
    if (checkoutInitialized && hasCartItems) {
      setCheckoutOpen(true);
    }
  }, [checkoutInitialized, hasCartItems]);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-1/2 overflow-hidden space-y-4 rounded-lg border scroll-smooth",
        hasProductRecommendations && "p-6"
      )}
    >
      {checkoutInitialized && hasCartItems && !hasOrder && (
        <CheckoutDrawer
          cart={cart || null}
          isOpen={checkoutOpen}
          availableShippingOptions={availableShippingOptions}
          onClose={() => {
            cancelCheckout();
          }}
        />
      )}

      {hasOrder && canvas && orderOpen && <OrderConfirmation canvas={canvas} />}

      {hasProductRecommendations && !checkoutOpen && !orderOpen && (
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
