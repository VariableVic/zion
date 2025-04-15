import { ToolResult } from "ai";
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";
import { Canvas } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselVerticalScrollBar,
} from "../ui/carousel";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
export function ProductRecommendations({
  productRecommendations,
}: {
  productRecommendations: Canvas["product_recommendations"];
}) {
  const length = useMemo(
    () => productRecommendations.length,
    [productRecommendations]
  );

  if (length === 0) {
    return null;
  }
  return (
    <Carousel
      orientation="vertical"
      opts={{
        align: "end",
        loop: false,
        skipSnaps: true,
      }}
      className="h-full flex gap-4 hover:cursor-grab active:cursor-grabbing"
      setApi={(api) => {
        if (api) {
          api.on("reInit", () => {
            api.scrollTo(length - 1, false);
          });
        }
      }}
    >
      {/* <div className="flex gap-2 select-none items-center">
    
      </div> */}
      <CarouselContent className="h-full">
        {productRecommendations.map(
          (productRecommendation: any, index: number) => {
            if (productRecommendation.products.length === 0) {
              return null;
            }

            return (
              <CarouselItem
                key={`product-recommendations-${index}`}
                className="basis-1/2"
              >
                <div className="flex flex-col gap-4">
                  <ProductGrid
                    key="product-grid"
                    title={productRecommendation.heading}
                  >
                    {productRecommendation.products.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        id={product.variant_id}
                        name={product.title}
                        price={product.price}
                        thumbnail={product.thumbnail}
                        images={product.images}
                        description={product.description}
                        best_option={product.best_option}
                        might_also_like={product.might_also_like}
                      />
                    ))}
                  </ProductGrid>
                </div>
              </CarouselItem>
            );
          }
        )}
      </CarouselContent>
      <CarouselVerticalScrollBar />
    </Carousel>
  );
}
