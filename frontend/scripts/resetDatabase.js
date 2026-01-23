/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

// Default admin users
const defaultUsers = [
    {
        name: 'System Administrator',
        email: 'admin@company.com',
        password: 'Admin123!',
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

async function resetDatabase() {
    console.log('🔄 Starting complete database reset...\n');

    try {
        // Step 1: Clear all data
        console.log('📦 Clearing existing data...');
        
        await prisma.governanceDecisionRecord.deleteMany({});
        await prisma.scenarioDecision.deleteMany({});
        await prisma.scenario.deleteMany({});
        await prisma.capacityDemand.deleteMany({});
        await prisma.initiative.deleteMany({});
        await prisma.portfolio.deleteMany({});
        const deletedUsers = await prisma.user.deleteMany({});
        
        console.log(`   ✅ Deleted ${deletedUsers.count} users and all related data\n`);

        // Step 2: Seed admin users
        console.log('👤 Creating admin accounts...\n');
        
        for (const userData of defaultUsers) {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    passwordHash,
                    role: userData.role,
                    isActive: userData.isActive,
                },
            });

            console.log(`   ✅ Created: ${user.email} (${user.role})`);
        }

        console.log('\n✨ Database reset completed successfully!\n');
        console.log('📝 Default accounts:');
        console.log('   - admin@company.com (PMO) - Password: Admin123!');
        console.log('   - executive@company.com (EXECUTIVE) - Password: Exec123!');
        console.log('   - portfolio@company.com (PORTFOLIO_LEAD) - Password: Portfolio123!');
        console.log('\n⚠️  Remember to change these passwords in production!\n');

    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        process.exit(1);
    }
}

resetDatabase()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
