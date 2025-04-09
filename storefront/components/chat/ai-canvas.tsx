import { ToolInvocation, ToolResult } from "ai";
import { Card } from "../ui/card";
import { ChatStreamingUI } from "./chat-streaming-ui";
import { ProductGrid } from "../ui/product-grid";
import { ProductCard } from "../ui/product-card";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export function AiCanvas({
  toolResults,
}: {
  toolResults: ToolResult<any, any, any>[];
}) {
  if (toolResults.length === 0) {
    return null;
  }

  const productRecommendations = toolResults
    .filter(
      (toolInvocation) =>
        toolInvocation.toolName === "getProductRecommendations"
    )
    ?.map((toolInvocation) => toolInvocation.result);

  console.log("vic logs productRecommendations", productRecommendations);

  return (
    <Card className="h-full p-4 overflow-auto w-1/2 space-y-4">
      {productRecommendations.length > 0 &&
        productRecommendations.map((productRecommendation, index) => {
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
                    image={product.thumbnail}
                    description={product.description}
                    best_option={product.best_option}
                    might_also_like={product.might_also_like}
                  />
                ))}
              </ProductGrid>
            </div>
          );
        })}
      <pre>{JSON.stringify(toolResults, null, 2)}</pre>
    </Card>
  );
}
