import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/initiatives/[id]/risks
 * POST /api/initiatives/[id]/risks
 */

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: initiativeId } = await params;

        const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId } });
        if (!initiative) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Initiative not found' }] },
                { status: 404 }
            );
        }

        const risks = await prisma.initiativeRisk.findMany({
            where: { initiativeId },
            orderBy: { exposure: 'desc' }
        });

        return NextResponse.json({ success: true, data: risks, errors: [] });

    } catch (err) {
        console.error('Error fetching risks:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to fetch risks' }] },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: initiativeId } = await params;
        const body = await request.json();

        const { description, probability, impact, status } = body as {
            description?: string;
            probability?: number;
            impact?: number;
            status?: string;
        };

        // Validate required fields
        const errors: string[] = [];
        if (!description?.trim()) errors.push('description is required');
        if (probability == null || probability < 0 || probability > 1)
            errors.push('probability must be between 0.0 and 1.0');
        if (impact == null || impact < 0 || impact > 1)
            errors.push('impact must be between 0.0 and 1.0');

        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'VALIDATION_ERROR', message: errors.join(', ') }] },
                { status: 400 }
            );
        }

        const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId } });
        if (!initiative) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Initiative not found' }] },
                { status: 404 }
            );
        }

        // Auto-compute exposure = probability × impact
        const exposure = (probability as number) * (impact as number);

        const risk = await prisma.initiativeRisk.create({
            data: {
                initiativeId,
                description: description as string,
                probability: probability as number,
                impact: impact as number,
                exposure,
                status: status ?? 'OPEN',
            }
        });

        return NextResponse.json({ success: true, data: risk, errors: [] }, { status: 201 });

    } catch (err) {
        console.error('Error creating risk:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to create risk' }] },
            { status: 500 }
        );
    }
}
