import { generateObject, tool } from "ai";
import { Worker } from "../core/worker";
import { z } from "zod";
import { QueryResult } from "@upstash/vector";

export class ProductWorker extends Worker {
  constructor() {
    super();
  }

  getTools() {
    return {
      getProductRecommendations: this.getProductRecommendations(),
    };
  }

  getProductRecommendations() {
    return tool({
      description: "Get product recommendations",
      parameters: z.object({
        prompt: z.string(),
      }),
      execute: async ({ prompt }) => {
        const results = await this.similaritySearch(prompt);
        const productRecommendations = results.map((result) => result.metadata);
        return productRecommendations;
      },
    });
  }

  systemPrompt() {
    return "You are a product recommendation assistant. You are given a user query and you need to recommend products to the user.";
  }
}
