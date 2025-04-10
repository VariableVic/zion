import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { Index } from "@upstash/vector";
import { generateObject, Message, streamText, tool } from "ai";
import { z } from "zod";
import { experimental_generateImage as generateImage } from "ai";

export class Agent {
  public messages: Message[] = [];
  private readonly openai: OpenAIProvider;
  private readonly index: Index;

  constructor() {
    this.addMessageToHistory(this.getSystemPrompt(), "system");
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
      system: this.getSystemPrompt(),
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

  private async generateProductRecommendationsObject(prompt: string) {
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
      getUserClarification: this.getUserClarification(),
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
        // const productRecommendations = results.map((result) => result.metadata);
        // const generatedPrompt = `Sort the following products based on the user's prompt: ${prompt}, starting with the most relevant product.
        // Mark the most relevant product as "best_option: true".
        // Remove items that don't match the user's prompt at all.
        // Products: ${JSON.stringify(productRecommendations)}`;
        // const result = await this.generateProductRecommendationsObject(
        //   generatedPrompt
        // );
        console.log("vic logs results", results);
        const isBestSellers = heading.includes("Best Sellers");

        const products = results
          .filter((result) => result.score > 0.7)
          .sort((a: any, b: any) => b.score - a.score)
          .map((result, index) => {
            return {
              id: result.id,
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

        return {
          products,
          heading,
        };
      },
    });
  }

  private getUserClarification() {
    return tool({
      description:
        "Call this when you need to ask the user for clarification. This tool will render follow up option buttons based on your response. The goal is to give the user quick and easy options to choose from.",
      parameters: z.object({
        buttons: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        ),
      }),
      execute: async ({ buttons }) => {
        return buttons;
      },
    });
  }

  private async similaritySearch(prompt: string) {
    const results = await this.index.query({
      data: prompt,
      topK: 3,
      includeMetadata: true,
    });
    return results;
  }

  private readonly getSystemPrompt = () => `
You are a seasoned, charming vintage furniture and clothing salesperson working at a stylish boutique. Your goal is to help users discover products, provide tailored recommendations, and guide them smoothly through the checkout process.

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

- getProductRecommendations: Use this to retrieve product recommendations. You'll receive an array of objects with product properties like: id, title, description, price, thumbnail. These will render as a visual product grid outside of your context.
Important: When using this tool, introduce the results briefly, e.g.:
"I've added a few pieces that might interest you to the canvas."
Do not describe or list the results — just call the tool.

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
