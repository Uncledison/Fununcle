import { supabase } from "./supabase";

// 동기화할 localStorage 키 (영단어 앱 상태 전체)
const KEYS = [
  "wordgame_progress_v1",
  "custom_worlds",
  "custom_resume",
  "custom_only_mode",
  "wordgame_unlocked_starts",
  "wordgame_avatar",
  "wordgame_nickname",
  "wordgame_conn_alias",
  "wordgame_theme",
  // ── 한자 플래시카드 (/hanja) 상태 — 영단어와 별도로 보관, 같은 행에 함께 동기화 ──
  "hanjagame_progress_v1",
  "hanja_custom_worlds",
  "hanja_custom_resume",
  "hanja_custom_only_mode",
  "hanjagame_unlocked_starts",
  "hanjagame_avatar",
  "hanjagame_nickname",
  "hanjagame_conn_alias",
];

// localStorage의 현재 값들을 {키: 원본문자열} 형태로 수집
export function collectLocalState(): Record<string, string> {
  const data: Record<string, string> = {};
  for (const k of KEYS) {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  }
  return data;
}

// 동기화 키를 로컬에서 모두 제거 (로그아웃/계정 교체 시)
export function clearLocalState() {
  for (const k of KEYS) {
    try { localStorage.removeItem(k); } catch (e) {}
  }
}

// 클라우드에서 받은 blob을 localStorage에 반영
export function applyLocalState(data: Record<string, string> | null) {
  if (!data) return;
  for (const k of KEYS) {
    if (typeof data[k] === "string") {
      try { localStorage.setItem(k, data[k]); } catch (e) {}
    }
  }
}

// 내 클라우드 상태 가져오기
//  - 객체: 클라우드에 데이터 있음
//  - null: 조회 성공했으나 비어있음(진짜 첫 로그인)
//  - undefined: 조회 실패(네트워크 등) → 로컬 유지·업로드 금지로 클라우드 보호
export async function pullCloud(userId: string): Promise<Record<string, string> | null | undefined> {
  try {
    const { data, error } = await supabase
      .from("wordgame_state")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return undefined;
    return (data?.data as any) ?? null;
  } catch (e) {
    return undefined;
  }
}

// 현재 localStorage 상태를 클라우드에 저장(업서트)
export async function pushCloud(userId: string): Promise<boolean> {
  try {
    const payload = collectLocalState();
    const { error } = await supabase
      .from("wordgame_state")
      .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() });
    return !error;
  } catch (e) {
    return false;
  }
}
