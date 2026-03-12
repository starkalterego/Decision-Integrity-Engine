import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// pgbouncer=true   — disables prepared statements (required for Supabase transaction-mode pooler)
// connection_limit — capped to avoid exhausting the pooler
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Prevent multiple instances during hot reloads in development
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
        await prisma.$disconnect()
    })
}

/**
 * Retry wrapper for transient Prisma/Supabase errors.
 * Handles:
 *   - P2024: connection pool timeout
 *   - PrismaClientInitializationError: DB temporarily unreachable
 *   - Network blips from the pgBouncer pooler
 */
const RETRYABLE_CODES = new Set(['P2024', 'P1001', 'P1008', 'P1017'])

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 300
): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (err) {
            lastError = err

            const isRetryable =
                (err instanceof Prisma.PrismaClientKnownRequestError &&
                    RETRYABLE_CODES.has(err.code)) ||
                err instanceof Prisma.PrismaClientInitializationError

            if (!isRetryable || attempt === retries) {
                throw err
            }

            // Exponential backoff: 300ms, 600ms, 1200ms
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
    }

    throw lastError
}
