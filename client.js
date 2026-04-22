import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Client public — utilisable côté front
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// Client admin — uniquement côté serveur (Azure Functions)
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
)