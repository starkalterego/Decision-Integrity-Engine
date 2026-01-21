import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/portfolios/[id] - Get portfolio by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }]
                },
                { status: 401 }
            );
        }

        const { id } = await params;
        const portfolio = await prisma.portfolio.findUnique({
            where: { id },
            include: {
                initiatives: {
                    include: {
                        capacityDemands: true
                    }
                },
                scenarios: {
                    include: {
                        decisions: {
                            include: {
                                initiative: true
                            }
                        }
                    }
                }
            }
        });

        if (!portfolio) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Portfolio not found'
                    }]
                },
                { status: 404 }
            );
        }

        // Verify ownership
        if (portfolio.userId !== user.userId) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'FORBIDDEN',
                        message: 'You do not have access to this portfolio'
                    }]
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: portfolio,
            errors: []
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch portfolio'
                }]
            },
            { status: 500 }
        );
    }
}
