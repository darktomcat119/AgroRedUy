/**
 * Reset avatar URLs to null so users can re-upload
 * This is needed when switching from R2 to local storage in development
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetAvatarUrls() {
  console.log('🔄 Resetting avatar URLs to null...\n');

  try {
    // Reset all user avatars that have R2 or old localhost URLs
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { profileImageUrl: { contains: 'r2.dev' } },
          { profileImageUrl: { contains: 'localhost:3003' } },
          { profileImageUrl: { contains: 'localhost:3001' } }
        ]
      },
      data: {
        profileImageUrl: null
      }
    });

    console.log(`✅ Reset ${result.count} user avatar URLs`);
    console.log('   Users can now re-upload their avatars with the new local storage setup.\n');
    
  } catch (error) {
    console.error('❌ Error resetting URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAvatarUrls();

