import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// #region agent log
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("node:path");
  const logPath = path.join(process.cwd(), "debug-3b0a20.log");
  const generatedDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
  fs.appendFileSync(
    logPath,
    `${JSON.stringify({
      sessionId: "3b0a20",
      runId: process.env.DEBUG_RUN_ID || "runtime",
      hypothesisId: "H6",
      location: "src/lib/prisma.ts:module",
      message: "Runtime prisma module loaded",
      data: {
        cwd: process.cwd(),
        node: process.version,
        hasPrismaClientExport: typeof PrismaClient === "function",
        generatedClientDirExists: fs.existsSync(generatedDir),
        npm_config_ignore_scripts: process.env.npm_config_ignore_scripts,
      },
      timestamp: Date.now(),
    })}\n`
  );
} catch {}
// #endregion agent log

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
