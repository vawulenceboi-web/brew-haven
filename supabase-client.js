import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const url = env.NEXT_PUBLIC_SUPABASE_URL || window.BREW_HAVEN_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.BREW_HAVEN_SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(url, key);
