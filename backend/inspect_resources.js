import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function inspect() {
  const { data: resources } = await supabase.from('resources').select('*');
  console.log("RESOURCES DETAILS:");
  resources.forEach(r => {
    console.log({
      id: r.id,
      title: r.title,
      user_id: r.user_id,
      seller_name: r.seller_name,
      seller_phone: r.seller_phone,
      all_keys: Object.keys(r)
    });
  });
}

inspect();
