const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Creating user cloudcomputing2@gmail.com...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'cloudcomputing2@gmail.com',
    password: 'cloudcomputing',
    options: {
      data: { name: 'Cloud Computing 2' }
    }
  });

  if (authError) {
    console.error("Error creating user:", authError.message);
  } else {
    console.log("User created successfully:", authData.user?.id);
  }

  console.log("\nChecking if 'favorites' table exists...");
  const { data: favData, error: favError } = await supabase.from('favorites').select('*').limit(1);
  
  if (favError) {
    console.error("Favorites table error (might not exist):", favError.message);
  } else {
    console.log("Favorites table exists. Rows:", favData?.length);
  }
}

main();
