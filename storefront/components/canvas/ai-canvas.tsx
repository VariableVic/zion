"use client";

import { HttpTypes } from "@medusajs/types";
import { ToolResult } from "ai";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ProductRecommendations } from "./product-recommendations";
import { useRef, useState, useEffect } from "react";
import { Canvas } from "@/types";

export function AiCanvas({
  categories,
  canvasId,
}: {
  categories: HttpTypes.StoreProductCategory[];
  canvasId: string;
}) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const threshold = 1000;

  // Scroll to bottom function
  const scrollToBottom = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    console.log("scrolling to bottom!!");
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });

    setShowScrollButton(false);
  };

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    const isScrolledToBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      threshold;
    setShowScrollButton(!isScrolledToBottom);
  };

  useEffect(() => {
    if (!canvasId) return;

    // Create an EventSource connection to the SSE endpoint
    const eventSource = new EventSource(`/api/canvas/${canvasId}/stream`);

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      // Check if should auto-scroll when canvas change
      const scrollToBottomIfWithinThreshold = () => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        const isScrolledToBottom =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
          threshold;

        console.log("vic logs isScrolledToBottom", isScrolledToBottom);
        if (isScrolledToBottom) {
          console.log("vic logs scrollToBottom");
          scrollToBottom();
        } else {
          console.log("vic logs setShowScrollButton");
          setShowScrollButton(true);
        }
      };

      try {
        const data = JSON.parse(event.data);
        const newCanvas = data.canvas;
        setCanvas(newCanvas);
        setTimeout(() => {
          scrollToBottomIfWithinThreshold();
        }, 10);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    // Handle connection open
    eventSource.onopen = () => {
      console.log("vic logs eventSource.onopen");
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

  return (
    <Card
      className="h-full p-6 overflow-auto w-1/2 space-y-4"
      ref={scrollViewportRef}
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-4 ai-canvas">
        {canvas?.product_recommendations?.length &&
          canvas?.product_recommendations?.length > 0 && (
            <>
              <ProductRecommendations
                productRecommendations={canvas.product_recommendations}
              />
              {/* <pre>{JSON.stringify(toolResults, null, 2)}</pre> */}
            </>
          )}
      </div>
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-16 right-10 z-10 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}
    </Card>
  );
}
