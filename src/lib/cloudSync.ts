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

// 클라우드에서 받은 blob을 localStorage에 반영
export function applyLocalState(data: Record<string, string> | null) {
  if (!data) return;
  for (const k of KEYS) {
    if (typeof data[k] === "string") {
      try { localStorage.setItem(k, data[k]); } catch (e) {}
    }
  }
}

// 내 클라우드 상태 가져오기 (없으면 null)
export async function pullCloud(userId: string): Promise<Record<string, string> | null> {
  try {
    const { data, error } = await supabase
      .from("wordgame_state")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return null;
    return (data?.data as any) ?? null;
  } catch (e) {
    return null;
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
