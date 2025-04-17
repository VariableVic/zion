import { getCanvasId } from "@/lib/data/cookies";
import { AiCanvasClient } from "./ai-canvas-client";
import { retrieveCart } from "@/lib/data/cart";
import { listCartShippingMethods } from "@/lib/data/fulfillment";
import { HttpTypes } from "@medusajs/types";

export async function AiCanvas() {
  const canvasId = await getCanvasId();
  const cart = await retrieveCart();
  let availableShippingOptions: HttpTypes.StoreCartShippingOption[] | null =
    null;
  if (cart?.id) {
    availableShippingOptions = await listCartShippingMethods(cart?.id);
  }

  return (
    <AiCanvasClient
      canvasId={canvasId || ""}
      cart={cart}
      availableShippingOptions={availableShippingOptions}
    />
  );
}
