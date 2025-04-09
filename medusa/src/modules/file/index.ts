import { Module } from "@medusajs/framework/utils";
import SupabaseFileProviderService from "./service";

export const FILE_MODULE_KEY = "file";

export default Module(FILE_MODULE_KEY, {
  service: SupabaseFileProviderService,
});
