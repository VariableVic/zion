import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  Modules,
  QueryContext,
} from "@medusajs/framework/utils";
import { StoreProduct } from "@medusajs/types";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import { IVectorService } from "../types/vector";

// Step 1: Fetch all products with necessary details
const fetchProductsForVectorStep = createStep(
  "fetch-products-for-vector-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    logger?.info("Fetching all products for vector upsert...");

    // Fetch region for price context (assuming one region for simplicity, like the script)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
    });

    if (!regions || regions.length === 0) {
      logger?.error("No regions found. Cannot determine price context.");
      throw new Error("No regions found for price context.");
    }
    const region = regions[0]; // Use the first region found

    // Fetch products - adjust pagination as needed or implement looping for large datasets
    const { data: products, metadata } = (await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.calculated_price.*",
        "tags.*",
        "categories.*",
        "images.*",
      ],
      pagination: {
        take: 1000, // Match script's limit, consider increasing or adding pagination logic
        skip: 0,
      },
      context: {
        variants: {
          calculated_price: QueryContext({
            region_id: region.id,
            currency_code: region.currency_code,
          }),
        },
      },
    })) as unknown as {
      data: StoreProduct[];
      metadata: { count: number };
    };

    logger?.info(`Found ${metadata?.count} products.`);

    return new StepResponse({ products, count: metadata?.count || 0 });
  }
);

// Step 2: Upsert products to vector database
const upsertVectorDataStep = createStep(
  "upsert-vector-data-step",
  async (input: { products: StoreProduct[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const vectorService = container.resolve<IVectorService>(VECTOR_MODULE_KEY);
    const { products } = input;

    logger?.info(`Starting vector upsert for ${products.length} products...`);

    let upsertedCount = 0;
    for (const product of products) {
      try {
        // Create vector-friendly data representation
        const textData = [
          product.title,
          product.description || "",
          product.subtitle || "",
          product.handle || "",
          (product.tags || []).map((tag) => tag.value).join(" "),
          (product.categories || [])
            .map((category) => category?.name)
            .join(" "),
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
            price: product?.variants?.[0]?.calculated_price?.calculated_amount,
            variants_count: product.variants?.length || 0,
            status: product.status,
            categories: product.categories?.map((category) => category?.name),
          },
        });

        logger?.debug(`Upserted product: ${product.title} (${product.id})`);
        upsertedCount++;
      } catch (error) {
        logger?.error(
          `Failed to upsert product ${product.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Optionally decide whether to continue or stop on error
      }
    }

    logger?.info(
      `Completed upsert of ${upsertedCount} products to vector database`
    );
    return new StepResponse({ upsertedCount });
  }
);

// Define the workflow
export const upsertProductsToVectorWorkflowId = "upsert-products-to-vector";

export const upsertProductsToVectorWorkflow = createWorkflow(
  {
    name: upsertProductsToVectorWorkflowId,
    retentionTime: 10000, // Keep history for ~3 hours
    store: true, // Store execution history
  },
  function () {
    // Step 1: Fetch products
    const { products, count } = fetchProductsForVectorStep();

    // Step 2: Upsert fetched products to vector DB
    const { upsertedCount } = upsertVectorDataStep({ products });

    return new WorkflowResponse({
      productsFetched: count,
      productsUpserted: upsertedCount,
    });
  }
);

// Ensure the default export is the workflow itself if needed for registration
// export default upsertProductsToVectorWorkflow; // Uncomment if needed by your loader
