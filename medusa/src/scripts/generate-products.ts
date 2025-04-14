import { openai } from "@ai-sdk/openai";
import { ExecArgs } from "@medusajs/framework/types";
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

const PRODUCT_COUNT = 10;

export default async function generateProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fileService = container.resolve(Modules.FILE);
  const vectorService = container.resolve(VECTOR_MODULE_KEY);

  logger.info("Starting product generation script...");

  logger.info("Fetching default sales channel...");
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  logger.info(`Found ${defaultSalesChannel.length} default sales channels`);

  logger.info("Fetching shipping profiles...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;
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

  logger.info("Generating product data using AI...");
  const productData = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt: `Generate ${PRODUCT_COUNT} imaginary products for a high-end vintage design furniture store. Think cool, minimalistic, mid-century modern, Scandinavian, Danish, Dutch and Belgian design. Not: antiques, retro, or baroque style. The products should be unique to each other. The products should be in the following categories: ${categoryResult.map(
      (cat) => {
        return `Category "${cat.name}" has id ${cat.id}`;
      }
    )}. Each product should have exactly one variant with appropriate material descriptions (like "Wood, Wool, Foam"), pricing in both EUR and USD currencies (between 100-5000). The variants should have a default option value. Each product should have one default option. Always set manage_inventory to false.
    These are the already existing product handles: ${existingProductHandles.join(
      ", "
    )}. The product handles you generate should be unique and not identical to each other or existing product handles.
    These are the already existing product variants: ${existingProductVariants.join(
      ", "
    )}. The product variants you generate should be unique and very different from what's already in the database.
    `,
    schemaDescription: `A list of ${PRODUCT_COUNT} product objects for a high-end vintage furniture store`,
    schema: z.object({
      products: z.array(
        z.object({
          title: z.string({
            description: "Short, concise title of the product. 3-4 words max",
          }),
          description: z.string({
            description: `A detailed description of the product. 100-200 words. Use markdown formatting. Example: 'This striking Danish mid-century modern coffee table blends refined materials with bold simplicity, making it a timeless focal point for any living space. Featuring a richly grained dark teak top and slender, black steel legs, it captures the essence of Scandinavian minimalism with an industrial edge.
The table's rectangular profile and sharp lines create a sculptural silhouette, while the warm tones of the teak add natural depth and texture. The slim, powder-coated steel legs offer a light visual footprint without compromising stability, allowing the table to float effortlessly within the room.
Perfect for modern interiors that value clean design and quality materials, this piece delivers both elegance and everyday function.
Origin: Denmark, circa 1960s
Material: Solid teak wood, black powder-coated steel
Dimensions: [Insert dimensions here]
Condition: Excellent vintage condition; restored finish, original structure intact'`,
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
              "A prompt for generating an image of the product. Detailed description of the product and scene. Be consistent between products. Example: A close-up, high-definition product photo of a vintage Danish mid-century modern coffee table. The focus is on the rich dark teak wood grain and textures of the tabletop, with sharp lines and natural light coming in from the side. The table has elegant black steel legs. The background is a white wall and wooden floor in a minimalist room with soft shadows.",
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

  logger.info("Updating products with images...");
  await updateProductsWorkflow(container).run({
    input: {
      products: images.map(({ product_id, url }) => ({
        id: product_id,
        images: [{ url }],
        thumbnail: url,
      })),
    },
  });

  logger.info("Product generation complete. Summary:");
  logger.info(`- ${products.length} products created`);
  logger.info(`- ${images.length} images generated and attached`);
}
