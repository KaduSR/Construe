
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eyrlgyjjtnhowtkkiith.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cmxneWpqdG5ob3d0a2tpaXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjE5MDIsImV4cCI6MjA3OTEzNzkwMn0.UzG09ayWBUfcPMaKaM7rABWI6CZ4-g7jrHY1QF08TJE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
