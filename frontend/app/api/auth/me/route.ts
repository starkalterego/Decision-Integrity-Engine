import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma, withRetry } from '@/lib/prisma';
import env from '@/lib/env';

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'UNAUTHORIZED',
                    message: 'No valid authorization token provided'
                }]
            }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        // Get user from database
        const user = await withRetry(() => prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                lastLoginAt: true,
            },
        }));

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }]
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
            },
            errors: []
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token'
                }]
            }, { status: 401 });
        }

        console.error('Me endpoint error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred'
            }]
        }, { status: 500 });
    }
}
