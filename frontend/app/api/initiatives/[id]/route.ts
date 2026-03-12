import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePriorityScore } from '@/lib/priority';
import { validateInitiativeCompleteness } from '@/lib/governance';

// GET /api/initiatives/[id] - Get initiative by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const initiative = await prisma.initiative.findUnique({
            where: { id },
            include: {
                capacityDemands: true,
                portfolio: true
            }
        });

        if (!initiative) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Initiative not found'
                    }]
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: initiative,
            errors: []
        });

    } catch (error) {
        console.error('Error fetching initiative:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch initiative'
                }]
            },
            { status: 500 }
        );
    }
}

// PUT /api/initiatives/[id] - Update initiative
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;
        const initiativeId = id;

        // Check if initiative exists
        const existing = await prisma.initiative.findUnique({
            where: { id: initiativeId }
        });

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Initiative not found'
                    }]
                },
                { status: 404 }
            );
        }

        // Validate completeness using governance engine
        const validation = validateInitiativeCompleteness({
            name: body.name,
            sponsor: body.sponsor,
            deliveryOwner: body.deliveryOwner,
            strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
            estimatedValue: parseFloat(body.estimatedValue),
            riskScore: parseInt(body.riskScore),
            costOfDelay: parseFloat(body.costOfDelay ?? 0),
            capacityDemands: body.capacityDemand,
        });
        if (!validation.isComplete) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{ code: 'INITIATIVE_INCOMPLETE', message: validation.errors.join(', ') }]
                },
                { status: 400 }
            );
        }

        // Calculate priority score
        const priorityScore = calculatePriorityScore({
            estimatedValue: parseFloat(body.estimatedValue),
            strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
            strategyScore: parseFloat(body.strategyScore ?? 0),
            costOfDelay: parseFloat(body.costOfDelay ?? 0),
            riskScore: parseInt(body.riskScore),
            capacityDemands: body.capacityDemand
        });

        // Update initiative and capacity demands
        const initiative = await prisma.initiative.update({
            where: { id: initiativeId },
            data: {
                name: body.name,
                description: body.description ?? null,
                sponsor: body.sponsor,
                deliveryOwner: body.deliveryOwner,
                strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
                strategyScore: parseFloat(body.strategyScore ?? 0),
                estimatedValue: parseFloat(body.estimatedValue),
                capexCost: parseFloat(body.capexCost ?? 0),
                opexCost: parseFloat(body.opexCost ?? 0),
                costOfDelay: parseFloat(body.costOfDelay ?? 0),
                riskScore: parseInt(body.riskScore),
                lifecycleState: body.lifecycleState ?? existing.lifecycleState,
                isComplete: true,
                priorityScore: priorityScore,
                capacityDemands: {
                    deleteMany: {},
                    create: body.capacityDemand.map((cd: any) => ({
                        role: cd.role,
                        units: parseInt(cd.units)
                    }))
                }
            },
            include: {
                capacityDemands: true
            }
        });

        return NextResponse.json({
            success: true,
            data: initiative,
            errors: []
        });

    } catch (error) {
        console.error('Error updating initiative:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update initiative'
                }]
            },
            { status: 500 }
        );
    }
}

// DELETE /api/initiatives/[id] - Delete initiative
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const initiativeId = id;

        // Check if initiative exists
        const existing = await prisma.initiative.findUnique({
            where: { id: initiativeId }
        });

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Initiative not found'
                    }]
                },
                { status: 404 }
            );
        }

        // Delete initiative (cascade will delete capacity demands)
        await prisma.initiative.delete({
            where: { id: initiativeId }
        });

        return NextResponse.json({
            success: true,
            data: { id: initiativeId },
            errors: []
        });

    } catch (error) {
        console.error('Error deleting initiative:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete initiative'
                }]
            },
            { status: 500 }
        );
    }
}
