/**
 * Fix localhost URLs in database - Update to R2 URLs
 * Run this after configuring R2_PUBLIC_URL on Railway
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixLocalhostUrls() {
  console.log('🔧 Fixing localhost URLs in database...\n');

  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  
  if (!r2PublicUrl || r2PublicUrl.includes('YOUR_PUB_ID')) {
    console.error('❌ R2_PUBLIC_URL not configured properly!');
    console.error('   Please set R2_PUBLIC_URL in your Railway environment variables.');
    console.error('   Example: https://pub-abc123def456.r2.dev');
    process.exit(1);
  }

  console.log(`✅ R2 Public URL: ${r2PublicUrl}\n`);

  try {
    // Fix user profile images
    console.log('Fixing user profile images...');
    const usersWithLocalhostUrls = await prisma.user.findMany({
      where: {
        profileImageUrl: {
          contains: 'localhost'
        }
      },
      select: {
        id: true,
        profileImageUrl: true,
      }
    });

    console.log(`Found ${usersWithLocalhostUrls.length} users with localhost URLs`);

    for (const user of usersWithLocalhostUrls) {
      if (!user.profileImageUrl) continue;
      
      // Extract filename from localhost URL
      // http://localhost:3003/uploads/avatars/avatar-id-timestamp.jpg
      // → avatars/avatar-id-timestamp.jpg
      const match = user.profileImageUrl.match(/\/uploads\/(.+)$/);
      
      if (match) {
        const filePath = match[1]; // e.g., "avatars/avatar-id-timestamp.jpg"
        const newUrl = `${r2PublicUrl}/${filePath}`;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { profileImageUrl: newUrl }
        });
        
        console.log(`  ✅ Updated user ${user.id}`);
        console.log(`     Old: ${user.profileImageUrl}`);
        console.log(`     New: ${newUrl}`);
      }
    }

    // Fix service images
    console.log('\nFixing service images...');
    const servicesWithLocalhostUrls = await prisma.serviceImage.findMany({
      where: {
        imageUrl: {
          contains: 'localhost'
        }
      },
      select: {
        id: true,
        imageUrl: true,
      }
    });

    console.log(`Found ${servicesWithLocalhostUrls.length} service images with localhost URLs`);

    for (const image of servicesWithLocalhostUrls) {
      const match = image.imageUrl.match(/\/uploads\/(.+)$/);
      
      if (match) {
        const filePath = match[1];
        const newUrl = `${r2PublicUrl}/${filePath}`;
        
        await prisma.serviceImage.update({
          where: { id: image.id },
          data: { imageUrl: newUrl }
        });
        
        console.log(`  ✅ Updated service image ${image.id}`);
      }
    }

    // Fix category icons
    console.log('\nFixing category icons...');
    const categoriesWithLocalhostUrls = await prisma.category.findMany({
      where: {
        iconUrl: {
          contains: 'localhost'
        }
      },
      select: {
        id: true,
        name: true,
        iconUrl: true,
      }
    });

    console.log(`Found ${categoriesWithLocalhostUrls.length} categories with localhost URLs`);

    for (const category of categoriesWithLocalhostUrls) {
      if (!category.iconUrl) continue;
      
      const match = category.iconUrl.match(/\/uploads\/(.+)$/);
      
      if (match) {
        const filePath = match[1];
        const newUrl = `${r2PublicUrl}/${filePath}`;
        
        await prisma.category.update({
          where: { id: category.id },
          data: { iconUrl: newUrl }
        });
        
        console.log(`  ✅ Updated category ${category.name}`);
      }
    }

    console.log('\n🎉 All localhost URLs have been updated to R2 URLs!');
    console.log('\n📋 Summary:');
    console.log(`   - User avatars: ${usersWithLocalhostUrls.length} updated`);
    console.log(`   - Service images: ${servicesWithLocalhostUrls.length} updated`);
    console.log(`   - Category icons: ${categoriesWithLocalhostUrls.length} updated`);
    console.log('\n✅ Images should now load correctly in your app!');

  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixLocalhostUrls();

