import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log("Missing SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testUsers() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error listing auth users:", error);
    return;
  }

  console.log("--- ALL AUTH USERS ---");
  users.forEach(u => {
    console.log({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name,
      phone: u.user_metadata?.phone || u.phone,
      metadata: u.user_metadata
    });
  });
}

testUsers();
