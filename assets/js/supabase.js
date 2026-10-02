// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// 1. Buka Supabase Project -> Project Settings -> API
// 2. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di bawah.
// 3. Gunakan ANON/PUBLISHABLE KEY, JANGAN gunakan service_role key.

const SUPABASE_URL = "https://wwusqawhchgvvdzzhyuy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dXNxYXdoY2hndnZkenpoeXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Nzc4MTMsImV4cCI6MjEwNjM1MzgxM30.AlZhBCxxtiSGmJ-p8agBzOUNmMVgRZj3X3sPI4ZPWZA";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
