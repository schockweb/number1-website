import { PrismaClient } from '@prisma/client';

// Prisma v7 with Neon adapter.
// The adapter is required — without it the constructor throws at runtime.
// We handle the case where DATABASE_URL is absent at build time gracefully.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildClient(): PrismaClient {
    const url = process.env.DATABASE_URL;

    if (!url) {
        // At Vercel build time, static pages don't need DB access.
        // Return a bare client; any actual DB call will fail, but build succeeds.
        return new PrismaClient();
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const adapter = new PrismaNeon({ connectionString: url });
    // Cast needed because Prisma v7 types are strict about adapter option
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
