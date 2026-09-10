import "dotenv/config";

import { supabaseAdmin } from "../src/config/supabase";
import { prisma } from "../src/config/prisma";
import { Role } from "@ams/shared";

const PASSWORD = "password";
const ORGANIZATION_NAME = "Demo Academy";

const users = [
  { email: "superadmin@example.com", role: Role.SUPER_ADMIN },
  { email: "admin@example.com", role: Role.ADMIN },
  { email: "teacher@example.com", role: Role.TEACHER },
  { email: "student@example.com", role: Role.STUDENT },
];

async function ensureUser(email: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Failed to create ${email}: ${error.message}`);
  }

  if (!data.user) {
    throw new Error(`No Supabase user returned for ${email}`);
  }

  return prisma.user.create({
    data: { id: data.user.id, email },
  });
}

async function seed() {
  console.log("Starting seed...\n");

  const organization = await prisma.organization.upsert({
    where: { name: ORGANIZATION_NAME },
    update: {},
    create: { name: ORGANIZATION_NAME },
  });

  console.log(`Organization ready: ${organization.name}\n`);

  for (const { email, role } of users) {
    console.log(`Creating ${role}: ${email}`);

    const user = await ensureUser(email);

    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      update: { role },
      create: { userId: user.id, organizationId: organization.id, role },
    });

    console.log(`Ready: ${email} -> ${organization.name} (${role})\n`);
  }

  console.log("Seed completed successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
