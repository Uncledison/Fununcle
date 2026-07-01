// 관리자 전용: 특정 계정의 학습기록을 '빈 상태'로 초기화
// (삭제 X — 빈 값 blob으로 upsert해야 다음 로그인 시 기기 로컬까지 교체·정리됨)
// service_role 키는 서버 환경변수로만. 호출자가 is_admin인지 검증 후 실행.
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

  // 3) 대상 학습기록 초기화 (빈 상태 blob으로 upsert)
  const targetId = (req.body && req.body.userId) || "";
  if (!targetId) { res.status(400).json({ error: "no userId" }); return; }

  // 단어장셋 유지 여부 (기본: 함께 초기화)
  const keepSets = !!(req.body && req.body.keepSets);

  const empty = {
    wordgame_progress_v1: JSON.stringify({ progress: [], xp: 0, streak: 0 }),
    custom_worlds: keepSets ? undefined : "[]",
    custom_resume: "{}",
    custom_only_mode: "false",
    wordgame_unlocked_starts: "[]",
    wordgame_avatar: "",
    wordgame_nickname: "",
    wordgame_conn_alias: "{}",
  };
  // keepSets일 때는 기존 custom_worlds 보존
  if (keepSets) {
    const { data: cur } = await admin.from("wordgame_state").select("data").eq("user_id", targetId).maybeSingle();
    empty.custom_worlds = (cur?.data && cur.data.custom_worlds) || "[]";
  } else {
    empty.custom_worlds = "[]";
  }

  const { error: upErr } = await admin
    .from("wordgame_state")
    .upsert({ user_id: targetId, data: empty, updated_at: new Date().toISOString() });
  if (upErr) { res.status(500).json({ error: upErr.message }); return; }

  res.status(200).json({ ok: true });
}
