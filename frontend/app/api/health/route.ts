import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns system health status including database connectivity
 * Used by monitoring tools and load balancers
 */
export async function GET() {
    const startTime = Date.now();
    
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        
        const responseTime = Date.now() - startTime;
        
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'connected',
                responseTime: `${responseTime}ms`
            },
            version: process.env.npm_package_version || '1.0.0'
        }, { status: 200 });
        
    } catch (error) {
        console.error('Health check failed:', error);
        
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'disconnected',
                error: (error as Error).message
            }
        }, { status: 503 });
    }
}
