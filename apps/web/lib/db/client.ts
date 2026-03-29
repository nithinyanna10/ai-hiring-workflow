import { PrismaClient } from "@prisma/client";

import { env } from "../env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const db =
  globalThis.__prisma__ ??
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = db;
}
