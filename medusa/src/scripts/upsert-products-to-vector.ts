import { CalculatedPriceSet, ExecArgs } from "@medusajs/framework/types";
import {
  ModuleRegistrationName,
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils";
import { logger } from "@medusajs/framework";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import VectorService from "../modules/vector/service";

import {
  Product,
  ProductVariant,
} from "../../.medusa/types/query-entry-points";

interface VariantWithPrice extends ProductVariant {
  calculated_price?: CalculatedPriceSet;
}

export default async function upsertProductsToVector({ container }: ExecArgs) {
  // Resolve services
  const productService = container.resolve(ModuleRegistrationName.PRODUCT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const vectorService = container.resolve(VECTOR_MODULE_KEY) as VectorService;

  logger?.info("Fetching all products...");

  // Fetch all products (getting first 1000 products)
  // const [products, count] = await productService.listAndCountProducts(
  //   {},
  //   {
  //     take: 1000,
  //     skip: 0,
  //     relations: ["variants", "tags", "categories", "images", "prices"],
  //   }
  // );

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });

  const region = regions[0];

  const { data: products, metadata } = (await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
      "variants.calculated_price.*", // Add this to get calculated prices
      "tags.*",
      "categories.*",
      "images.*",
    ],
    pagination: {
      take: 1000,
      skip: 0,
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region.id, // Replace with actual region ID
          currency_code: region.currency_code, // Replace with actual currency code
        }),
      },
    },
  })) as {
    data: (Product & { variants: VariantWithPrice[] })[];
    metadata: { count: number };
  };

  logger?.info(`Found ${metadata?.count} products. Starting vector upsert...`);

  // Process each product
  for (const product of products) {
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
      },
    });

    logger?.info(`Upserted product: ${product.title} (${product.id})`);
  }

  logger?.info(
    `Completed upsert of ${metadata?.count} products to vector database`
  );
}
