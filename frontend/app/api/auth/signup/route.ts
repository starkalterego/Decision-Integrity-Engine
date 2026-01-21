import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'Name, email, and password are required'
                }]
            }, { status: 400 });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid email format'
                }]
            }, { status: 400 });
        }

        // Password strength validation
        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'Password must be at least 8 characters long'
                }]
            }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'USER_EXISTS',
                    message: 'A user with this email already exists'
                }]
            }, { status: 409 });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || 'PORTFOLIO_LEAD',
            },
        });

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
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred during signup'
            }]
        }, { status: 500 });
    }
}
