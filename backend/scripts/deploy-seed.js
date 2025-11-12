/**
 * Deployment seed script - Only seeds if database is empty
 * This prevents re-seeding on every deployment
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function shouldSeed() {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} users - skipping seed`);
      return false;
    }
    
    console.log('📝 Database is empty - will run seed');
    return true;
  } catch (error) {
    console.error('Error checking database:', error);
    return false;
  }
}

async function main() {
  const needsSeed = await shouldSeed();
  
  if (needsSeed) {
    console.log('🌱 Running database seed...');
    try {
      execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    }
  }
  
  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('Error in deploy-seed:', error);
    process.exit(1);
  });

