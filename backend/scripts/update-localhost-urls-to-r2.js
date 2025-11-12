/**
 * Update localhost:3003 URLs to R2 Public URLs
 * This fixes images that were saved with the old localhost URL
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateLocalhostToR2() {
  console.log('🔧 Updating localhost:3003 URLs to R2...\n');

  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  
  if (!r2PublicUrl) {
    console.error('❌ R2_PUBLIC_URL not configured!');
    process.exit(1);
  }

  console.log(`✅ R2 Public URL: ${r2PublicUrl}\n`);

  try {
    // Fix user profile images
    console.log('📸 Fixing user profile images...');
    const usersWithLocalhost = await prisma.user.findMany({
      where: {
        profileImageUrl: {
          contains: 'localhost'
        }
      },
      select: {
        id: true,
        email: true,
        profileImageUrl: true,
      }
    });

    console.log(`   Found ${usersWithLocalhost.length} users with localhost URLs`);

    for (const user of usersWithLocalhost) {
      if (!user.profileImageUrl) continue;
      
      // Extract path from localhost URL
      // http://localhost:3003/uploads/avatars/avatar-id.jpg → avatars/avatar-id.jpg
      const match = user.profileImageUrl.match(/\/uploads\/(.+)$/);
      
      if (match) {
        const path = match[1];
        const newUrl = `${r2PublicUrl}/${path}`;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { profileImageUrl: newUrl }
        });
        
        console.log(`   ✅ Updated: ${user.email}`);
        console.log(`      Old: ${user.profileImageUrl}`);
        console.log(`      New: ${newUrl}\n`);
      }
    }

    // Fix service images
    console.log('🖼️  Fixing service images...');
    const servicesWithLocalhost = await prisma.service.findMany({
      where: {
        images: {
          some: {
            imageUrl: {
              contains: 'localhost'
            }
          }
        }
      },
      include: {
        images: true
      }
    });

    console.log(`   Found ${servicesWithLocalhost.length} services with localhost image URLs`);

    for (const service of servicesWithLocalhost) {
      for (const image of service.images) {
        if (!image.imageUrl.includes('localhost')) continue;
        
        const match = image.imageUrl.match(/\/uploads\/(.+)$/);
        
        if (match) {
          const path = match[1];
          const newUrl = `${r2PublicUrl}/${path}`;
          
          await prisma.serviceImage.update({
            where: { id: image.id },
            data: { imageUrl: newUrl }
          });
          
          console.log(`   ✅ Updated service image: ${service.title}`);
          console.log(`      Old: ${image.imageUrl}`);
          console.log(`      New: ${newUrl}\n`);
        }
      }
    }

    // Fix category icons
    console.log('🏷️  Fixing category icons...');
    const categoriesWithLocalhost = await prisma.category.findMany({
      where: {
        iconUrl: {
          contains: 'localhost'
        }
      }
    });

    console.log(`   Found ${categoriesWithLocalhost.length} categories with localhost icon URLs`);

    for (const category of categoriesWithLocalhost) {
      if (!category.iconUrl) continue;
      
      const match = category.iconUrl.match(/\/uploads\/(.+)$/);
      
      if (match) {
        const path = match[1];
        const newUrl = `${r2PublicUrl}/${path}`;
        
        await prisma.category.update({
          where: { id: category.id },
          data: { iconUrl: newUrl }
        });
        
        console.log(`   ✅ Updated: ${category.name}`);
        console.log(`      Old: ${category.iconUrl}`);
        console.log(`      New: ${newUrl}\n`);
      }
    }

    console.log('\n✅ Database URLs updated successfully!');
    console.log('   All localhost:3003 URLs have been replaced with R2 URLs.');
    
  } catch (error) {
    console.error('❌ Error updating URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateLocalhostToR2();

