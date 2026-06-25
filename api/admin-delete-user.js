// 관리자 전용: 가입 사용자 완전 삭제 (auth.users → profiles/wordgame_state 캐스케이드)
// service_role 키는 서버 환경변수로만. 호출자가 is_admin인지 검증 후 삭제.
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method not allowed" }); return; }

  const url = process.env.SUPABASE_URL || "https://avspjndaezytkvutunnf.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!serviceKey) { res.status(500).json({ error: "service role not configured" }); return; }

  const token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  if (!token) { res.status(401).json({ error: "no token" }); return; }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // 1) 호출자 신원 확인
  const { data: who, error: uErr } = await admin.auth.getUser(token);
  if (uErr || !who?.user) { res.status(401).json({ error: "invalid token" }); return; }
  const callerId = who.user.id;

  // 2) 호출자가 관리자인지
  const { data: prof } = await admin.from("profiles").select("is_admin").eq("id", callerId).maybeSingle();
  if (!prof?.is_admin) { res.status(403).json({ error: "not admin" }); return; }

  // 3) 대상 삭제
  const targetId = (req.body && req.body.userId) || "";
  if (!targetId) { res.status(400).json({ error: "no userId" }); return; }
  if (targetId === callerId) { res.status(400).json({ error: "본인 계정은 삭제할 수 없습니다" }); return; }

  const { error: delErr } = await admin.auth.admin.deleteUser(targetId);
  if (delErr) { res.status(500).json({ error: delErr.message }); return; }

  res.status(200).json({ ok: true });
}
