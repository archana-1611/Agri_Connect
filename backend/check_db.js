import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in backend/.env", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("--- FETCHING RESOURCES ---");
  const { data: resources, error: rErr } = await supabase.from('resources').select('*');
  console.log("Resources count:", resources?.length);
  console.log("Resources:", JSON.stringify(resources, null, 2));

  console.log("\n--- FETCHING PROFILES ---");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Profiles count:", profiles?.length);
  console.log("Profiles:", JSON.stringify(profiles, null, 2));
}

checkData();
