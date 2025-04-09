import { ToolResult } from "ai";
import { Card } from "../ui/card";
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";
import { ProductRecommendations } from "./product-recommendations";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  thumbnail: string;
  images: string[];
}

export function AiCanvas({
  toolResults,
}: {
  toolResults: ToolResult<any, any, any>[];
}) {
  return (
    <Card className="h-full p-6 overflow-auto w-1/2 space-y-4">
      {toolResults.length > 0 ? (
        <>
          <ProductRecommendations toolResults={toolResults} />
          {/* <pre>{JSON.stringify(toolResults, null, 2)}</pre> */}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">Best sellers</p>
          <ProductGrid>
            <ProductCard
              id="product-1"
              name="Product 1"
              price={100}
              description="Product 1 description"
              thumbnail="/placeholder.svg"
              images={["/placeholder.svg"]}
            />
            <ProductCard
              id="product-2"
              name="Product 2"
              price={100}
              description="Product 2 description"
              thumbnail="/placeholder.svg"
              images={["/placeholder.svg"]}
            />
            <ProductCard
              id="product-3"
              name="Product 3"
              price={100}
              description="Product 3 description"
              thumbnail="/placeholder.svg"
              images={["/placeholder.svg"]}
            />
          </ProductGrid>
        </div>
      )}
    </Card>
  );
}
