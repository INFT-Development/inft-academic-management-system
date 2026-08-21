import { registerUser } from "./auth.service";

async function main() {
  const user = await registerUser({
    email: "test@example.com",
    password: "Password123!",
    role: "STUDENT",
  });

  console.log("Created user:");
  console.log(user);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});