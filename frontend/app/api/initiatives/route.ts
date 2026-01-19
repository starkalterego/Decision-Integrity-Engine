import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePriorityScore } from '@/lib/priority';

// Validation helper per BACKEND.md lines 73-84
function validateInitiativeCompleteness(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Initiative name is required');
    if (!data.sponsor?.trim()) errors.push('Sponsor is required');
    if (!data.deliveryOwner?.trim()) errors.push('Delivery owner is required');
    if (!data.strategicAlignmentScore || data.strategicAlignmentScore < 1 || data.strategicAlignmentScore > 5) {
        errors.push('Strategic alignment score must be between 1 and 5');
    }
    if (!data.estimatedValue || data.estimatedValue <= 0) {
        errors.push('Estimated value must be greater than 0');
    }
    if (!data.riskScore || data.riskScore < 1 || data.riskScore > 5) {
        errors.push('Risk score must be between 1 and 5');
    }
    if (!data.capacityDemand || data.capacityDemand.length === 0) {
        errors.push('At least one capacity demand is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// POST /api/initiatives - Create new initiative
// Per API_CONTRACTS.md lines 106-132
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate completeness
        const validation = validateInitiativeCompleteness(body);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'INITIATIVE_INCOMPLETE',
                        message: validation.errors.join(', ')
                    }]
                },
                { status: 400 }
            );
        }

        // Calculate priority score per BACKEND.md lines 100-117
        const priorityScore = calculatePriorityScore({
            estimatedValue: parseFloat(body.estimatedValue),
            strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
            riskScore: parseInt(body.riskScore),
            capacityDemands: body.capacityDemand
        });

        // Create initiative with capacity demands
        const initiative = await prisma.initiative.create({
            data: {
                portfolioId: body.portfolioId,
                name: body.name,
                sponsor: body.sponsor,
                deliveryOwner: body.deliveryOwner,
                strategicAlignmentScore: parseInt(body.strategicAlignmentScore),
                estimatedValue: parseFloat(body.estimatedValue),
                riskScore: parseInt(body.riskScore),
                isComplete: true,
                priorityScore: priorityScore,
                capacityDemands: {
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
        console.error('Error creating initiative:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create initiative'
                }]
            },
            { status: 500 }
        );
    }
}

// GET /api/initiatives?portfolioId=xxx - Get all initiatives
// Per API_CONTRACTS.md lines 134-138
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const portfolioId = searchParams.get('portfolioId');

        if (!portfolioId) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'portfolioId query parameter is required'
                    }]
                },
                { status: 400 }
            );
        }

        const initiatives = await prisma.initiative.findMany({
            where: { portfolioId },
            include: {
                capacityDemands: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: initiatives,
            errors: []
        });

    } catch (error) {
        console.error('Error fetching initiatives:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch initiatives'
                }]
            },
            { status: 500 }
        );
    }
}
