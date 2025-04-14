import { ToolResult } from "ai";
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";
import { Canvas } from "@/types";

export function ProductRecommendations({
  productRecommendations,
}: {
  productRecommendations: Canvas["product_recommendations"];
}) {
  if (productRecommendations.length === 0) {
    return null;
  }

  return (
    <>
      {productRecommendations.map(
        (productRecommendation: any, index: number) => {
          if (productRecommendation.products.length === 0) {
            return null;
          }
          return (
            <div
              className="flex flex-col gap-4"
              key={`product-recommendations-${index}`}
            >
              <p className="text-lg font-bold">
                {productRecommendation.heading}
              </p>
              <ProductGrid key="product-grid">
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
          );
        }
      )}
    </>
  );
}
