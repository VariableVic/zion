import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils";
import {
  CalculatedPriceSet,
  Product,
  ProductVariant,
} from "../../.medusa/types/query-entry-points";
import { logger } from "@medusajs/framework";

interface VariantWithPrice extends ProductVariant {
  calculated_price?: CalculatedPriceSet;
}
export default async function syncVectorDb({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  const vectorService = container.resolve(VECTOR_MODULE_KEY);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  let productId = data.id;

  console.log("productId from subscriber", productId);

  if (name === "product-variant.updated") {
    const {
      data: [variant],
    } = await query.graph({
      entity: "product_variant",
      fields: ["id", "product_id"],
      filters: {
        id: data.id,
      },
    });

    if (variant && variant.product_id) {
      productId = variant?.product_id;
    }
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });

  const region = regions[0];

  const { data: productsData, metadata } = (await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
      "variants.calculated_price.*", // Add this to get calculated prices
      "tags.*",
      "categories.*",
      "images.*",
    ],
    filters: {
      id: productId,
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
        }),
      },
    },
  })) as {
    data: (Product & { variants: VariantWithPrice[] })[];
    metadata: { count: number };
  };

  console.log("productsData from subscriber", productsData);

  // Check if productsData is an array, if not, wrap it in []
  const productsArray = Array.isArray(productsData)
    ? productsData
    : [productsData];

  for (const product of productsArray) {
    // Create vector-friendly data representation
    // Combining relevant text fields for semantic search
    const textData = [
      product.title,
      product.description || "",
      product.subtitle || "",
      product.handle || "",
      (product.tags || []).map((tag) => tag.value).join(" "),
      (product.categories || []).map((category) => category?.name).join(" "),
    ].join(" ");

    // Add product to vector database
    await vectorService.upsert({
      id: product.id,
      data: textData,
      metadata: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail,
        description: product.description,
        subtitle: product.subtitle,
        images: product.images,
        variants: product.variants,
        price: product.variants[0]?.calculated_price?.calculated_amount,
        variants_count: product.variants?.length || 0,
        status: product.status,
        categories: product.categories?.map((category) => category?.name),
      },
    });

    logger.info(`Upserted product: ${product.title} (${product.id})`);
  }
  logger.info(
    `Completed upsert of ${metadata?.count} products to vector database`
  );
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product-variant.updated"],
};
