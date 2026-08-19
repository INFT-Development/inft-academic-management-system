import "dotenv/config";

import { supabaseAdmin } from "./config/supabase.js";

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    console.error("Supabase connection failed:");
    console.error(error);
    process.exit(1);
  }

  console.log("Supabase connection successful.");
  console.log(`Users returned: ${data.users.length}`);
}

main();