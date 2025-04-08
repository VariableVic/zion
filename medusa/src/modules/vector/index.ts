import { Module } from "@medusajs/framework/utils";
import VectorService from "./service";

export const VECTOR_MODULE_KEY = "vector";

export default Module(VECTOR_MODULE_KEY, {
  service: VectorService,
});
