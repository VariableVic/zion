import { Button } from "../ui/button";
import { HttpTypes } from "@medusajs/types";
import { deleteCanvas } from "@/lib/data/canvas";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CategoryBar({
  categories,
  handleOptionClick,
  resetChat,
  isLoading,
}: {
  categories: HttpTypes.StoreProductCategory[];
  handleOptionClick: (option: string) => void;
  resetChat: () => void;
  isLoading: boolean;
}) {
  const [isResetting, setIsResetting] = useState(false);

  const router = useRouter();

  const resetCanvas = async () => {
    setIsResetting(true);
    await deleteCanvas().then(() => {
      router.refresh();
    });
    setTimeout(() => {
      resetChat();
    }, 200);
    setTimeout(() => {
      setIsResetting(false);
    }, 1000);
  };

  return (
    <div className="flex p-4 items-center border-b border-border justify-between">
      <div className="flex gap-4 items-center">
        <p className="text-md font-bold">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="rounded-full"
              disabled={isLoading}
              onClick={() =>
                handleOptionClick(
                  `Show me your best ${category.name.toLowerCase()}.`
                )
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full"
        onClick={resetCanvas}
        disabled={isResetting || isLoading}
      >
        <RefreshCcw
          className={cn("w-3 h-3", {
            "animate-spin direction-reverse repeat-1": isResetting,
          })}
        />
      </Button>
    </div>
  );
}
