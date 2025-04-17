import { formatCurrency } from "@/lib/utils";
import { ParticleBackground } from "../chat/particle-background";
import { Canvas } from "@/types";
import Image from "next/image";
import { addToCanvas } from "@/lib/data/canvas";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderConfirmation({ canvas }: { canvas: Canvas }) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const closeOrder = async () => {
    setIsLoading(true);
    await addToCanvas({
      order_open: false,
      checkout_initialized: false,
    });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative">
      <ParticleBackground />
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6 p-8 text-center">
        <h2 className="text-2xl font-bold">Order Confirmed</h2>
        <p className="max-w-md text-muted-foreground">
          Your order has been confirmed. Thank you for your purchase.
        </p>
        <div className="flex gap-4 border rounded-lg p-4 z-10 bg-background justify-center items-center w-1/2">
          <p>Order Total: {formatCurrency(canvas?.order?.total || 0)}</p>
        </div>
        {canvas?.order?.items?.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex gap-4 border rounded-lg p-4 z-10 bg-background justify-between items-center w-2/3"
          >
            <Image
              src={item.thumbnail || ""}
              alt={item.title || ""}
              width={50}
              height={50}
              quality={20}
              className="rounded-md"
            />
            <div className="flex flex-col gap-2 justify-end items-end">
              <p className="text-base font-bold text-right">
                {item.product_title}
              </p>
              <div className="flex gap-1 justify-end text-sm">
                <p>{item.quantity} x </p>
                <p>{formatCurrency(item.unit_price)}</p>
              </div>
            </div>
          </div>
        ))}
        {canvas?.order?.items?.length && canvas?.order?.items?.length > 3 && (
          <p className="text-sm text-muted-foreground">
            + {canvas?.order?.items?.length - 3} more items
          </p>
        )}
        <Button
          onClick={closeOrder}
          loading={isLoading}
          type="button"
          className="z-10"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
