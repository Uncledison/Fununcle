// edge-tts (Microsoft Edge Read Aloud) 기반 발음 생성 서버함수
// 내 단어장처럼 미리 받아둘 수 없는 단어를 요청 시 즉시 합성해 mp3로 반환.
// 응답에 장기 캐시 헤더를 줘서 Vercel CDN이 같은 단어를 재활용(제3자 공유)하게 함.
//
// 사용: GET /api/tts?text=hello
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const VOICE = "en-US-AvaNeural"; // 가장 자연스러운 최신 뉴럴 보이스

export default async function handler(req, res) {
  const text = (req.query?.text || "").toString().trim().slice(0, 200);
  if (!text) {
    res.status(400).send("no text");
    return;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);

    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on("data", (d) => chunks.push(d));
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
    });
    const buf = Buffer.concat(chunks);

    res.setHeader("Content-Type", "audio/mpeg");
    // 한 번 만든 발음은 CDN에 캐싱 → 다른 사용자도 재활용, 재생성/차단 위험↓
    res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
    res.status(200).send(buf);
  } catch (e) {
    // 실패하면 클라이언트가 브라우저 TTS로 폴백함
    res.status(500).send("tts error");
  }
}
