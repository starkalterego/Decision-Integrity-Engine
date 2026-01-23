/**
 * User Management Seed Script
 * 
 * This script helps administrators create initial user accounts for the Decision Integrity Engine.
 * It can be run directly or used as a reference for backend user creation.
 * 
 * Usage:
 *   npx ts-node scripts/seedUsers.ts
 *   
 * Or use the API endpoint:
 *   POST /api/admin/users
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Default users to seed
const defaultUsers = [
    {
        name: 'System Administrator',
        email: 'admin@company.com',
        password: 'Admin123!', // Change this in production
        role: 'PMO',
        isActive: true,
    },
    {
        name: 'Executive User',
        email: 'executive@company.com',
        password: 'Exec123!',
        role: 'EXECUTIVE',
        isActive: true,
    },
    {
        name: 'Portfolio Lead',
        email: 'portfolio@company.com',
        password: 'Portfolio123!',
        role: 'PORTFOLIO_LEAD',
        isActive: true,
    },
];

async function seedUsers() {
    console.log('🌱 Starting user seed...\n');

    for (const userData of defaultUsers) {
        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);

            // Create user
            const user = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    passwordHash,
                    role: userData.role,
                    isActive: userData.isActive,
                },
            });

            console.log(`✅ Created user: ${user.email} (${user.role})`);
        } catch (error) {
            console.error(`❌ Error creating user ${userData.email}:`, error);
        }
    }

    console.log('\n✨ Seed completed!');
}

// Helper function to create a single user
export async function createUser(
    name: string,
    email: string,
    password: string,
    role: 'PORTFOLIO_LEAD' | 'EXECUTIVE' | 'PMO',
    isActive: boolean = true
) {
    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error(`User with email ${email} already exists`);
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
                isActive,
            },
        });

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Helper function to list all users
export async function listUsers(roleFilter?: string) {
    const users = await prisma.user.findMany({
        where: roleFilter ? { role: roleFilter } : undefined,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
                select: {
                    portfolios: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return users;
}

// Helper function to deactivate user
export async function deactivateUser(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isActive: false },
        });

        return {
            success: true,
            message: `User ${email} has been deactivated`,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Helper function to activate user
export async function activateUser(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isActive: true },
        });

        return {
            success: true,
            message: `User ${email} has been activated`,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seedUsers()
        .catch((error) => {
            console.error('Seed failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export default seedUsers;
