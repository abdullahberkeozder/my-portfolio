let supabaseClientPromise;

export function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("./supabase").then(
      ({ default: supabase }) => supabase,
    );
  }

  return supabaseClientPromise;
}
