import { ExecArgs } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { logger } from "@medusajs/framework";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import VectorService from "../modules/vector/service";

export default async function upsertProductsToVector({ container }: ExecArgs) {
  // Resolve services
  const productService = container.resolve(ModuleRegistrationName.PRODUCT);
  const vectorService = container.resolve(VECTOR_MODULE_KEY) as VectorService;

  logger?.info("Fetching all products...");

  // Fetch all products (getting first 1000 products)
  const [products, count] = await productService.listAndCountProducts(
    {},
    {
      take: 1000,
      skip: 0,
      relations: ["variants", "tags", "categories", "images"],
    }
  );

  logger?.info(`Found ${count} products. Starting vector upsert...`);

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
      (product.categories || []).map((category) => category.name).join(" "),
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
        variants_count: product.variants?.length || 0,
        status: product.status,
      },
    });

    logger?.info(`Upserted product: ${product.title} (${product.id})`);
  }

  logger?.info(`Completed upsert of ${count} products to vector database`);
}
