import { supabase } from "./supabase";

// ── 핸들(아이디) ──────────────────────────────
const HANDLE_WORDS = ["fox", "cat", "dog", "panda", "tiger", "lion", "bear", "star", "moon", "sky", "jet", "ace", "neo", "owl", "fish", "bee", "koala", "duck"];
const randHandle = () => HANDLE_WORDS[Math.floor(Math.random() * HANDLE_WORDS.length)] + Math.floor(1000 + Math.random() * 9000);

// 핸들 없으면 생성, 있으면 그대로 반환
export async function ensureHandle(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase.from("profiles").select("handle").eq("id", userId).maybeSingle();
    if (data?.handle) return data.handle;
    for (let i = 0; i < 6; i++) {
      const h = randHandle();
      const { error } = await supabase.from("profiles").update({ handle: h }).eq("id", userId);
      if (!error) return h;
    }
  } catch (e) {}
  return null;
}

// 핸들로 사용자 찾기 → {id, name, handle}
export async function lookupUser(handle: string) {
  try {
    const { data, error } = await supabase.rpc("lookup_user", { p_handle: (handle || "").replace(/^@/, "").trim() });
    if (error || !data || !data.length) return null;
    return data[0] as { id: string; name: string; handle: string };
  } catch (e) { return null; }
}

// 초대 수락 → 일촌 연결 (requester=나, addressee=초대한 사람)
export async function acceptInvite(inviterHandle: string, myId: string) {
  const u = await lookupUser(inviterHandle);
  if (!u) return { ok: false, error: "사용자를 찾을 수 없어요" };
  if (u.id === myId) return { ok: false, error: "본인은 일촌이 될 수 없어요" };
  const { error } = await supabase.from("connections")
    .upsert({ requester: myId, addressee: u.id, status: "accepted" }, { onConflict: "requester,addressee" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, name: u.name };
}

// 내 일촌 목록 → [{other_id, name, handle}]
export async function listConnections() {
  try {
    const { data } = await supabase.rpc("my_connections");
    return (data || []) as { other_id: string; name: string; handle: string }[];
  } catch (e) { return []; }
}

// 단어셋 전송
export async function sendSet(toUserId: string, fromName: string, title: string, words: any) {
  try {
    const me = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from("set_transfers")
      .insert({ from_user: me?.id, from_name: fromName, to_user: toUserId, title, words, status: "pending" });
    return !error;
  } catch (e) { return false; }
}

// 받은 단어장(대기) 목록
export async function listInbox() {
  try {
    const { data } = await supabase.from("set_transfers").select("*").eq("status", "pending").order("created_at", { ascending: false });
    return (data || []) as any[];
  } catch (e) { return []; }
}

export async function deleteTransfer(id: string) {
  try { await supabase.from("set_transfers").delete().eq("id", id); } catch (e) {}
}
