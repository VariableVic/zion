import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    vector: {
      resolve: "./src/modules/vector",
    },
    file: {
      resolve: "./src/modules/file",
      options: {
        apiKey: process.env.SUPABASE_API_KEY,
        supabaseUrl: process.env.SUPABASE_URL,
        bucketName: process.env.SUPABASE_BUCKET_NAME,
      },
    },
  },
});
