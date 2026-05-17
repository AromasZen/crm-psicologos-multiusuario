// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nkkyyqqqusodhwqvprik.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3l5cXFxdXNvZGh3cXZwcmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjU1MDIsImV4cCI6MjA4ODYwMTUwMn0.Gs5bdRrv9HNViruVjr8mQl4Oh2Ei1Hyryr0vxpdPPhU"

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}
