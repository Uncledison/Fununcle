// 일촌 초대 링크 전용 페이지
// - 카톡 미리보기(OG)를 '영단어 플래시카드 일촌신청'으로 표시
// - 카톡 인앱브라우저면 기본 브라우저로 자동 전환(로그인 세션 사용 위해)
export default function handler(req, res) {
  const u = String(req.query.u || "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
  const target = `https://fun.uncledison.com/english?invite=${encodeURIComponent(u)}`;
  const title = "영단어 플래시카드 · 일촌 신청이 왔어요! 🤝";
  const desc = "일촌끼리 영단어장 무료 공유! 링크를 열고 수락하면 서로 단어장을 주고받을 수 있어요.";
  const img = "https://fun.uncledison.com/icon-english-512.png";
  const targetJson = JSON.stringify(target);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  res.status(200).send(`<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${target}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<style>
  body{margin:0;background:#1e1b4b;color:#fff;font-family:'Segoe UI',system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}
  .box{max-width:340px}.emoji{font-size:56px}h1{font-size:22px;margin:14px 0 8px;line-height:1.3}
  p{color:rgba(255,255,255,.6);font-size:14px;line-height:1.6;margin:0 0 24px}
  a.btn{display:block;padding:16px;background:linear-gradient(135deg,#A78BFA,#6d28d9);border-radius:16px;color:#fff;font-weight:800;font-size:16px;text-decoration:none}
  .hint{color:rgba(255,255,255,.35);font-size:12px;margin-top:14px}
</style>
</head><body>
<div class="box">
  <div class="emoji">📚🤝</div>
  <h1>영단어 플래시카드<br>일촌 신청이 왔어요!</h1>
  <p>일촌끼리 영단어장 무료 공유!<br>아래 버튼을 눌러 수락하세요.</p>
  <a class="btn" id="go" href="${target}">수락하러 가기 →</a>
  <div class="hint">버튼이 안 되면 우측 상단 메뉴 → '다른 브라우저로 열기'</div>
</div>
<script>
(function(){
  var target=${targetJson};
  var ua=navigator.userAgent||"";
  if(/KAKAOTALK/i.test(ua)){
    // 카톡 인앱브라우저 → 기본 브라우저로 강제 오픈 (로그인 세션이 있는 곳)
    location.href="kakaotalk://web/openExternal?url="+encodeURIComponent(target);
  } else {
    location.replace(target);
  }
})();
</script>
</body></html>`);
}
