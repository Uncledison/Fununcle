// 새 가입 알림 → 텔레그램
// Supabase Database Webhook(profiles INSERT)이 이 함수를 호출 → 텔레그램 봇으로 전송.
// 봇 토큰/챗ID/시크릿은 Vercel 환경변수로만 둔다(공개 저장소라 하드코딩 금지).
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).end("method not allowed"); return; }

  // 간단 시크릿 검증 (아무나 호출 못 하게)
  const secret = process.env.WEBHOOK_SECRET;
  const auth = req.headers["authorization"] || "";
  if (secret && auth !== `Bearer ${secret}`) { res.status(401).end("unauthorized"); return; }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) { res.status(500).end("telegram not configured"); return; }

  const rec = (req.body && req.body.record) || {};
  const name = rec.name || "미입력";
  const email = rec.email || "미입력";
  let time = "";
  try { time = new Date(rec.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }); } catch (e) {}

  const text =
    `🔔 영단어 새 가입 신청!\n\n` +
    `👤 이름: ${name}\n` +
    `📧 이메일: ${email}\n` +
    `🕐 ${time}\n\n` +
    `👉 승인: https://fun.uncledison.com/admin.html`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const ok = r.ok;
    res.status(ok ? 200 : 502).json({ ok });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
}
