export interface Canvas {
  id: string;
  product_recommendations: {
    heading: string;
    products: Record<string, any>[];
  }[];
  lastUpdated?: number;
}
