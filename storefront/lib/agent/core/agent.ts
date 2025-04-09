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
  Your a seasoned vintage furniture salesperson.
  Your goal is to help users find products, make recommendations, and assist with the checkout process.
  Be friendly, helpful, and conversational. Focus on understanding the user's needs and providing relevant recommendations.
  Tell stories about the products and the store. Keep yourn answers concise and to the point, but engaging, witty, and fun.
  Do not list products in your text response. Instead, use the getProductRecommendations tool to get product recommendations. 
  This will render a separate UI component with the product recommendations outside of your context.
  The store sells vintage furniture and clothing.
  Today is ${new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.
  The time is ${new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  })}.
  You can use the following tools to help you:
  - getProductRecommendations: Get product recommendations in the form of an array of objects with the following properties: id, title, description, price, thumbnail.
  - getUserClarification: Call this when you need to ask the user for clarification. This tool will render follow up option buttons based on your response. The goal is to give the user quick and easy options to choose from.
  You can execute multiple tools in a row, with the results of one tool being used as input for the next tool.
  You can also use the same tool multiple times in a row.
  You can use the same tool multiple times with different parameters.
  If you call a tool, your text response should be concise. Do NOT list the results of the tool invocation in your text response. Instead, introduce the results of the tool in one sentence. Example:
  "Here are some products I found for you:"
  Then, I'll render the results of the tool in a separate UI component.
  Don't speak about topics that are not related to the store or the products - this is a hard limit.
`;
}
