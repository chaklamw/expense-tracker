const SUPABASE_URL = "https://zfjztwjvpblawvjyikgw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oaCSg8KXx4P6AMlC3ADlLA_HgsZeqrS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);