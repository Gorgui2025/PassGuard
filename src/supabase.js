import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://bmackcntozarkptsqsbc.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWNrY250b3phcmtwdHNxc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjE3NDMsImV4cCI6MjA5MTAzNzc0M30.5SktUv05XAFxFDc3NveDWQBajttoIyQRXj-hyyJ3LJU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { detectSessionInUrl: false, persistSession: true }
})
