import "dotenv/config";

import { supabaseAdmin } from "../src/config/supabase";
import { prisma } from "../src/config/prisma";
import { Role } from "@ams/shared";

const PASSWORD = "password";
const ORGANIZATION_NAME = "Vidyalankar Institute of technology, Mumbai";

const users = [
  {
    email: "superadmin@vit.edu.in",
    role: Role.SUPER_ADMIN,
  },

  // Teachers
  ...Array.from({ length: 5 }, (_, index) => ({
    email: `teacher${index + 1}@vit.edu.in`,
    role: Role.TEACHER,
  })),

  // Students
  ...Array.from({ length: 30 }, (_, index) => ({
    email: `student${index + 1}@vit.edu.in`,
    role: Role.STUDENT,
  })),
];

async function ensureUser(email: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return existingUser;
  }

  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });

  if (error) {
    throw new Error(
      `Failed to create ${email}: ${error.message}`
    );
  }

  if (!data.user) {
    throw new Error(
      `No Supabase user returned for ${email}`
    );
  }

  return prisma.user.create({
    data: {
      id: data.user.id,
      email,
    },
  });
}

async function seed() {
  console.log("Starting Vidyalankar Institute seed...\n");

  const organization = await prisma.organization.upsert({
    where: {
      name: ORGANIZATION_NAME,
    },
    update: {},
    create: {
      name: ORGANIZATION_NAME,
    },
  });

  console.log(
    `Organization ready: ${organization.name}\n`
  );

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
      update: {
        role,
      },
      create: {
        userId: user.id,
        organizationId: organization.id,
        role,
      },
    });

    console.log(
      `Ready: ${email} -> ${organization.name} (${role})\n`
    );
  }

  console.log(
    "Vidyalankar Institute seed completed successfully."
  );

  console.log("\nSeed summary:");
  console.log("Super Admin: 1");
  console.log("Teachers: 5");
  console.log("Students: 30");
  console.log("Total users: 36");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

