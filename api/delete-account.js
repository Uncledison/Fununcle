// 본인 회원 탈퇴 — 로그인한 이용자가 자신의 계정을 삭제
// (auth.users 삭제 → profiles/wordgame_state/connections/set_transfers 캐스케이드)
// service_role 키는 서버 환경변수로만. 토큰의 주인 = 삭제 대상(본인만 삭제).
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method not allowed" }); return; }

  const url = process.env.SUPABASE_URL || "https://avspjndaezytkvutunnf.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!serviceKey) { res.status(500).json({ error: "service role not configured" }); return; }

  const token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  if (!token) { res.status(401).json({ error: "no token" }); return; }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // 토큰으로 본인 확인 → 그 계정만 삭제
  const { data: who, error: uErr } = await admin.auth.getUser(token);
  if (uErr || !who?.user) { res.status(401).json({ error: "invalid token" }); return; }

  const { error: delErr } = await admin.auth.admin.deleteUser(who.user.id);
  if (delErr) { res.status(500).json({ error: delErr.message }); return; }

  res.status(200).json({ ok: true });
}
