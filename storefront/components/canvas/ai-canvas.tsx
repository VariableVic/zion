import { HttpTypes } from "@medusajs/types";
import { ToolResult } from "ai";
import { Card } from "../ui/card";
import { ProductCard } from "../ui/product-card";
import { ProductGrid } from "../ui/product-grid";
import { ProductRecommendations } from "./product-recommendations";
import { Button } from "../ui/button";

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
  categories,
  handleOptionClick,
}: {
  toolResults: ToolResult<any, any, any>[];
  categories: HttpTypes.StoreProductCategory[];
  handleOptionClick: (option: string) => void;
}) {
  return (
    <Card className="h-full p-6 overflow-auto w-1/2 space-y-4">
      <div className="flex flex-col gap-4">
        <p className="text-lg font-bold">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="rounded-full"
              onClick={() =>
                handleOptionClick(
                  `Can you recommend me some ${category.name.toLowerCase()}?`
                )
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      {toolResults.length > 0 && (
        <>
          <ProductRecommendations toolResults={toolResults} />
          {/* <pre>{JSON.stringify(toolResults, null, 2)}</pre> */}
        </>
      )}
    </Card>
  );
}
