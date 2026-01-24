import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=["']?([^"']+)["']?$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function createAdminUsers() {
  console.log('🔑 Creating admin accounts...\n');

  const admins = [
    {
      name: 'Swaraj Kumar',
      email: 'swaraj.kumar00@gmail.com',
      password: 'Swaraj@admin',
      role: 'PMO'
    },
    {
      name: 'Sarthak Satyam',
      email: 'sarthak.satyam13@gmail.com',
      password: 'Honey@admin',
      role: 'PMO'
    }
  ];

  for (const admin of admins) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email }
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${admin.email}`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(admin.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          passwordHash: passwordHash,
          role: admin.role,
          isActive: true
        }
      });

      console.log(`✅ Created admin: ${admin.email} (${admin.role})`);
    } catch (error) {
      console.error(`❌ Error creating ${admin.email}:`, error.message);
    }
  }

  console.log('\n✨ Admin account creation completed!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  admins.forEach(admin => {
    console.log(`📧 ${admin.email}`);
    console.log(`🔒 Password: ${admin.password}`);
    console.log(`👤 Role: ${admin.role} (Full Admin Access)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

createAdminUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
