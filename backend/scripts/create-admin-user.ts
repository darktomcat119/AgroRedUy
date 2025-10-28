import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@agrored.uy';
  const adminPassword = 'admin123';
  
  try {
    console.log('Creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'AgroRedUy',
        role: UserRole.SUPERADMIN,
        isActive: true,
        emailVerified: true,
      },
    });
    
    console.log(`✅ Admin user created successfully:`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Password: ${adminPassword}`);
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`❌ User with email ${adminEmail} already exists`);
      
      // Update existing user to admin role
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: UserRole.SUPERADMIN,
          isActive: true,
          emailVerified: true,
        },
      });
      
      console.log(`✅ Updated existing user to SUPERADMIN role:`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
    } else {
      console.error('Error creating admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
