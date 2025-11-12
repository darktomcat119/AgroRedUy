/**
 * Update existing CONTRACTOR users to ADMIN role
 * In this project, ADMIN = CONTRACTOR
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateContractorRoles() {
  console.log('🔄 Updating CONTRACTOR roles to ADMIN...\n');

  try {
    // Find all users with CONTRACTOR role
    const contractors = await prisma.user.findMany({
      where: {
        role: 'CONTRACTOR'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log(`Found ${contractors.length} users with CONTRACTOR role\n`);

    if (contractors.length === 0) {
      console.log('✅ No contractors found to update');
      return;
    }

    // Update all contractors to ADMIN role
    const result = await prisma.user.updateMany({
      where: {
        role: 'CONTRACTOR'
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log(`✅ Updated ${result.count} contractors to ADMIN role\n`);
    
    console.log('Updated users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    contractors.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Old Role: CONTRACTOR → New Role: ADMIN`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All contractors can now login and access admin panel!');
    
  } catch (error) {
    console.error('❌ Error updating contractor roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateContractorRoles();

