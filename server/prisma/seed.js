const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default admin user
  // We use fixed email admin@kazilink.com
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@kazilink.com' }
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@kazilink.com',
        passwordHash,
        fullName: 'System Administrator',
        role: 'ADMIN',
        isVerified: true
      }
    });

    console.log(`Created default admin account: ${admin.email}`);
  } else {
    console.log('Admin already exists.');
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
