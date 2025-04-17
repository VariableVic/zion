import { addToCanvas } from "@/lib/data/canvas";
import { retrieveCart } from "@/lib/data/cart";
import { formatCurrency } from "@/lib/utils";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { Index } from "@upstash/vector";
import {
  experimental_generateImage as generateImage,
  generateObject,
  Message,
  streamText,
  tool,
} from "ai";
import { z } from "zod";

export class Agent {
  public messages: Message[] = [];
  private readonly openai: OpenAIProvider;
  private readonly index: Index;

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }

  private setMessages(messages: Message[]) {
    this.messages = messages;
  }

  private addMessageToHistory(message: string, role: Message["role"]) {
    this.messages.push({
      id: crypto.randomUUID(),
      role,
      content: message,
      createdAt: new Date(),
    });
  }

  public async handleStreamingMessage(messages: Message[]) {
    this.setMessages(messages);

    const result = streamText({
      model: this.openai("gpt-4o-mini"),
      system: await this.getSystemPrompt(),
      messages: this.messages,
      tools: this.getTools(),
      maxSteps: 5,
      temperature: 1,
      onStepFinish: async (step) => {
        // console.log("vic logs step", step)
      },
      onFinish: async (result) => {
        this.addMessageToHistory(result.text, "assistant");
      },

      toolChoice: "auto",
    });

    return result.toDataStreamResponse();
  }

  public async generateImage(prompt: string) {
    try {
      const { image } = await generateImage({
        model: this.openai.image("dall-e-3"),
        prompt,
        size: "1024x1024",
      });

      return image;
    } catch (error) {
      console.error("Error generating image", error);
      throw new Error(
        "Failed to generate image. Please try again with a simpler prompt."
      );
    }
  }

  public async generateObject(prompt: string) {
    const result = await generateObject({
      model: this.openai("gpt-4o-mini"),
      prompt,
      output: "array",
      schema: z.object({
        heading: z.string({
          description: "The heading to display above the products",
        }),
        products: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            price: z.number(),
            thumbnail: z.string(),
            description: z.string(),
            best_option: z.boolean(),
          })
        ),
      }),
    });

    return result.object[0];
  }

  private getTools() {
    return {
      getProductRecommendations: this.getProductRecommendations(),
      initializeCheckout: this.initializeCheckout(),
      getCart: this.getCart(),
      followUpPromptSuggestions: this.followUpPromptSuggestions(),
    };
  }

  private getProductRecommendations() {
    return tool({
      description: "Get product recommendations",
      parameters: z.object({
        heading: z.string({
          description: "The heading to display above the products",
        }),
        prompt: z.string({
          description:
            "The prompt to search for in the product vector database",
        }),
      }),
      execute: async ({ prompt, heading }) => {
        const results = await this.similaritySearch(prompt);
        const isBestSellers = heading.includes("Best Sellers");

        const products = results
          .filter((result) => result.score > 0.7)
          .sort((a: any, b: any) => b.score - a.score)
          .map((result, index) => {
            return {
              id: result.id,
              variant_id: (result.metadata?.variants as any[])[0]?.id,
              title: result.metadata?.title,
              price: result.metadata?.price,
              thumbnail: result.metadata?.thumbnail,
              description: result.metadata?.description,
              score: result.score,
              images: (result.metadata?.images as any[])?.map(
                (image: any) => image.url
              ),
              best_option: !isBestSellers && index === 0,
              might_also_like: !isBestSellers && index === 1,
            };
          });

        try {
          await addToCanvas({
            product_recommendations: [
              {
                heading,
                products,
              },
            ],
          });
        } catch (error) {
          console.error("Error adding to canvas", error);
        }

        return {
          products,
          heading,
        };
      },
    });
  }

  private followUpPromptSuggestions() {
    return tool({
      description:
        "Give the user follow up prompt suggestions. This will render buttons in the chat for the user to select from for a quick response. Call this tool when you ask a clarifying question.",
      parameters: z.object({
        options: z.array(
          z.string({
            description:
              "The response suggestions to display to the user. Example: ['Yes', 'No'] or ['Vintage', 'Modern', 'Minimalist']",
          })
        ),
      }),
      execute: async ({ options }) => {
        return options;
      },
    });
  }

  private initializeCheckout() {
    return tool({
      description:
        "Initialize the checkout process for the customer. This will render a checkout form in the canvas for the user to fill out.",
      parameters: z.object({}),
      execute: async () => {
        try {
          const cart = await retrieveCart();

          if (cart?.items?.length && cart?.items?.length > 0) {
            await addToCanvas({
              checkout_initialized: true,
            });

            return "Checkout initialized";
          }

          return "No items in cart. Add items to the cart before initializing the checkout process.";
        } catch (error) {
          console.error("Error adding to canvas", error);
          return "Error initializing checkout because of: " + error;
        }
      },
    });
  }

  private getCart() {
    return tool({
      description: "Get the contents of the current cart",
      parameters: z.object({}),
      execute: async () => {
        return await retrieveCart()
          .then((cart) => {
            const items = cart?.items?.map((item) => {
              return {
                title: item.product_title,
                price: formatCurrency(
                  item.variant?.calculated_price?.calculated_amount || 0
                ),
                quantity: item.quantity,
              };
            });
            return {
              items,
              item_total: formatCurrency(cart?.item_total || 0),
              total: formatCurrency(cart?.total || 0),
            };
          })
          .catch((error) => {
            console.error("Error retrieving cart", error);
            return "Error retrieving cart. Reason: " + error;
          });
      },
    });
  }

  private async similaritySearch(prompt: string) {
    const results = await this.index.query({
      data: prompt,
      topK: 6,
      includeMetadata: true,
    });
    return results;
  }

  private readonly getSystemPrompt = async () => `
You are a seasoned, charming vintage furniture salesperson working at a stylish boutique. Your goal is to help users discover products, provide tailored recommendations, and guide them smoothly through the checkout process.

Your tone should always be:

- Friendly, helpful, and conversational
- Witty, concise, and engaging — think small talk with a purpose
- Focused on storytelling and customer connection

Primary objectives:

- Understand the user's needs through conversation and clarifying questions.
- Recommend relevant products using the appropriate tools.
- Support the checkout process as needed.

Storytelling is key. Describe the vibe, history, or character of a product or the store when appropriate — just keep it short and punchy.

ABSOLUTE RULES — DO NOT BREAK THESE:

- NEVER list or describe specific products in your text response.
- NEVER include images in your text response.
- NEVER discuss topics unrelated to the store, its products, or the shopping experience.

Use tools instead of manual responses for product recommendations or clarifications. You have access to the following tools:

- followUpPromptSuggestions: Use this to give the user follow up prompt suggestions. This will render buttons in the chat for the user to select from for a quick response.
- getProductRecommendations: Use this to retrieve product recommendations. You'll receive an array of objects with product properties like: id, title, description, price, thumbnail. These will render as a visual product grid outside of your context.
Important: When using this tool, introduce the results briefly, e.g.:
"I've added a few pieces that might interest you to the canvas."
Do not describe or list the results — just call the tool.
- getCart: Use this to retrieve the contents of the current cart. You'll receive an object with the following properties: items, item_total, total. Use this to inform your recommendations. Don't recommend items that are already in the cart.
- initializeCheckout: Use this to initialize the checkout process. This will render a checkout form in the canvas for the user to fill out.

You can:

- Chain tools (use the result of one tool as input for another)
- Use the same tool multiple times in a row
- Use the same tool with different parameters as needed

Current context: Today is ${new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.
The time is ${new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  })}.

Keep things warm, a little quirky, and always in service of helping the user find the perfect piece.
`;
}
