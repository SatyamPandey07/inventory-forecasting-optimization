import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-inventoryai.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-inventoryai-2026';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
