"use client";

import type React from "react";
import type { ToolInvocation } from "ai";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGrid } from "@/components/ui/product-grid";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { PaymentForm } from "@/components/checkout/payment-form";

interface ChatStreamingUIProps {
  toolInvocation: ToolInvocation;
}

export function ChatStreamingUI({ toolInvocation }: ChatStreamingUIProps) {
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Parse content for special UI components
    const parseContent = () => {
      const newComponents: React.ReactNode[] = [];
      console.log("vic logs toolInvocation", toolInvocation);

      // Check for product recommendations
      if (
        toolInvocation.toolName === "getProductRecommendations" &&
        toolInvocation.state === "result"
      ) {
        const productRecommendations = toolInvocation.result;

        newComponents.push(
          <div className="flex flex-col gap-4" key="product-recommendations">
            <p className="text-lg font-bold">
              Results for {productRecommendations.heading}
            </p>
            <ProductGrid key="product-grid">
              {productRecommendations.products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={`product-${product.id}`}
                  name={product.title}
                  price={product.price}
                  image={product.thumbnail}
                  description={product.description}
                  best_option={product.best_option}
                />
              ))}
            </ProductGrid>
          </div>
        );

        // scrollToBottomIfWithinThreshold();
      }

      // // Check for shipping form
      // if (content.includes("[SHIPPING_FORM]")) {
      //   content = content.replace("[SHIPPING_FORM]", "");
      //   newComponents.push(<ShippingForm key="shipping-form" />);

      //   // scrollToBottomIfWithinThreshold();
      // }

      // // Check for payment form
      // if (content.includes("[PAYMENT_FORM]")) {
      //   content = content.replace("[PAYMENT _FORM]", "");
      //   newComponents.push(<PaymentForm key="payment-form" />);

      //   // scrollToBottomIfWithinThreshold();
      // }

      setComponents((components) => [...components, ...newComponents]);
    };

    console.log("vic logs components", components);

    parseContent();
  }, [toolInvocation]);

  if (components.length === 0) return null;

  return <div className="mt-4 space-y-4">{components}</div>;
}
