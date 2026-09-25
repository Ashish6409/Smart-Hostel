import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

async function main() {
  const args = process.argv.slice(2);
  const name = args[0] || 'System Administrator';
  const email = (args[1] || 'superadmin@hostel.edu').toLowerCase();
  const password = args[2] || 'admin123';
  const phone = args[3] || '+91 99999 88888';

  console.log(`\nCreating Admin Account:`);
  console.log(`Name    : ${name}`);
  console.log(`Email   : ${email}`);
  console.log(`Password: ${password}`);

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        name,
        role: 'ADMIN',
        passwordHash,
        phone
      }
    });
    console.log(`\n✅ Existing user updated to ADMIN role successfully! (User ID: ${updated.id})`);
  } else {
    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
        phone
      }
    });
    console.log(`\n🎉 New ADMIN account created successfully! (User ID: ${created.id})`);
  }

  console.log(`\nYou can now log in at http://localhost:3000 with:`);
  console.log(`Email   : ${email}`);
  console.log(`Password: ${password}\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
