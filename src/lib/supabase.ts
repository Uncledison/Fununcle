import { createClient } from "@supabase/supabase-js";

// anon 키는 공개용(프론트엔드 노출 전제) — service_role 키가 아님
const SUPABASE_URL = "https://avspjndaezytkvutunnf.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3BqbmRhZXp5dGt2dXR1bm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTkxMDksImV4cCI6MjA5Nzg3NTEwOX0.2XsCxeV39Pjn6Kfwv0nafvY7hdKXuo9ksnzK1q9AOKc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // 매직링크 리다이렉트 토큰 자동 처리
  },
});
