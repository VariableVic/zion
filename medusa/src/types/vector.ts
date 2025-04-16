export interface IVectorService {
  upsert: (input: {
    id: string;
    data: any;
    metadata: Record<string, any>;
  }) => Promise<void>;
  delete: (input: { id: string }) => Promise<void>;
  query: (input: {
    data: string;
    topK: number;
    includeVectors?: boolean;
    includeMetadata?: boolean;
  }) => Promise<any>;
}
