import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

/**
 * POST /api/portfolios/[id]/approve
 * Executive approval - locks portfolio and logs governance decision
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const resolvedParams = await params;
      const portfolioId = resolvedParams.id;

      // Only EXECUTIVE and PMO can approve
      if (user.role !== 'EXECUTIVE' && user.role !== 'PMO') {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Only executives can approve portfolios' }] },
          { status: 403 }
        );
      }

      // Get portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          scenarios: {
            where: { isRecommended: true, isFinalized: true },
            take: 1
          }
        }
      });

      if (!portfolio) {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Portfolio not found' }] },
          { status: 404 }
        );
      }

      if (portfolio.status === 'LOCKED') {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Portfolio is already approved and locked' }] },
          { status: 400 }
        );
      }

      // Verify there's a recommended scenario
      if (portfolio.scenarios.length === 0) {
        return NextResponse.json(
          { success: false, errors: [{ message: 'No recommended scenario available for approval' }] },
          { status: 400 }
        );
      }

      // Update portfolio status to LOCKED
      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { status: 'LOCKED' }
      });

      // Log governance decision
      await prisma.governanceDecisionRecord.create({
        data: {
          portfolioId,
          actionType: 'APPROVED',
          entityId: portfolioId,
          entityType: 'PORTFOLIO',
          userId: user.userId,
          rationale: 'Portfolio decision approved by executive authority'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          portfolio: updatedPortfolio,
          message: 'Portfolio approved and locked successfully'
        }
      });
    } catch (error) {
      console.error('Error approving portfolio:', error);
      return NextResponse.json(
        { success: false, errors: [{ message: 'Failed to approve portfolio' }] },
        { status: 500 }
      );
    }
  });
}
