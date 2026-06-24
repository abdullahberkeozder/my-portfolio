import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env
  .VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY;

const isTest = import.meta.env.MODE === "test";

if (!isTest && (!supabaseUrl || !supabaseKey)) {
  throw new Error(
    "Missing Supabase credentials. Please check your .env.local file.",
  );
}

const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseKey || "placeholder-anon-key",
);
export default supabase;
