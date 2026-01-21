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

        // Fetch only portfolios owned by the authenticated user
        const portfolios = await prisma.portfolio.findMany({
            where: {
                userId: user.userId
            },
            include: {
                initiatives: true,
                scenarios: true
            }
        });

        return NextResponse.json({
            success: true,
            data: portfolios,
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
