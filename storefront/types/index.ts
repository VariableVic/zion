import { HttpTypes } from "@medusajs/types";

export interface Canvas {
  id: string;
  product_recommendations: {
    heading: string;
    products: Record<string, any>[];
  }[];
  checkout_initialized: boolean;
  order: HttpTypes.StoreOrder;
  order_open: boolean;
  lastUpdated?: number;
}
