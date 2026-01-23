/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

async function clearDatabase() {
    console.log('🗑️  Starting database cleanup...\n');

    try {
        // Delete in reverse order of dependencies
        console.log('Deleting governance records...');
        await prisma.governanceDecisionRecord.deleteMany({});
        
        console.log('Deleting scenario decisions...');
        await prisma.scenarioDecision.deleteMany({});
        
        console.log('Deleting scenarios...');
        await prisma.scenario.deleteMany({});
        
        console.log('Deleting capacity demands...');
        await prisma.capacityDemand.deleteMany({});
        
        console.log('Deleting initiatives...');
        await prisma.initiative.deleteMany({});
        
        console.log('Deleting portfolios...');
        await prisma.portfolio.deleteMany({});
        
        console.log('Deleting users...');
        const deletedUsers = await prisma.user.deleteMany({});
        
        console.log(`\n✅ Database cleaned successfully!`);
        console.log(`   - Deleted ${deletedUsers.count} users`);
        console.log(`   - Deleted all portfolios and related data\n`);
        
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

clearDatabase()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
