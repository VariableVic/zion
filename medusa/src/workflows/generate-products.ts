import { openai } from "@ai-sdk/openai";
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateProductWorkflowInputDTO } from "@medusajs/types";
import {
  experimental_generateImage as generateImage,
  generateObject,
} from "ai";
import { z } from "zod";
import { VECTOR_MODULE_KEY } from "../modules/vector";
import { IVectorService } from "../types/vector";

// Step 1: Fetch necessary data
const fetchDataStep = createStep(
  "fetch-data-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("Fetching default sales channel...");
    const defaultSalesChannel =
      await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
      });
    logger.info(`Found ${defaultSalesChannel.length} default sales channels`);

    logger.info("Fetching shipping profiles...");
    const shippingProfiles =
      await fulfillmentModuleService.listShippingProfiles({
        type: "default",
      });
    const shippingProfile = shippingProfiles.length
      ? shippingProfiles[0]
      : null;
    logger.info(`Found ${shippingProfiles.length} shipping profiles`);
    if (!shippingProfile) {
      logger.warn("No default shipping profile found");
    }

    logger.info("Fetching product categories...");
    const { data: categoryResult } = await query.graph({
      entity: "product_category",
      fields: ["*"],
    });
    logger.info(`Found ${categoryResult.length} product categories`);

    logger.info("Checking for existing products...");
    const existingProducts = await query.graph({
      entity: "product",
      fields: ["id", "handle", "variants.sku"],
    });

    const existingProductHandles = existingProducts.data.map(
      (product) => product.handle
    );

    const existingProductVariants = existingProducts.data.map((product) =>
      product.variants.map((variant) => variant.sku)
    );
    logger.info(`Found ${existingProducts.data.length} existing products`);

    return new StepResponse({
      defaultSalesChannel,
      shippingProfile,
      categoryResult,
      existingProductHandles,
      existingProductVariants,
    });
  }
);

