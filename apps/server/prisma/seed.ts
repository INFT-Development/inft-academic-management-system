import "dotenv/config";

import { supabaseAdmin } from "../src/config/supabase";
import { prisma } from "../src/config/prisma";
import { Role } from "../src/generated/prisma/enums";

const PASSWORD = "password";

const users = [
  {
    email: "admin@example.com",
    role: Role.ADMIN,
  },
  {
    email: "teacher@example.com",
    role: Role.TEACHER,
  },
  {
    email: "student@example.com",
    role: Role.STUDENT,
  },
];

async function seed() {
  console.log("Starting seed...\n");

  for (const user of users) {
    console.log(`Creating ${user.role}: ${user.email}`);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (existingUser) {
      console.log(`Already exists: ${user.email}\n`);
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (error) {
      throw new Error(
        `Failed to create ${user.email}: ${error.message}`,
      );
    }

    if (!data.user) {
      throw new Error(`No Supabase user returned for ${user.email}`);
    }

    await prisma.user.create({
      data: {
        id: data.user.id,
        email: user.email,
        role: user.role,
      },
    });

    console.log(`Created: ${user.email}\n`);
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