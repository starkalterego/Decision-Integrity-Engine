import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

/**
 * POST /api/portfolios/[id]/revision
 * Request revision - logs governance decision and notifies portfolio owner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const resolvedParams = await params;
      const portfolioId = resolvedParams.id;
      const body = await req.json();
      const { comments } = body;

      // Only EXECUTIVE and PMO can request revisions
      if (user.role !== 'EXECUTIVE' && user.role !== 'PMO') {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Only executives can request revisions' }] },
          { status: 403 }
        );
      }

      // Verify portfolio exists
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId }
      });

      if (!portfolio) {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Portfolio not found' }] },
          { status: 404 }
        );
      }

      if (portfolio.status === 'LOCKED') {
        return NextResponse.json(
          { success: false, errors: [{ message: 'Cannot request revision on locked portfolio' }] },
          { status: 400 }
        );
      }

      // Log governance decision
      await prisma.governanceDecisionRecord.create({
        data: {
          portfolioId,
          actionType: 'REVISION_REQUESTED',
          entityId: portfolioId,
          entityType: 'PORTFOLIO',
          userId: user.userId,
          rationale: comments || 'Executive requested revision'
        }
      });

      // In a production system, this would also:
      // 1. Send notification to portfolio owner
      // 2. Update portfolio status to indicate pending revision
      // 3. Create a task/workflow item for the owner

      return NextResponse.json({
        success: true,
        data: {
          message: 'Revision request logged successfully',
          portfolioId
        }
      });
    } catch (error) {
      console.error('Error requesting revision:', error);
      return NextResponse.json(
        { success: false, errors: [{ message: 'Failed to request revision' }] },
        { status: 500 }
      );
    }
  });
}
