import { appendFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const SESSION_ID = "3b0a20";
const LOG_PATH = "debug-3b0a20.log";

function write(payload) {
  try {
    appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`);
  } catch {}
}

function log(hypothesisId, message, data = {}) {
  // #region agent log
  write({
    sessionId: SESSION_ID,
    runId: process.env.DEBUG_RUN_ID || "pre",
    hypothesisId,
    location: "scripts/debug-prisma-env.mjs:log",
    message,
    data,
    timestamp: Date.now(),
  });
  // #endregion agent log
}

log("H4", "Prisma debug env", {
  cwd: process.cwd(),
  node: process.version,
  platform: process.platform,
  argv0: process.argv0,
  npm_config_ignore_scripts: process.env.npm_config_ignore_scripts,
  npm_lifecycle_event: process.env.npm_lifecycle_event,
});

const nm = path.join(process.cwd(), "node_modules");
log("H5", "node_modules status", {
  nodeModulesExists: existsSync(nm),
  nodeModulesEntries: existsSync(nm) ? readdirSync(nm).slice(0, 20) : [],
});

