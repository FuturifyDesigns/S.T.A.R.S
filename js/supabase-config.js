/* Public Supabase config only — never put service_role / secret keys here */
window.STARS_SUPABASE = {
  url: "https://rfwraawxxsjtfkqbzbnj.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmd3JhYXd4eHNqdGZrcWJ6Ym5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDM5MjgsImV4cCI6MjEwMjExOTkyOH0.W_fjYPe-D7JDaJxc9YFwB8orXYcGWbMpkBoZujKpzyo",
};

window.createStarsSupabase = function createStarsSupabase() {
  if (!window.supabase?.createClient) {
    throw new Error("Supabase client library failed to load.");
  }
  const { url, anonKey } = window.STARS_SUPABASE;
  return window.supabase.createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "stars-admin-auth",
    },
  });
};
