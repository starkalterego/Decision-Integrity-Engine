import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRole } from './auth';

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user info to request
 */
export async function withAuth(
    request: NextRequest,
    handler: (request: NextRequest, user: { userId: string; email: string; role: string }) => Promise<NextResponse>,
    options?: {
        allowedRoles?: string[];
    }
): Promise<NextResponse> {
    // Get authenticated user
    const user = getAuthUser(request);

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required. Please log in.'
                }]
            },
            { status: 401 }
        );
    }

    // Check role if specified
    if (options?.allowedRoles && !hasRole(user, options.allowedRoles)) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this resource.'
                }]
            },
            { status: 403 }
        );
    }

    // Call the handler with authenticated user
    return handler(request, user);
}

/**
 * Helper to check if user is PMO (admin)
 */
export function isPMO(user: { role: string }): boolean {
    return user.role === 'PMO';
}

/**
 * Helper to check if user is Executive
 */
export function isExecutive(user: { role: string }): boolean {
    return user.role === 'EXECUTIVE';
}

/**
 * Helper to check if user is Portfolio Lead
 */
export function isPortfolioLead(user: { role: string }): boolean {
    return user.role === 'PORTFOLIO_LEAD';
}
