/**
 * Central Supabase Configuration
 *
 * Automatically resolves credentials from:
 * 1. Vite / .env / .env.local variables (VITE_SUPABASE_URL, SUPABASE_URL, etc.)
 * 2. Direct code fallback constants below (CODE_SUPABASE_URL / CODE_SUPABASE_ANON_KEY)
 */

declare const __ENV_SUPABASE_URL__: string | undefined;
declare const __ENV_SUPABASE_ANON_KEY__: string | undefined;

const CODE_SUPABASE_URL = "";
const CODE_SUPABASE_ANON_KEY = "";

const metaEnv = ((import.meta as any)?.env || {}) as Record<
  string,
  string | undefined
>;
const definedUrl =
  typeof __ENV_SUPABASE_URL__ !== "undefined" ? __ENV_SUPABASE_URL__ : "";
const definedKey =
  typeof __ENV_SUPABASE_ANON_KEY__ !== "undefined"
    ? __ENV_SUPABASE_ANON_KEY__
    : "";

export const SUPABASE_URL = (
  metaEnv.VITE_SUPABASE_URL ||
  definedUrl ||
  CODE_SUPABASE_URL ||
  ""
).trim();

export const SUPABASE_ANON_KEY = (
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  definedKey ||
  CODE_SUPABASE_ANON_KEY ||
  ""
).trim();

export const hasCodeSupabaseCredentials = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
