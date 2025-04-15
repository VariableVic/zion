"use client";

import type React from "react";
import type { ToolInvocation } from "ai";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGrid } from "@/components/ui/product-grid";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { Button } from "../ui/button";

interface ChatStreamingUIProps {
  toolInvocation: ToolInvocation;
  handleOptionClick: (option: string) => void;
}

export function ChatStreamingUI({
  toolInvocation,
  handleOptionClick,
}: ChatStreamingUIProps) {
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Parse content for special UI components
    const parseContent = () => {
      const newComponents: React.ReactNode[] = [];

      // Check for product recommendations
      if (
        toolInvocation.toolName === "followUpPromptSuggestions" &&
        toolInvocation.state === "result"
      ) {
        const followUpPromptSuggestions = toolInvocation.result;

        newComponents.push(
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {followUpPromptSuggestions.options.map((option: any) => (
              <Button
                key={option}
                variant="outline"
                className="rounded-full"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );
      }

      setComponents((components) => [...components, ...newComponents]);
    };

    parseContent();
  }, [toolInvocation]);

  if (components.length === 0) return null;

  return <div className="mt-4 space-y-4">{components}</div>;
}
