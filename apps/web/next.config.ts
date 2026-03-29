import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

/** Fill `process.env` from repo-root `.env` only for keys not already set (Next still wins for `apps/web/.env`). */
function mergeEnvFromFileIfUnset(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.replace(/\r$/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

const thisDir = path.dirname(fileURLToPath(import.meta.url));
mergeEnvFromFileIfUnset(path.join(thisDir, "..", "..", ".env"));
mergeEnvFromFileIfUnset(path.join(thisDir, "..", "..", ".env.local"));

const nextConfig: NextConfig = {
  /** Avoid Webpack bundling a stale copy of Prisma Client (runtime must match `prisma generate`). */
  serverExternalPackages: ["@prisma/client", "prisma"],
  transpilePackages: [
    "@hiring-workflow/shared",
    "@hiring-workflow/ai-engine",
    "@hiring-workflow/workflow-engine",
  ],
};

export default nextConfig;
