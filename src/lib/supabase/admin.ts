import { createClient } from '@supabase/supabase-js'

// Cliente Supabase dedicado para uso em server-side sem dependência de Cookies.
// O createClient do @supabase/ssr usa cookies(), o que causa erro 500 ao ser
// utilizado dentro de rotas geradas estaticamente ou no unstable_cache.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: false,
        }
    }
)