// Step 2: Generate product data using AI
const generateProductDataStep = createStep(
  "generate-product-data-step",
  async (
    input: {
      defaultSalesChannel: any[];
      shippingProfile: any | null;
      categoryResult: any[];
      existingProductHandles: string[];
      existingProductVariants: (string | null | undefined)[][];
      count: string | number;
    },
    { container }
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const {
      defaultSalesChannel,
      shippingProfile,
      categoryResult,
      existingProductHandles,
      existingProductVariants,
      count,
    } = input;

    logger.info(`Generating ${count} product data using AI...`);
    const productData = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Generate ${count} imaginary products for a high-end vintage design furniture store. Think cool, minimalistic, mid-century modern, Scandinavian, Danish, Dutch and Belgian design. Not: antiques, retro, or baroque style. The products should be unique to each other. The products should be in the following categories: ${categoryResult.map(
        (cat) => {
          return `Category "${cat.name}" has id ${cat.id}`;
        }
      )}. Each product should have exactly one variant with appropriate material descriptions (like "Wood, Wool, Foam"), pricing in both EUR and USD currencies (between 100-5000). The variants should have a default option value. Each product should have one default option. Always set manage_inventory to false.
      These are the already existing product handles: ${existingProductHandles.join(
        ", "
      )}. The product handles you generate should be unique and not identical to each other or existing product handles.
      These are the already existing product variants: ${existingProductVariants
        .flat()
        .filter((v) => v)
        .join(
          ", "
        )}. The product variants you generate should be unique and very different from what's already in the database.
      `,
      schemaDescription: `A list of ${count} product objects for a high-end vintage furniture store`,
      schema: z.object({
        products: z.array(
          z.object({
            title: z.string({
              description: "Short, concise title of the product. 3-4 words max",
            }),
            description: z.string({
              description: `A detailed description of the product. 100-200 words. Use markdown formatting.`,
            }),
            handle: z.string(),
            weight: z.number(),
            status: z.nativeEnum(ProductStatus),
            shipping_profile_id: z.string().optional(),
            category_ids: z.array(
              z.enum([...categoryResult.map((cat) => cat.id)] as [
                string,
                ...string[]
              ])
            ),
            options: z.array(
              z.object({
                title: z.string().default("Default option"),
                values: z.array(z.string()).default(["Default option value"]),
              })
            ),
            variants: z.array(
              z.object({
                title: z.string().default("Default variant"),
                sku: z.string().optional(),
                origin_country: z.string().default("dk"),
                material: z.string().optional(),
                options: z.record(z.string(), z.string()).optional(),
                manage_inventory: z.boolean().default(false),
                prices: z
                  .array(
                    z.object({
                      amount: z.number().int().min(100).max(5000),
                      currency_code: z.enum(["eur", "usd"]),
                    })
                  )
                  .min(2),
              })
            ),
            image_prompt: z.string({
              description:
                "A prompt for generating an image of the product. Detailed description of the product and scene.",
            }),
          })
        ),
      }),
    });
    logger.info("AI product data generation complete");

    const { products } = productData.object as unknown as {
      products: (CreateProductWorkflowInputDTO & { image_prompt: string })[];
    };

    logger.info(`Generated ${products.length} products`);
    products.forEach((product, index) => {
      logger.info(`Product ${index + 1}: ${product.title} (${product.handle})`);
      product.sales_channels = [
        {
          id: defaultSalesChannel[0].id,
        },
      ];
      product.handle =
        product.handle + Math.random().toString(36).substring(2, 9);
      product.shipping_profile_id = shippingProfile?.id;
      product.status = ProductStatus.PUBLISHED;
      product.metadata = {
        image_prompt: product.image_prompt,
      };
    });

    return new StepResponse({ products });
  }
);

// Step 3: Create products in database
const createProductsStep = createStep(
  "create-products-step",
  async (input: { products: any[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const { products } = input;

    logger.info("Creating products in database...");
    const { result: createdProducts } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products,
      },
    });
    logger.info(
      `Successfully created ${createdProducts.length} products in database`
    );

    return new StepResponse({ createdProducts });
  }
);

// Step 4: Generate and process images
const generateImagesStep = createStep(
  "generate-images-step",
  async (input: { createdProducts: any[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const fileService = container.resolve(Modules.FILE);
    const { createdProducts } = input;

    logger.info("Fetching created products data...");
    const { data: createdProductsData } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: createdProducts.map((product) => product.id),
      },
    });

    const imagePromises = [] as {
      product_id: string;
      promise: Promise<any>;
    }[];

    logger.info("Starting image generation for products...");
    createdProductsData.forEach((product) => {
      const imagePrompt = product.metadata?.image_prompt as string;
      if (!imagePrompt) {
        logger.warn(`No image prompt found for product ${product.id}`);
        return;
      }
      logger.info(`Generating image for product ${product.id}`);
      imagePromises.push({
        product_id: product.id ?? "",
        promise: generateImage({
          model: openai.image("dall-e-3"),
          prompt: (product.metadata?.image_prompt as string) ?? "",
          size: "1024x1024",
          n: 1,
        }),
      });
    });

    logger.info(`Processing ${imagePromises.length} images...`);
    const images = await Promise.all(
      imagePromises.map(async ({ product_id, promise }) => {
        logger.info(`Processing image for product ${product_id}...`);
        const { image } = await promise;

        logger.info(`Creating file for product ${product_id}...`);
        const file = await fileService.createFiles([
          {
            filename: `${product_id}.png`,
            mimeType: "image/png",
            content: image.base64,
            access: "public",
          },
        ]);
        logger.info(`File created with URL: ${file[0].url}`);
        return {
          product_id,
          url: file[0].url,
        };
      })
    );
    logger.info(`Successfully processed ${images.length} images`);

    return new StepResponse({
      images,
      productIds: createdProducts.map((p) => p.id),
    });
  }
);

// Step 5: Update products with images
const updateProductsWithImagesStep = createStep(
  "update-products-with-images-step",
  async (input: { images: any[]; productIds: string[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const { images, productIds } = input;

    logger.info("Updating products with images...");
    const result = await updateProductsWorkflow(container).run({
      input: {
        products: images.map(({ product_id, url }) => ({
          id: product_id,
          images: [{ url }],
          thumbnail: url,
        })),
      },
    });

    logger.info("Products updated with images");
    logger.info(`- ${images.length} images generated and attached`);

    return new StepResponse({ result, productIds });
  }
);

// Step 6: Upsert products in vector database
const upsertProductsInVectorDBStep = createStep(
  "upsert-products-in-vector-db-step",
  async (input: { productIds: string[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const vectorService = container.resolve<IVectorService>(VECTOR_MODULE_KEY);
    const { productIds } = input;

    logger.info("Fetching product data for vector database...");
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "variants.*",
      ],
      filters: {
        id: productIds,
      },
    });

    logger.info(`Upserting ${products.length} products in vector database...`);

    for (const product of products) {
      logger.info(`Upserting product ${product.id} in vector database...`);
      await vectorService.upsert({
        id: product.id,
        data: {
          title: product.title,
          description: product.description,
          handle: product.handle,
          thumbnail: product.thumbnail,
          variants: product.variants,
        },
        metadata: {
          source: "generate-products-workflow",
        },
      });
    }

    logger.info(
      `Successfully upserted ${products.length} products in vector database`
    );
    return new StepResponse({ products });
  }
);

// Define Workflow Input Type
type GenerateProductsWorkflowInput = {
  count: string | number;
};

// Complete workflow
export const generateProductsWorkflowId = "generate-products";

export default createWorkflow(
  {
    name: generateProductsWorkflowId,
    retentionTime: 10000,
    store: true,
  },
  function (input: WorkflowData<GenerateProductsWorkflowInput>) {
    // Step 1: Fetch necessary data
    const data = fetchDataStep();

    // Step 2: Generate product data using AI
    const { products } = generateProductDataStep({
      ...data,
      count: input.count,
    });

    // Step 3: Create products in database
    const { createdProducts } = createProductsStep({ products });

    // Step 4: Generate and process images
    const { images, productIds } = generateImagesStep({ createdProducts });

    // Step 5: Update products with images
    const { result, productIds: updatedProductIds } =
      updateProductsWithImagesStep({
        images,
        productIds,
      });

    // Step 6: Upsert products in vector database
    const { products: vectorProducts } = upsertProductsInVectorDBStep({
      productIds: updatedProductIds,
    });

    return new WorkflowResponse({
      productsCreated: createdProducts.length,
      imagesGenerated: images.length,
      productsIndexed: vectorProducts.length,
    });
  }
);
