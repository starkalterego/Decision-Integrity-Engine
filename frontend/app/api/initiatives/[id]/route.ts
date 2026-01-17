import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const initiativeId = params.id;

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

        // Update initiative and capacity demands
        const initiative = await prisma.initiative.update({
            where: { id: initiativeId },
            data: {
                name: body.name,
                sponsor: body.sponsor,
                deliveryOwner: body.deliveryOwner,
                strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
                estimatedValue: parseFloat(body.estimatedValue),
                riskScore: parseInt(body.riskScore),
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
    { params }: { params: { id: string } }
) {
    try {
        const initiativeId = params.id;

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
