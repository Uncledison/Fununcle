// 발음 재생 로직
// 우선순위: 1) 고정 단어(pron-map) → MW 원어민 mp3
//          2) 그 외(내 단어장)     → edge-tts 서버함수 /api/tts
//          3) 위가 모두 실패하면    → 브라우저 기본 TTS 폴백
//
// pron-map.json / mp3 파일은 "데이터"라 단어가 늘어도 이 코드는 손댈 필요 없음.

let mapPromise: Promise<Record<string, string>> | null = null;

function loadMap(): Promise<Record<string, string>> {
  if (!mapPromise) {
    mapPromise = fetch("/pron-map.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return mapPromise;
}

let current: HTMLAudioElement | null = null;

/** 현재 재생 중인 발음/문장 정지 (듣기 모드 일시정지·이동용) */
export function stopSpeak() {
  try { if (current) { current.pause(); current = null; } } catch (e) {}
  try { window.speechSynthesis?.cancel(); } catch (e) {}
}

function playUrl(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (current) {
        current.pause();
        current = null;
      }
      const a = new Audio(src);
      current = a;
      a.onended = () => resolve();
      a.onerror = () => reject(new Error("audio error"));
      a.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function browserTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return resolve();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.9;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}

/** 단어/문장 발음 재생. 어디서든 await 없이 호출해도 됨. */
export async function speak(rawWord: string) {
  const word = (rawWord || "").trim();
  if (!word) return;

  const map = await loadMap();
  const file = map[word] || map[word.toLowerCase()];

  // 1) 고정 단어: MW mp3
  if (file) {
    try {
      await playUrl(`/audio/${file}`);
      return;
    } catch {
      /* mp3 누락/깨짐 → 아래로 폴백 */
    }
  }

  // 2) 내 단어장 등: edge-tts 서버함수 (mp3 스트림 반환)
  try {
    await playUrl(`/api/tts?text=${encodeURIComponent(word)}`);
    return;
  } catch {
    // 3) 최종 폴백: 브라우저 TTS
    await browserTTS(word);
  }
}
