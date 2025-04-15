"use client";

import { Button } from "@/components/ui/button";
import { deleteLineItem, updateLineItem } from "@/lib/data/cart";
import { cn, formatCurrency } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";
import { Minus, Plus, RefreshCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartItemProps {
  item: HttpTypes.StoreCartLineItem;
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsUpdating(true);
    if (quantity === 0) {
      await deleteLineItem(itemId);
      return;
    }
    await updateLineItem({ lineId: itemId, quantity });
    setIsUpdating(false);
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(true);
    await deleteLineItem(itemId);
  };

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
        <Image
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.product_title || "Product"}
          fill
          className={cn("object-cover", {
            "opacity-50": isUpdating,
          })}
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <RefreshCcw className="h-4 w-4 animate-spin direction-reverse" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h4 className="font-medium line-clamp-1">{item.product_title}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => removeItem(item.id)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(item.total)}
        </p>
        <div className="mt-2 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={isUpdating}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="w-10 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={isUpdating}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
