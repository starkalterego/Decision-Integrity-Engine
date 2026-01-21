import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Clear auth token on client side
        // Server-side session handling can be added here if needed
        
        return NextResponse.json({
            success: true,
            data: {
                message: 'Logged out successfully'
            },
            errors: []
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred during logout'
            }]
        }, { status: 500 });
    }
}
