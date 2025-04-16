import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { logger } from "@medusajs/framework";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import { IVectorService } from "../types/vector";

export default async function syncVectorDb({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const vectorService = container.resolve<IVectorService>(VECTOR_MODULE_KEY);

  await vectorService.delete({
    id: data.id,
  });

  logger.info(`Deleted product: ${data.id}`);
}

export const config: SubscriberConfig = {
  event: ["product.deleted"],
};
