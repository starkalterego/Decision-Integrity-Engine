import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET  /api/portfolios/[id]/objectives — list all strategic objectives for a portfolio
 * POST /api/portfolios/[id]/objectives — create a new strategic objective
 */

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: portfolioId } = await params;

        const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
        if (!portfolio) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Portfolio not found' }] },
                { status: 404 }
            );
        }

        const objectives = await prisma.strategicObjective.findMany({
            where: { portfolioId },
            include: { _count: { select: { initiatives: true } } },
            orderBy: { priority: 'asc' }
        });

        return NextResponse.json({ success: true, data: objectives, errors: [] });

    } catch (err) {
        console.error('Error fetching objectives:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to fetch objectives' }] },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: portfolioId } = await params;
        const body = await request.json();

        const { name, description, priority } = body as {
            name?: string;
            description?: string;
            priority?: number;
        };

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'VALIDATION_ERROR', message: 'Objective name is required' }] },
                { status: 400 }
            );
        }

        const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
        if (!portfolio) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Portfolio not found' }] },
                { status: 404 }
            );
        }

        const objective = await prisma.strategicObjective.create({
            data: {
                portfolioId,
                name: name.trim(),
                description: description?.trim() ?? null,
                priority: priority ?? 1,
            }
        });

        return NextResponse.json({ success: true, data: objective, errors: [] }, { status: 201 });

    } catch (err) {
        console.error('Error creating objective:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to create objective' }] },
            { status: 500 }
        );
    }
}
