import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getAuthUser, hasRole } from '@/lib/auth';

/**
 * ADMIN-ONLY USER REGISTRATION API
 * 
 * This endpoint allows administrators to create new user accounts with specific roles.
 * For security, this requires admin-level authentication (PMO or EXECUTIVE role).
 * 
 * POST /api/admin/users
 * Body: { name, email, password, role, isActive }
 * 
 * GET /api/admin/users
 * Query: ?role=PORTFOLIO_LEAD (optional filter)
 * Returns: List of all users (admin only)
 */

// Create new user (Admin only)
export async function POST(request: NextRequest) {
    try {
        // Authenticate admin user
        const adminUser = getAuthUser(request);
        
        // Only PMO and EXECUTIVE roles can create users
        if (!hasRole(adminUser, ['PMO', 'EXECUTIVE'])) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'FORBIDDEN',
                    message: 'Only PMO and Executive roles can create new users'
                }]
            }, { status: 403 });
        }

        const { name, email, password, role, isActive } = await request.json();

        // Validation
        if (!name || !email || !password || !role) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'Name, email, password, and role are required'
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

        // Validate role
        const allowedRoles = ['PORTFOLIO_LEAD', 'EXECUTIVE', 'PMO'];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: `Role must be one of: ${allowedRoles.join(', ')}`
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
                role,
                isActive: isActive !== undefined ? isActive : true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                user,
                message: `User account created successfully. Role: ${role}, Status: ${user.isActive ? 'Active' : 'Inactive'}`
            },
            errors: []
        }, { status: 201 });

    } catch (error) {
        console.error('User creation error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred while creating the user'
            }]
        }, { status: 500 });
    }
}

// List all users (Admin only)
export async function GET(request: NextRequest) {
    try {
        // Authenticate admin user
        const adminUser = getAuthUser(request);
        
        // Only PMO and EXECUTIVE roles can view user list
        if (!hasRole(adminUser, ['PMO', 'EXECUTIVE'])) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'FORBIDDEN',
                    message: 'Only PMO and Executive roles can view user list'
                }]
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const roleFilter = searchParams.get('role');

        const users = await prisma.user.findMany({
            where: roleFilter ? { role: roleFilter } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                _count: {
                    select: {
                        portfolios: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                users,
                total: users.length,
            },
            errors: []
        });

    } catch (error) {
        console.error('User list error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching users'
            }]
        }, { status: 500 });
    }
}

// Update user status (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        // Authenticate admin user
        const adminUser = getAuthUser(request);
        
        // Only PMO and EXECUTIVE roles can update users
        if (!hasRole(adminUser, ['PMO', 'EXECUTIVE'])) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'FORBIDDEN',
                    message: 'Only PMO and Executive roles can update users'
                }]
            }, { status: 403 });
        }

        const { userId, isActive, role } = await request.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                data: null,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: 'User ID is required'
                }]
            }, { status: 400 });
        }

        // Build update data
        const updateData: { isActive?: boolean; role?: string } = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (role) {
            const allowedRoles = ['PORTFOLIO_LEAD', 'EXECUTIVE', 'PMO'];
            if (!allowedRoles.includes(role)) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: `Role must be one of: ${allowedRoles.join(', ')}`
                    }]
                }, { status: 400 });
            }
            updateData.role = role;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                user: updatedUser,
                message: 'User updated successfully'
            },
            errors: []
        });

    } catch (error) {
        console.error('User update error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            errors: [{
                code: 'SERVER_ERROR',
                message: 'An error occurred while updating the user'
            }]
        }, { status: 500 });
    }
}
