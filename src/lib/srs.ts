// 간격 반복(SRS, Spaced Repetition) 엔진 — 뇌의 망각곡선 기반 복습 스케줄러.
//
// 설계 원칙(중요): 이 모듈은 "보이지 않는 두뇌"다.
//   - 사용자에게 알고리즘/간격/설정을 노출하지 않는다.
//   - 채점은 기존 게임의 맞음(right)/틀림(left) 스와이프를 그대로 재사용 →
//     Anki식 4단계 자기평가 없이 이진(correct/wrong) 신호만 받는다.
//   - UI/React 의존성 0. 순수 함수 + localStorage 뿐이라 언제든 제거(롤백) 가능.
//
// 단어는 영어 원형 문자열(en)로 식별한다. WordGame의 카드 구조({en, ko, tip})와 동일.

const KEY = "wordgame_srs_v1";
const DAY = 24 * 60 * 60 * 1000;

export interface SrsRecord {
  ef: number;       // ease factor(난이도 계수). 클수록 쉬운 단어 → 간격이 더 빨리 늘어남
  reps: number;     // 연속 정답 횟수(틀리면 0으로 리셋)
  interval: number; // 다음 복습까지의 간격(일)
  due: number;      // 다음 복습 예정 시각(ms epoch)
  last: number;     // 마지막 학습 시각(ms epoch)
}

type Store = Record<string, SrsRecord>;

const EF_MIN = 1.3;
const EF_MAX = 2.6;

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function save(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* 저장 실패(용량/사생활모드)는 무시 — 학습 진행은 계속되어야 함 */
  }
}

// 한 단어의 채점 결과를 기록하고 다음 복습 일정을 계산한다.
// correct=true(오른쪽 스와이프=앎) → 간격을 늘림 / false(왼쪽=모름) → 내일 다시.
export function recordSrs(en: string, correct: boolean, now: number = Date.now()): void {
  if (!en) return;
  const store = load();
  const prev: SrsRecord = store[en] || { ef: 2.3, reps: 0, interval: 0, due: now, last: now };

  let { ef, reps, interval } = prev;

  if (correct) {
    reps += 1;
    if (reps === 1) interval = 1;        // 처음 맞춤 → 내일
    else if (reps === 2) interval = 3;   // 두 번 연속 → 3일 뒤
    else interval = Math.round(interval * ef); // 그 뒤로는 간격 × 난이도계수
    ef = Math.min(EF_MAX, ef + 0.1);     // 잘 맞추는 단어는 점점 뜸하게
  } else {
    reps = 0;
    interval = 1;                        // 틀리면 내일 다시(오늘 세션은 종료되게)
    ef = Math.max(EF_MIN, ef - 0.2);     // 자주 틀리는 단어는 더 촘촘하게
  }

  store[en] = { ef, reps, interval, due: now + interval * DAY, last: now };
  save(store);
}

// 지금(now) 복습해야 할 단어들. "이미 한 번이라도 학습한(기록이 있는)" 단어 중
// 예정 시각이 지난 것만. allowed로 현재 존재하는 단어로 한정(삭제된 커스텀 단어 제외).
export function getDueWords(allowed: string[], now: number = Date.now()): string[] {
  const store = load();
  const allow = new Set(allowed);
  const out: string[] = [];
  for (const en in store) {
    if (!allow.has(en)) continue;
    if (store[en].due <= now) out.push(en);
  }
  return out;
}

export function countDue(allowed: string[], now: number = Date.now()): number {
  return getDueWords(allowed, now).length;
}

// (선택) 학습한 총 단어 수 — 부모용 동기부여 표시에 쓸 수 있음.
export function learnedCount(): number {
  return Object.keys(load()).length;
}

// 다음 복습 알림을 언제·몇 개로 띄울지 계산.
// 가장 이른 "미래 복습 예정" 단어를 찾아 그 날 저녁 7시로 보정한 시각과,
// 그 시각까지 복습 예정이 되는 단어 수를 반환. 예정이 없으면 null.
export function nextReviewReminder(
  allowed: string[],
  now: number = Date.now()
): { at: number; count: number } | null {
  const store = load();
  const allow = new Set(allowed);

  let earliestFuture = Infinity;
  for (const en in store) {
    if (!allow.has(en)) continue;
    const due = store[en].due;
    if (due > now && due < earliestFuture) earliestFuture = due;
  }
  if (earliestFuture === Infinity) return null;

  // 알림은 그 날 저녁 7시에(공부하기 좋은 시간). 이미 지난 시각이면 원래 예정 시각 사용.
  const d = new Date(earliestFuture);
  d.setHours(19, 0, 0, 0);
  let at = d.getTime();
  if (at <= now) at = earliestFuture;

  let count = 0;
  for (const en in store) {
    if (allow.has(en) && store[en].due <= at) count++;
  }
  return { at, count };
}
