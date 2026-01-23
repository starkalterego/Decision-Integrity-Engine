import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }]
            }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }]
            }, { status: 401 });
        }

        // Check if user account is active
        if (!user.isActive) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'ACCOUNT_INACTIVE',
                    message: 'Your account has been deactivated. Please contact your system administrator for assistance.'
                }]
            }, { status: 403 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }]
            }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            data: {
                token,
                userId: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            errors: []
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred during login'
            }]
        }, { status: 500 });
    }
}
