import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { Index } from "@upstash/vector";
import { Message, streamText, tool } from "ai";
import { z } from "zod";

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
        console.log(step);
      },
      onFinish: async (result) => {
        this.addMessageToHistory(result.text, "assistant");
      },
    });

    return result.toDataStreamResponse();
  }

  private getTools() {
    return {
      getProductRecommendations: this.getProductRecommendations(),
    };
  }

  getProductRecommendations() {
    return tool({
      description: "Get product recommendations",
      parameters: z.object({
        prompt: z.string({
          description:
            "The prompt to search for in the product vector database",
        }),
      }),
      execute: async ({ prompt }) => {
        const results = await this.similaritySearch(prompt);
        const productRecommendations = results.map((result) => result.metadata);
        console.log("productRecommendations", productRecommendations);
        return productRecommendations;
      },
    });
  }

  private async similaritySearch(prompt: string) {
    const results = await this.index.query({
      data: prompt,
      topK: 5,
      includeMetadata: true,
      includeVectors: true,
    });
    return results;
  }

  private readonly getSystemPrompt = () => `
  You are an AI shopping assistant for an e-commerce store. 
  Your goal is to help users find products, make recommendations, and assist with the checkout process.
  When helping with shipping information, include the [SHIPPING_FORM] tag in your response.
  When helping with payment information, include the [PAYMENT_FORM] tag in your response.
  Be friendly, helpful, and conversational. Focus on understanding the user's needs and providing relevant recommendations.
  The store sells clothing.
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
  You can execute multiple tools in a row, with the results of one tool being used as input for the next tool.
  You can also use the same tool multiple times in a row.
  You can use the same tool multiple times with different parameters.
  You have a limit of 5 steps that can be executed in a row.
`;
}
