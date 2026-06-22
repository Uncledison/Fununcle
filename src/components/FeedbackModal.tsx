import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function FeedbackModal() {
  const [show, setShow] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  useEffect(() => {
    const handleShow = () => setShow(true);
    window.addEventListener("showFeedback", handleShow);
    return () => window.removeEventListener("showFeedback", handleShow);
  }, []);

  if (!show) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#1a1a2e", borderRadius: 24, width: "100%", maxWidth: 360, padding: 24, border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💌</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>앱 사용 경험이 어떠신가요?</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>버그 신고, 기능 제안 등 무엇이든 좋습니다!<br/>여러분의 소중한 의견을 들려주세요.</div>
        </div>
        
        <textarea
          placeholder="좋았던 점, 불편했던 점, 추가되었으면 하는 기능 등을 자유롭게 적어주세요!"
          value={feedbackText}
          onChange={e => setFeedbackText(e.target.value)}
          style={{ width: "100%", height: 140, padding: 16, borderRadius: 16, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", resize: "none", fontSize: 14, fontFamily: "inherit" }}
        />
        
        <button
          disabled={isSendingFeedback || feedbackText.trim().length === 0}
          onClick={async () => {
            setIsSendingFeedback(true);
            try {
              const token = "8608442050:AAEBLv5NLGP5i_V7FtUiaezv7lfX-Nx1y7M";
              const chatId = "5334090618";
              const text = `💌 [UncleEdisonFun 피드백]\n\n${feedbackText}`;
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text })
              });
              localStorage.setItem('feedback_done', 'true');
              alert("피드백이 성공적으로 전송되었습니다! 감사합니다 ❤️");
              setShow(false);
              setFeedbackText("");
            } catch (e) {
              alert("전송에 실패했습니다. 나중에 다시 시도해주세요.");
            } finally {
              setIsSendingFeedback(false);
            }
          }}
          style={{ padding: 16, background: feedbackText.trim().length > 0 ? "#FFB800" : "rgba(255,255,255,0.1)", color: feedbackText.trim().length > 0 ? "#000" : "rgba(255,255,255,0.3)", borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: feedbackText.trim().length > 0 ? "pointer" : "default", border: "none", transition: "all 0.2s" }}
        >
          {isSendingFeedback ? "전송 중..." : "🚀 피드백 보내기"}
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShow(false)}
            style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", borderRadius: 16, border: "none", fontSize: 13, cursor: "pointer", fontWeight: 700 }}
          >
            다음에 하기
          </button>
          <button
            onClick={() => {
              if(window.confirm("앞으로 이 팝업을 다시 띄우지 않을까요? (수동으로 보낼 수는 있습니다)")) {
                localStorage.setItem('feedback_done', 'true');
                setShow(false);
              }
            }}
            style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.3)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
