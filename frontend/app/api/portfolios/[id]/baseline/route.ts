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

        const portfolio = await prisma.portfolio.findUnique({
            where: { id: portfolioId }
        });

        if (!portfolio) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Portfolio not found' }] },
                { status: 404 }
            );
        }

        // Get all complete initiatives with their capacity demands
        const initiatives = await prisma.initiative.findMany({
            where: { portfolioId, isComplete: true },
            include: { capacityDemands: true }
        });

        // Total business value (sum of estimatedValue)
        const totalValue = initiatives.reduce((sum: number, i: any) => sum + i.estimatedValue, 0);

        // FIXED: totalCost = capexCost + opexCost (not estimatedValue)
        const totalCapex = initiatives.reduce((sum: number, i: any) => sum + (i.capexCost ?? 0), 0);
        const totalOpex  = initiatives.reduce((sum: number, i: any) => sum + (i.opexCost ?? 0), 0);
        const totalCost  = totalCapex + totalOpex;

        // Total capacity demand
        const totalCapacity = initiatives.reduce((sum: number, i: any) =>
            sum + i.capacityDemands.reduce((s: number, cd: any) => s + cd.units, 0), 0);

        const capacityUtilization = portfolio.totalCapacity > 0
            ? totalCapacity / portfolio.totalCapacity
            : 0;

        const riskExposure = initiatives.length > 0
            ? initiatives.reduce((sum: number, i: any) => sum + i.riskScore, 0) / initiatives.length
            : 0;

        // Per-role capacity breakdown (group by role name across all initiatives)
        const roleMap = new Map<string, number>();
        for (const init of initiatives) {
            for (const cd of (init as any).capacityDemands) {
                roleMap.set(cd.role, (roleMap.get(cd.role) ?? 0) + cd.units);
            }
        }
        const capacityByRole = Array.from(roleMap.entries()).map(([role, units]) => ({ role, units }));

        return NextResponse.json({
            success: true,
            data: {
                totalValue,
                totalCapex,
                totalOpex,
                totalCost,
                totalCapacity,
                capacityUtilization,
                riskExposure,
                initiativeCount: initiatives.length,
                budgetLimit: portfolio.totalBudget,
                capacityLimit: portfolio.totalCapacity,
                budgetUtilizationPct: portfolio.totalBudget > 0
                    ? (totalCost / portfolio.totalBudget) * 100
                    : 0,
                capacityByRole,
            },
            errors: []
        });

    } catch (error) {
        console.error('Error calculating baseline:', error);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to calculate baseline' }] },
            { status: 500 }
        );
    }
}
