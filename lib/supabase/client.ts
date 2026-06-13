import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function createClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing Supabase configuration. Check your environment variables.",
    );
  }

  return createBrowserClient(config.url, config.key);
}
