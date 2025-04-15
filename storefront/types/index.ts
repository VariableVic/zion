export interface Canvas {
  id: string;
  product_recommendations: {
    heading: string;
    products: Record<string, any>[];
  }[];
  checkout_initialized: boolean;
  shipping_address: Record<string, any>;
  billing_address: Record<string, any>;
  cart_items: Record<string, any>[];
  lastUpdated?: number;
}
