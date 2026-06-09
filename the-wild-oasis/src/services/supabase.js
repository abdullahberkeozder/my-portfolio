import { createClient } from "@supabase/supabase-js";

export const supabaseUrl =
  "https://zlxusiiecheovlmakwiw.supabase.co";
export const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseHVzaWllY2hlb3ZsbWFrd2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY3NDcsImV4cCI6MjA5NTkyMjc0N30.SLCbXhGos76yCE-PaqoCOKGY9gHADh0Tb-IA5V2youg";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
