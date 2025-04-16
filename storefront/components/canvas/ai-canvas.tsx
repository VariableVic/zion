import { getCanvasId } from "@/lib/data/cookies";
import { AiCanvasClient } from "./ai-canvas-client";
import { retrieveCart } from "@/lib/data/cart";

export async function AiCanvas() {
  const canvasId = await getCanvasId();
  const cart = await retrieveCart();

  return <AiCanvasClient canvasId={canvasId || ""} cart={cart} />;
}
