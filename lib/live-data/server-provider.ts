import { createClient } from "@/lib/supabase/server";
import type { FootballDataProvider } from "./football-provider";
import { SupabaseFootballProvider } from "./supabase-provider";

export async function createServerFootballProvider(): Promise<FootballDataProvider | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;

  return new SupabaseFootballProvider(await createClient());
}
