"use client";

import { addToCanvas } from "@/lib/data/canvas";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Canvas } from "@/types";
import { HttpTypes } from "@medusajs/types";
import { useEffect, useMemo, useState } from "react";
import { ParticleBackground } from "../chat/particle-background";
import { CheckoutDrawer } from "./checkout-drawer";
import { ProductRecommendations } from "./product-recommendations";
import Image from "next/image";

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
      {checkoutInitialized && (
        <CheckoutDrawer
          cart={cart || null}
          isOpen={checkoutOpen}
          availableShippingOptions={availableShippingOptions}
          onClose={() => {
            cancelCheckout();
          }}
        />
      )}

      {hasOrder && (
        <div className="flex flex-col h-full w-full items-center justify-center relative">
          <ParticleBackground />
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center">
            <h2 className="text-2xl font-bold">Order Confirmed</h2>
            <p className="max-w-md text-muted-foreground">
              Your order has been confirmed. Thank you for your purchase.
            </p>
            <div className="flex gap-4 border rounded-lg p-4 z-10 bg-background justify-center items-center w-1/2">
              <p>Order Total: {formatCurrency(canvas?.order?.total || 0)}</p>
            </div>
            {canvas?.order?.items?.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border rounded-lg p-4 z-10 bg-background justify-center items-center w-1/2"
              >
                <Image
                  src={item.thumbnail || ""}
                  alt={item.title || ""}
                  width={50}
                  height={50}
                  quality={20}
                  className="rounded-md"
                />
                <div className="flex flex-col gap-2 justify-end items-end">
                  <p className="text-base font-bold">{item.product_title}</p>
                  <div className="flex gap-2 justify-end text-sm">
                    <p>{item.quantity}x</p>
                    <p>{formatCurrency(item.total)}</p>
                  </div>
                </div>
              </div>
            ))}
            {canvas?.order?.items?.length &&
              canvas?.order?.items?.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  + {canvas?.order?.items?.length - 3} more items
                </p>
              )}

            <div className="flex gap-4 border rounded-lg p-4 z-10 bg-background text-left w-2/3">
              <p className="text-sm text-muted-foreground flex flex-col gap-2">
                Shipping to:{" "}
                <span className="font-bold">
                  {canvas?.order?.shipping_address?.address_1}
                  {", "}
                  {canvas?.order?.shipping_address?.city}{" "}
                </span>
                <span className="font-bold">
                  {canvas?.order?.shipping_address?.province}
                  {", "}
                  {canvas?.order?.shipping_address?.postal_code}
                </span>
                <span className="font-bold">
                  {canvas?.order?.shipping_address?.country_code?.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {hasProductRecommendations && !checkoutOpen && !hasOrder && (
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
