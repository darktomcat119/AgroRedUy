import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserToAdmin() {
  try {
    // Find the user (you can modify this to find by email or ID)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('Current users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
    });

    // Update the first user to ADMIN role (modify as needed)
    if (users.length > 0) {
      const userToUpdate = users[0]; // Change this to select specific user
      
      const updatedUser = await prisma.user.update({
        where: { id: userToUpdate.id },
        data: { role: 'ADMIN' }
      });

      console.log(`\nUpdated user ${updatedUser.email} to ADMIN role`);
    } else {
      console.log('No users found');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserToAdmin();
