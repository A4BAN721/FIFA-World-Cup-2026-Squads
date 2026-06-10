"use client";

import { createClient, getSupabaseConfig } from "@/lib/supabase/client";
import type { FootballDataProvider } from "./football-provider";
import { SupabaseFootballProvider } from "./supabase-provider";

export function createBrowserFootballProvider(): FootballDataProvider | null {
  if (!getSupabaseConfig()) return null;
  return new SupabaseFootballProvider(createClient());
}
