"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGrid } from "@/components/ui/product-grid";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { PaymentForm } from "@/components/checkout/payment-form";

interface ChatStreamingUIProps {
  content: string;
  scrollToBottomIfWithinThreshold: () => void;
}

export function ChatStreamingUI({
  content,
  scrollToBottomIfWithinThreshold,
}: ChatStreamingUIProps) {
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Parse content for special UI components
    const parseContent = () => {
      const newComponents: React.ReactNode[] = [];
      const parsedContent = JSON.parse(content);
      console.log("parsedContent", parsedContent);

      // Check for product recommendations
      if (
        parsedContent.toolInvocations[0].name === "getProductRecommendations"
      ) {
        const productRecommendations = JSON.parse(
          parsedContent.toolInvocations[0].arguments
        );
        console.log("productRecommendations", productRecommendations);
        newComponents.push(
          <ProductGrid key="product-grid">
            {productRecommendations.map((product: any) => (
              <ProductCard
                key={product.id}
                id={`product-${product.id}`}
                name={product.title}
                price={product.price}
                image={product.thumbnail}
                description={product.description}
              />
            ))}
          </ProductGrid>
        );

        // scrollToBottomIfWithinThreshold();
      }

      // Check for shipping form
      if (content.includes("[SHIPPING_FORM]")) {
        content = content.replace("[SHIPPING_FORM]", "");
        newComponents.push(<ShippingForm key="shipping-form" />);

        // scrollToBottomIfWithinThreshold();
      }

      // Check for payment form
      if (content.includes("[PAYMENT_FORM]")) {
        content = content.replace("[PAYMENT_FORM]", "");
        newComponents.push(<PaymentForm key="payment-form" />);

        // scrollToBottomIfWithinThreshold();
      }

      setComponents(newComponents);
    };

    parseContent();
  }, [content]);

  if (components.length === 0) return null;

  return <div className="mt-4 space-y-4">{components}</div>;
}
