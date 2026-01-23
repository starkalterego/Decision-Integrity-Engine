import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// POST /api/portfolios - Create a new portfolio
// Per API_CONTRACTS.md lines 70-92
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }]
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validation per BACKEND.md lines 73-84
        const { name, fiscalPeriod, totalBudget, totalCapacity } = body;

        if (!name || !fiscalPeriod || !totalBudget || !totalCapacity) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'All fields are required: name, fiscalPeriod, totalBudget, totalCapacity'
                    }]
                },
                { status: 400 }
            );
        }

        // Create portfolio for the authenticated user
        const portfolio = await prisma.portfolio.create({
            data: {
                userId: user.userId,
                name,
                fiscalPeriod,
                totalBudget: parseFloat(totalBudget),
                totalCapacity: parseInt(totalCapacity),
                status: 'DRAFT'
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                portfolioId: portfolio.id,
                status: portfolio.status
            },
            errors: []
        });

    } catch (error) {
        console.error('Error creating portfolio:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create portfolio'
                }]
            },
            { status: 500 }
        );
    }
}

// GET /api/portfolios - Get all portfolios for the authenticated user
export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }]
                },
                { status: 401 }
            );
        }

        // Fetch portfolios based on role
        // PMO and Executive can see all portfolios, others see only their own
        const where = (user.role === 'PMO' || user.role === 'EXECUTIVE') 
            ? {} 
            : { userId: user.userId };

        const portfolios = await prisma.portfolio.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        initiatives: true,
                        scenarios: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: portfolios.map(p => ({
                ...p,
                owner: p.user.name,
                ownerEmail: p.user.email,
                user: undefined // Remove user object from response
            })),
            errors: []
        });

    } catch (error) {
        console.error('Error fetching portfolios:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch portfolios'
                }]
            },
            { status: 500 }
        );
    }
}
