import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  migrations: {
    seed: "ts-node -P tsconfig.seed.json prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
