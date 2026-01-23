import { NextRequest, NextResponse } from 'next/server';

/**
 * PUBLIC SIGNUP DISABLED
 * 
 * For security purposes, this application uses restricted access control.
 * Only pre-registered users with assigned roles can access the platform.
 * 
 * User registration must be performed by system administrators through:
 * - The admin API endpoint: POST /api/admin/users
 * - Database seeding scripts in /scripts directory
 * 
 * Allowed roles: PORTFOLIO_LEAD, EXECUTIVE, PMO
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
    return NextResponse.json({
        success: false,
        data: null,
        errors: [{
            code: 'REGISTRATION_DISABLED',
            message: 'Public registration is disabled. Please contact your system administrator to request access. Only pre-registered users with assigned roles can log in to this platform.'
        }]
    }, { status: 403 });
}
