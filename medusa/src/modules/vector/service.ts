import { Index } from "@upstash/vector";

class VectorService {
  private index: Index;

  constructor() {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }

  async upsert(input: {
    id: string;
    data: any;
    metadata: Record<string, any>;
  }) {
    await this.index.upsert(input);
  }

  async delete(input: { id: string }) {
    await this.index.delete(input.id);
  }

  async query(input: {
    data: string;
    topK: number;
    includeVectors?: boolean;
    includeMetadata?: boolean;
  }) {
    return await this.index.query(input);
  }
}

export default VectorService;
