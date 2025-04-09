import { ToolResult } from "ai";
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";

export function ProductRecommendations({
  toolResults,
}: {
  toolResults: ToolResult<any, any, any>[];
}) {
  const productRecommendations = toolResults
    ?.filter(
      (toolInvocation) =>
        toolInvocation.toolName === "getProductRecommendations"
    )
    ?.map((toolInvocation) => toolInvocation.result);
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
                    score={product.score}
                    id={`product-${product.id}`}
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
