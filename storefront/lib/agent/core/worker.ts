import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { Index } from "@upstash/vector";
import { embed, generateObject, generateText, Message, ToolSet } from "ai";
import { z } from "zod";

export abstract class Worker {
  private readonly messages: Message[] = [];
  readonly openai: OpenAIProvider;
  readonly index: Index;

  constructor() {
    this.addMessageToHistory(this.systemPrompt(), "system");
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }

  abstract systemPrompt(): string;

  private addMessageToHistory(message: string, role: Message["role"]) {
    this.messages.push({
      id: crypto.randomUUID(),
      role,
      content: message,
      createdAt: new Date(),
    });
  }

  async handleTextMessage(message: string) {
    this.addMessageToHistory(message, "user");

    const response = await generateText({
      model: this.openai("gpt-4o-mini"),
      system: this.systemPrompt(),
      messages: this.messages,
      tools: this.getTools(),
      maxSteps: 5,
      temperature: 0,
    });

    try {
      this.addMessageToHistory(response.text, "assistant");
      return response.text;
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async handleObjectMessage(message: string) {
    this.addMessageToHistory(message, "user");

    const response = await generateObject({
      model: this.openai("gpt-4o-mini"),
      system: this.systemPrompt(),
      messages: this.messages,
      schema: z.object({
        products: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            best_option: z.boolean(),
          })
        ),
      }),
    });
  }

  async similaritySearch(prompt: string) {
    const results = await this.index.query({
      data: prompt,
      topK: 5,
      includeMetadata: true,
      includeVectors: true,
    });
    return results;
  }

  async createEmbedding(prompt: string) {
    const embedding = await embed({
      model: this.openai.embedding("text-embedding-3-small"),
      value: prompt,
    });
    return embedding;
  }

  abstract getTools(): ToolSet;
}
