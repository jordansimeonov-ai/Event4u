import { createClient } from '@supabase/supabase-js';

// Access environment variables securely in Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createSafeClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase Environment Variables missing (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Using placeholder values to prevent crash.');
      // Return a client pointing to a placeholder. Calls will fail gracefully or be handled by dataService.
      return createClient('https://placeholder.supabase.co', 'placeholder');
    }
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }
};

// Initialize the Supabase client safely.
export const supabase = createSafeClient();