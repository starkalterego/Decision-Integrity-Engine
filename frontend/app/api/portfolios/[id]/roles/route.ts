import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET  /api/portfolios/[id]/roles — list all roles + their capacity buckets for this portfolio
 * POST /api/portfolios/[id]/roles — define a new named role (global) + optionally a capacity bucket
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

        // Get capacity buckets for this portfolio, grouped with role info
        const capacityBuckets = await prisma.roleCapacity.findMany({
            where: { portfolioId },
            include: { role: true },
            orderBy: [{ role: { name: 'asc' } }, { periodLabel: 'asc' }]
        });

        // Aggregate available units per role across all periods
        const roleMap = new Map<string, {
            roleId: string;
            roleName: string;
            description: string | null;
            totalAvailable: number;
            buckets: typeof capacityBuckets;
        }>();

        for (const bucket of capacityBuckets) {
            const existing = roleMap.get(bucket.roleId);
            if (existing) {
                existing.totalAvailable += bucket.availableUnits;
                existing.buckets.push(bucket);
            } else {
                roleMap.set(bucket.roleId, {
                    roleId: bucket.roleId,
                    roleName: bucket.role.name,
                    description: bucket.role.description,
                    totalAvailable: bucket.availableUnits,
                    buckets: [bucket],
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: Array.from(roleMap.values()),
            errors: []
        });

    } catch (err) {
        console.error('Error fetching roles:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to fetch roles' }] },
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

        const { name, description, availableUnits, periodLabel } = body as {
            name?: string;
            description?: string;
            availableUnits?: number;
            periodLabel?: string;
        };

        // Validate
        const errors: string[] = [];
        if (!name?.trim()) errors.push('Role name is required');
        if (availableUnits != null && availableUnits < 0) errors.push('availableUnits must be ≥ 0');

        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'VALIDATION_ERROR', message: errors.join(', ') }] },
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

        // Upsert the global Role (unique by name)
        const role = await prisma.role.upsert({
            where: { name: name!.trim() },
            update: { description: description?.trim() ?? undefined },
            create: {
                name: name!.trim(),
                description: description?.trim() ?? null,
            }
        });

        // If capacity data provided, add a capacity bucket
        let capacityBucket = null;
        if (availableUnits != null && periodLabel) {
            capacityBucket = await prisma.roleCapacity.create({
                data: {
                    portfolioId,
                    roleId: role.id,
                    availableUnits,
                    periodLabel: periodLabel.trim(),
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: { role, capacityBucket },
            errors: []
        }, { status: 201 });

    } catch (err) {
        console.error('Error creating role:', err);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to create role' }] },
            { status: 500 }
        );
    }
}
