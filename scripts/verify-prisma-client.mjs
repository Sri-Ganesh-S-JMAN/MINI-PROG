import { createRequire } from "node:module";
import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";
import http from "node:http";

const ENDPOINT =
  "http://127.0.0.1:7417/ingest/448d9a4b-cc7b-43ca-9b84-0ed46dfa812e";
const SESSION_ID = "3b0a20";

function postJson(url, headers, body) {
  const u = new URL(url);
  return new Promise((resolve) => {
    const req = http.request(
      {
        method: "POST",
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        res.resume();
        res.on("end", resolve);
      }
    );
    req.on("error", resolve);
    req.write(body);
    req.end();
  });
}

function log(hypothesisId, message, data = {}) {
  // #region agent log
  const payload = {
    sessionId: SESSION_ID,
    runId: process.env.DEBUG_RUN_ID || "install",
    hypothesisId,
    location: "scripts/verify-prisma-client.mjs:log",
    message,
    data,
    timestamp: Date.now(),
  };
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID };
  try {
    appendFileSync("debug-3b0a20.log", `${body}\n`);
  } catch {}
  if (typeof globalThis.fetch === "function") {
    fetch(ENDPOINT, { method: "POST", headers, body }).catch(() => {});
  } else {
    postJson(ENDPOINT, headers, body).catch(() => {});
  }
  // #endregion agent log
}

const require = createRequire(import.meta.url);

try {
  const prismaClientPkg = require.resolve("@prisma/client/package.json");
  const prismaClientDir = path.dirname(prismaClientPkg);
  const nodeModulesDir = path.dirname(path.dirname(prismaClientDir));
  const generatedClientDir = path.join(nodeModulesDir, ".prisma", "client");

  log("H1", "Resolved @prisma/client", {
    prismaClientPkg,
    prismaClientDir,
    nodeModulesDir,
    generatedClientDirExists: existsSync(generatedClientDir),
  });

  const exportsOk = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("@prisma/client");
      return {
        hasPrismaClient: typeof mod?.PrismaClient === "function",
        keys: Object.keys(mod || {}).slice(0, 25),
      };
    } catch (e) {
      return { requireError: String(e?.message || e) };
    }
  })();

  log("H2", "Loaded @prisma/client module", exportsOk);
} catch (e) {
  log("H3", "Failed resolving/loading @prisma/client", {
    error: String(e?.message || e),
  });
  process.exitCode = 1;
}

