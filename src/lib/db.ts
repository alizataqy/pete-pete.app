import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  // Hanya buat adapter pg di sisi server (Node.js)
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      adapter,
      log: ["query"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  // Sisi client (fallback agar compile aman, tidak boleh dipanggil di runtime client)
  prisma = null as unknown as PrismaClient;
}

export { prisma };
