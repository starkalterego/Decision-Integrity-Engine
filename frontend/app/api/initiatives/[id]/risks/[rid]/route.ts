import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/initiatives/[id]/risks/[rid]  — update risk status / fields
 * DELETE /api/initiatives/[id]/risks/[rid] — delete risk
 */

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; rid: string }> }
) {
    try {
        const { id: initiativeId, rid } = await params;
        const body = await request.json();

        const existing = await prisma.initiativeRisk.findFirst({
            where: { id: rid, initiativeId }
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Risk not found' }] },
                { status: 404 }
            );
        }

        const probability = body.probability != null ? Number(body.probability) : existing.probability;
        const impact      = body.impact      != null ? Number(body.impact)      : existing.impact;
        // Recompute exposure whenever probability or impact changes
        const exposure    = probability * impact;

        const updated = await prisma.initiativeRisk.update({
            where: { id: rid },
            data: {
                description: body.description ?? existing.description,
                probability,
                impact,
                exposure,
                status: body.status ?? existing.status,
            }
        });

        return NextResponse.json({ success: true, data: updated, errors: [] });

    } catch (err) {
        console.error('Error updating risk:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to update risk' }] },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; rid: string }> }
) {
    try {
        const { id: initiativeId, rid } = await params;

        const existing = await prisma.initiativeRisk.findFirst({
            where: { id: rid, initiativeId }
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Risk not found' }] },
                { status: 404 }
            );
        }

        await prisma.initiativeRisk.delete({ where: { id: rid } });

        return NextResponse.json({ success: true, data: { id: rid }, errors: [] });

    } catch (err) {
        console.error('Error deleting risk:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to delete risk' }] },
            { status: 500 }
        );
    }
}
