import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ 
                code: 'AUTH_REQUIRED',
                message: 'Authentication required' 
            }, { status: 401 });
        }

        // Only PMO and Executive can view governance records
        if (authUser.role !== 'PMO' && authUser.role !== 'EXECUTIVE') {
            return NextResponse.json({
                code: 'FORBIDDEN',
                message: 'Only PMO and Executive roles can view governance records'
            }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const portfolioId = searchParams.get('portfolioId');

        // Build query
        const where = portfolioId ? { portfolioId } : {};

        // Fetch governance records
        const records = await prisma.governanceDecisionRecord.findMany({
            where,
            include: {
                portfolio: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return NextResponse.json({
            success: true,
            data: {
                records: records.map(record => ({
                    id: record.id,
                    portfolioId: record.portfolioId,
                    portfolioName: record.portfolio.name,
                    actionType: record.actionType,
                    entityId: record.entityId,
                    entityType: record.entityType,
                    rationale: record.rationale,
                    userId: record.userId,
                    metadata: record.metadata ? JSON.parse(record.metadata) : null,
                    createdAt: record.createdAt.toISOString()
                })),
                total: records.length
            }
        });
    } catch (error) {
        console.error('Error fetching governance records:', error);
        return NextResponse.json({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch governance records'
        }, { status: 500 });
    }
}
