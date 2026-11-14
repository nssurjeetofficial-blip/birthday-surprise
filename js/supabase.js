
const SUPABASE_URL = "https://czkvebbobsnactjslcbr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_iNZ_L5KVUckWuUHizXhz0w_uQzc4U--";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;
