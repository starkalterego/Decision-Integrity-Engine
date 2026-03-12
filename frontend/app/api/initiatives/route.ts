import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePriorityScore } from '@/lib/priority';
import { validateInitiativeCompleteness } from '@/lib/governance';

// POST /api/initiatives - Create new initiative
// Per API_CONTRACTS.md lines 106-132
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

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
                    errors: [{
                        code: 'INITIATIVE_INCOMPLETE',
                        message: validation.errors.join(', ')
                    }]
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

        // Create initiative with capacity demands
        const initiative = await prisma.initiative.create({
            data: {
                portfolioId: body.portfolioId,
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
                lifecycleState: body.lifecycleState ?? 'IDEA',
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
