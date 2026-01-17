import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/portfolios/[id]/baseline - Get baseline metrics
// Per API_CONTRACTS.md lines 142-160
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: portfolioId } = await params;

        // Get all complete initiatives for this portfolio
        const initiatives = await prisma.initiative.findMany({
            where: {
                portfolioId,
                isComplete: true
            },
            include: {
                capacityDemands: true
            }
        });

        // Calculate baseline metrics (assuming all initiatives are funded)
        const totalValue = initiatives.reduce((sum: number, init: any) => sum + init.estimatedValue, 0);

        const totalCost = initiatives.reduce((sum: number, init: any) => sum + init.estimatedValue, 0); // MVP: cost = value

        const totalCapacity = initiatives.reduce((sum: number, init: any) => {
            return sum + init.capacityDemands.reduce((s: number, cd: any) => s + cd.units, 0);
        }, 0);

        const portfolio = await prisma.portfolio.findUnique({
            where: { id: portfolioId }
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

        const capacityUtilization = totalCapacity / portfolio.totalCapacity;

        const riskExposure = initiatives.length > 0
            ? initiatives.reduce((sum: number, init: any) => sum + init.riskScore, 0) / initiatives.length
            : 0;

        const baseline = {
            totalValue,
            totalCost,
            capacityUtilization,
            riskExposure,
            initiativeCount: initiatives.length
        };

        return NextResponse.json({
            success: true,
            data: baseline,
            errors: []
        });

    } catch (error) {
        console.error('Error calculating baseline:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to calculate baseline'
                }]
            },
            { status: 500 }
        );
    }
}
