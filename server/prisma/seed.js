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

  // Create default employer user
  const existingEmployer = await prisma.user.findUnique({
    where: { email: 'employer@kazilink.com' }
  });

  if (!existingEmployer) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('employer123', salt);

    const employer = await prisma.user.create({
      data: {
        email: 'employer@kazilink.com',
        passwordHash,
        fullName: 'Melki Employer',
        role: 'EMPLOYER',
        phone: '0799999991',
        locationCity: 'Dar es Salaam',
        isVerified: true
      }
    });

    await prisma.employerProfile.create({
      data: { userId: employer.id }
    });

    console.log(`Created default employer account: ${employer.email}`);
  } else {
    console.log('Employer already exists.');
  }

  // Create default worker user
  const existingWorker = await prisma.user.findUnique({
    where: { email: 'worker@kazilink.com' }
  });

  if (!existingWorker) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('worker123', salt);

    const worker = await prisma.user.create({
      data: {
        email: 'worker@kazilink.com',
        passwordHash,
        fullName: 'Melki Worker',
        role: 'WORKER',
        phone: '0799999992',
        locationCity: 'Dar es Salaam',
        isVerified: true
      }
    });

    await prisma.workerProfile.create({
      data: { userId: worker.id }
    });

    console.log(`Created default worker account: ${worker.email}`);
  } else {
    console.log('Worker already exists.');
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
