import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    GovernanceViolation,
    validateLifecycleTransition,
    validateExecutionApproval,
} from '@/lib/governance';

/**
 * POST /api/initiatives/[id]/lifecycle
 * Body: { targetState: string, rationale?: string }
 *
 * Advances initiative lifecycle state through the governed state machine.
 * Transition to EXECUTION triggers the execution approval gate.
 * Every transition writes an immutable audit record.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: initiativeId } = await params;
        const body = await request.json();
        const { targetState, rationale } = body as { targetState?: string; rationale?: string };

        if (!targetState) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'VALIDATION_ERROR', message: 'targetState is required' }] },
                { status: 400 }
            );
        }

        // Load current initiative
        const initiative = await prisma.initiative.findUnique({
            where: { id: initiativeId },
            include: { portfolio: true }
        });

        if (!initiative) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Initiative not found' }] },
                { status: 404 }
            );
        }

        // 1. Validate state machine transition
        validateLifecycleTransition(initiative.lifecycleState, targetState);

        // 2. Execution approval gate — extra checks for PLANNED → EXECUTION
        if (targetState === 'EXECUTION') {
            await validateExecutionApproval(initiativeId, prisma);
        }

        // 3. Apply the transition in a transaction + write audit record atomically
        const updatedInitiative = await prisma.$transaction(async (tx) => {
            const updated = await tx.initiative.update({
                where: { id: initiativeId },
                data: { lifecycleState: targetState },
                include: { capacityDemands: true }
            });

            await tx.governanceDecisionRecord.create({
                data: {
                    portfolioId: initiative.portfolioId,
                    actionType: 'LIFECYCLE_TRANSITION',
                    entityId: initiativeId,
                    entityType: 'INITIATIVE',
                    rationale: rationale ?? null,
                    metadata: JSON.stringify({
                        from: initiative.lifecycleState,
                        to: targetState,
                        initiativeName: initiative.name,
                    }),
                }
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            data: updatedInitiative,
            errors: []
        });

    } catch (err) {
        if (err instanceof GovernanceViolation) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: err.code, message: err.message }] },
                { status: 422 }
            );
        }
        console.error('Error transitioning lifecycle state:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to transition lifecycle state' }] },
            { status: 500 }
        );
    }
}

/**
 * GET /api/initiatives/[id]/lifecycle
 * Returns current state and the set of allowed next transitions.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: initiativeId } = await params;

        const initiative = await prisma.initiative.findUnique({
            where: { id: initiativeId },
            select: { id: true, name: true, lifecycleState: true }
        });

        if (!initiative) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Initiative not found' }] },
                { status: 404 }
            );
        }

        const ALLOWED: Record<string, string[]> = {
            IDEA:             ['CONCEPT_APPROVED', 'TERMINATED'],
            CONCEPT_APPROVED: ['PLANNED', 'TERMINATED'],
            PLANNED:          ['EXECUTION', 'TERMINATED'],
            EXECUTION:        ['CLOSED', 'TERMINATED'],
            CLOSED:           [],
            TERMINATED:       [],
        };

        return NextResponse.json({
            success: true,
            data: {
                currentState: initiative.lifecycleState,
                allowedTransitions: ALLOWED[initiative.lifecycleState] ?? [],
            },
            errors: []
        });

    } catch (err) {
        console.error('Error fetching lifecycle state:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to fetch lifecycle state' }] },
            { status: 500 }
        );
    }
}
