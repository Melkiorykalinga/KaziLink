const { PrismaClient } = require('../src/utils/prismaClient');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting clean production seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kazilink.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'KaziLink#Melki$2026!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'KaziLink Administrator',
        role: 'ADMIN',
        isVerified: true
      }
    });
    console.log(`Created secure admin account: ${admin.email}`);
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash }
    });
    console.log(`Updated secure admin password for: ${adminEmail}`);
  }

  console.log('Clean seed completed successfully (no test/demo accounts).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
