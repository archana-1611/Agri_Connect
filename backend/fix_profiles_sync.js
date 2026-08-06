import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function syncAllProfiles() {
  console.log("Fetching all Auth users...");
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  console.log(`Found ${users.length} Auth users. Syncing into 'profiles' table...`);

  for (const u of users) {
    const profileObj = {
      id: u.id,
      full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Farmer',
      phone: u.user_metadata?.phone || u.phone || '',
      location: u.user_metadata?.location || u.user_metadata?.district || 'Tamil Nadu',
      farm_name: u.user_metadata?.farm_name || u.user_metadata?.farmName || '',
      practices: u.user_metadata?.practices || '',
      updated_at: new Date().toISOString()
    };

    const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert(profileObj);
    if (upsertErr) {
      console.error(`Failed to upsert profile for ${u.email}:`, upsertErr.message);
    } else {
      console.log(`Synced profile for ${u.email} (${profileObj.full_name}, ${profileObj.phone})`);
    }
  }

  console.log("\n--- VERIFYING FINAL PROFILES TABLE ---");
  const { data: finalProfiles } = await supabaseAdmin.from('profiles').select('*');
  console.log("Final Profiles:", JSON.stringify(finalProfiles, null, 2));
}

syncAllProfiles();
