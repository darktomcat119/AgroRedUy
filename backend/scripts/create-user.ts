import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const userEmail = 'user@agrored.uy';
  const userPassword = 'user123';
  
  try {
    console.log('Creating regular user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        passwordHash: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        emailVerified: true,
      },
    });
    
    console.log(`✅ User created successfully:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Password: ${userPassword}`);
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`❌ User with email ${userEmail} already exists`);
      
      // Update existing user to USER role
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: { 
          role: UserRole.USER,
          isActive: true,
          emailVerified: true,
        },
      });
      
      console.log(`✅ Updated existing user to USER role:`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
    } else {
      console.error('Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
