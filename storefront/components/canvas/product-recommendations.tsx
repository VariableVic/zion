import { Canvas } from "@/types";
import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselVerticalScrollBar,
} from "../ui/carousel";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";

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
        skipSnaps: true
      }}
      className="h-full flex gap-4 hover:cursor-grab active:cursor-grabbing"
      setApi={(api) => {
        if (api) {
          api.on("reInit", () => {
            api.scrollTo(length - 1, false);
          });
        }
      }}
      plugins={[WheelGesturesPlugin()]}
    >
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
                    showNav={productRecommendation.products.length > 3}
                  >
                    {productRecommendation.products.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        id={product.variant_id}
                        product_id={product.id}
                        name={product.title}
                        price={product.price}
                        thumbnail={product.thumbnail}
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
