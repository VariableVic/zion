"use client";

import { HttpTypes } from "@medusajs/types";
import { ToolResult } from "ai";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ProductRecommendations } from "./product-recommendations";
import { useRef, useState, useEffect } from "react";

export function AiCanvas({
  toolResults,
  categories,
  handleOptionClick,
}: {
  toolResults: ToolResult<any, any, any>[];
  categories: HttpTypes.StoreProductCategory[];
  handleOptionClick: (option: string) => void;
}) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const threshold = 500;

  // Scroll to bottom function
  const scrollToBottom = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });

    setShowScrollButton(false);
  };

  // Check if should auto-scroll when toolResults change
  useEffect(() => {
    const scrollToBottomIfWithinThreshold = () => {
      const viewport = scrollViewportRef.current;
      if (!viewport) return;

      const isScrolledToBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
        threshold;

      if (isScrolledToBottom) {
        scrollToBottom();
      } else {
        setShowScrollButton(true);
      }
    };

    scrollToBottomIfWithinThreshold();
  }, [toolResults]);

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    const isScrolledToBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      threshold;
    setShowScrollButton(!isScrolledToBottom);
  };

  return (
    <Card
      className="h-full p-6 overflow-auto w-1/2 space-y-4"
      ref={scrollViewportRef}
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-4 ai-canvas">
        <p className="text-lg font-bold">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="rounded-full"
              onClick={() =>
                handleOptionClick(
                  `What ${category.name.toLowerCase()} would you recommend?`
                )
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {toolResults.length > 0 && (
          <>
            <ProductRecommendations toolResults={toolResults} />
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
