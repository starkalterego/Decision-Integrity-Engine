/**
 * User Management Seed Script (CommonJS)
 * 
 * Usage: node scripts/seedUsers.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
/* eslint-enable @typescript-eslint/no-require-imports */

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
            console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
    }

    console.log('\n✨ Seed completed!');
}

seedUsers()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
