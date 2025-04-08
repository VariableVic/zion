import { Index } from "@upstash/vector";
import { embed } from "ai";

let vectorIndex: Index | null = null;

/**
 * Get an instance of the vector index
 */
export function getVectorIndex(): Index {
  if (!vectorIndex) {
    // Initialize the vector index
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Upstash Vector credentials not found in environment variables"
      );
    }

    vectorIndex = new Index({
      url,
      token,
    });
  }

  return vectorIndex;
}
