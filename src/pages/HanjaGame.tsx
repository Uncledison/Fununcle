// @ts-nocheck
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { usePageSeo } from "../hooks/usePageSeo";
import { usePwaManifest } from "../hooks/usePwaManifest";
import { supabase } from "../lib/supabase";
import { pullCloud, pushCloud, applyLocalState } from "../lib/cloudSync";
import { ensureHandle, lookupUser, acceptInvite, listConnections, sendSet, listInbox, deleteTransfer, removeConnection } from "../lib/sharing";

// ── 한자 데이터 (한국어문회 전국한자능력검정시험 8급·준7급·7급) ────────────────
const RAW_WORLDS = [
  {
    id:1, title:"8급", emoji:"🌱",
    color:"#4ADE80", dark:"#15803d",
    desc:"한국어문회 8급 · 50자",
    words:[
      {en:"敎",ko:"가르칠 교",tip:""}, {en:"校",ko:"학교 교",tip:""}, {en:"九",ko:"아홉 구",tip:""}, {en:"國",ko:"나라 국",tip:""}, {en:"軍",ko:"군사 군",tip:""},
      {en:"金",ko:"쇠 금",tip:""}, {en:"南",ko:"남녘 남",tip:""}, {en:"女",ko:"여자 녀",tip:""}, {en:"年",ko:"해 년",tip:""}, {en:"大",ko:"큰 대",tip:""},
      {en:"東",ko:"동녘 동",tip:""}, {en:"六",ko:"여섯 륙",tip:""}, {en:"萬",ko:"일만 만",tip:""}, {en:"母",ko:"어미 모",tip:""}, {en:"木",ko:"나무 목",tip:""},
      {en:"門",ko:"문 문",tip:""}, {en:"民",ko:"백성 민",tip:""}, {en:"白",ko:"흰 백",tip:""}, {en:"父",ko:"아비 부",tip:""}, {en:"北",ko:"북녘 북",tip:""},
      {en:"四",ko:"넉 사",tip:""}, {en:"山",ko:"메 산",tip:""}, {en:"三",ko:"석 삼",tip:""}, {en:"生",ko:"날 생",tip:""}, {en:"西",ko:"서녘 서",tip:""},
      {en:"先",ko:"먼저 선",tip:""}, {en:"小",ko:"작을 소",tip:""}, {en:"水",ko:"물 수",tip:""}, {en:"室",ko:"집 실",tip:""}, {en:"十",ko:"열 십",tip:""},
      {en:"五",ko:"다섯 오",tip:""}, {en:"王",ko:"임금 왕",tip:""}, {en:"外",ko:"바깥 외",tip:""}, {en:"月",ko:"달 월",tip:""}, {en:"二",ko:"두 이",tip:""},
      {en:"人",ko:"사람 인",tip:""}, {en:"一",ko:"하나 일",tip:""}, {en:"日",ko:"날 일",tip:""}, {en:"長",ko:"긴 장",tip:""}, {en:"弟",ko:"아우 제",tip:""},
      {en:"中",ko:"가운데 중",tip:""}, {en:"靑",ko:"푸를 청",tip:""}, {en:"寸",ko:"마디 촌",tip:""}, {en:"七",ko:"일곱 칠",tip:""}, {en:"土",ko:"흙 토",tip:""},
      {en:"八",ko:"여덟 팔",tip:""}, {en:"學",ko:"배울 학",tip:""}, {en:"韓",ko:"나라 한",tip:""}, {en:"兄",ko:"형 형",tip:""}, {en:"火",ko:"불 화",tip:""},
    ]
  },
  {
    id:2, title:"준7급", emoji:"📗",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"한국어문회 준7급(7급Ⅱ) · 100자",
    words:[
      {en:"敎",ko:"가르칠 교",tip:""}, {en:"校",ko:"학교 교",tip:""}, {en:"九",ko:"아홉 구",tip:""}, {en:"國",ko:"나라 국",tip:""}, {en:"軍",ko:"군사 군",tip:""},
      {en:"金",ko:"쇠 금",tip:""}, {en:"南",ko:"남녘 남",tip:""}, {en:"女",ko:"여자 녀",tip:""}, {en:"年",ko:"해 년",tip:""}, {en:"大",ko:"큰 대",tip:""},
      {en:"東",ko:"동녘 동",tip:""}, {en:"六",ko:"여섯 륙",tip:""}, {en:"萬",ko:"일만 만",tip:""}, {en:"母",ko:"어미 모",tip:""}, {en:"木",ko:"나무 목",tip:""},
      {en:"門",ko:"문 문",tip:""}, {en:"民",ko:"백성 민",tip:""}, {en:"白",ko:"흰 백",tip:""}, {en:"父",ko:"아비 부",tip:""}, {en:"北",ko:"북녘 북",tip:""},
      {en:"四",ko:"넉 사",tip:""}, {en:"山",ko:"메 산",tip:""}, {en:"三",ko:"석 삼",tip:""}, {en:"生",ko:"날 생",tip:""}, {en:"西",ko:"서녘 서",tip:""},
      {en:"先",ko:"먼저 선",tip:""}, {en:"小",ko:"작을 소",tip:""}, {en:"水",ko:"물 수",tip:""}, {en:"室",ko:"집 실",tip:""}, {en:"十",ko:"열 십",tip:""},
      {en:"五",ko:"다섯 오",tip:""}, {en:"王",ko:"임금 왕",tip:""}, {en:"外",ko:"바깥 외",tip:""}, {en:"月",ko:"달 월",tip:""}, {en:"二",ko:"두 이",tip:""},
      {en:"人",ko:"사람 인",tip:""}, {en:"一",ko:"하나 일",tip:""}, {en:"日",ko:"날 일",tip:""}, {en:"長",ko:"긴 장",tip:""}, {en:"弟",ko:"아우 제",tip:""},
      {en:"中",ko:"가운데 중",tip:""}, {en:"靑",ko:"푸를 청",tip:""}, {en:"寸",ko:"마디 촌",tip:""}, {en:"七",ko:"일곱 칠",tip:""}, {en:"土",ko:"흙 토",tip:""},
      {en:"八",ko:"여덟 팔",tip:""}, {en:"學",ko:"배울 학",tip:""}, {en:"韓",ko:"나라 한",tip:""}, {en:"兄",ko:"형 형",tip:""}, {en:"火",ko:"불 화",tip:""},
      {en:"家",ko:"집 가",tip:""}, {en:"間",ko:"사이 간",tip:""}, {en:"江",ko:"강 강",tip:""}, {en:"車",ko:"수레 차",tip:""}, {en:"工",ko:"장인 공",tip:""},
      {en:"空",ko:"빌 공",tip:""}, {en:"氣",ko:"기운 기",tip:""}, {en:"記",ko:"기록할 기",tip:""}, {en:"男",ko:"사내 남",tip:""}, {en:"內",ko:"안 내",tip:""},
      {en:"農",ko:"농사 농",tip:""}, {en:"答",ko:"대답 답",tip:""}, {en:"道",ko:"길 도",tip:""}, {en:"動",ko:"움직일 동",tip:""}, {en:"力",ko:"힘 력",tip:""},
      {en:"立",ko:"설 립",tip:""}, {en:"每",ko:"매양 매",tip:""}, {en:"名",ko:"이름 명",tip:""}, {en:"物",ko:"물건 물",tip:""}, {en:"方",ko:"모 방",tip:""},
      {en:"不",ko:"아닐 불",tip:""}, {en:"事",ko:"일 사",tip:""}, {en:"上",ko:"윗 상",tip:""}, {en:"姓",ko:"성 성",tip:""}, {en:"世",ko:"인간 세",tip:""},
      {en:"手",ko:"손 수",tip:""}, {en:"市",ko:"저자 시",tip:""}, {en:"時",ko:"때 시",tip:""}, {en:"食",ko:"밥 식",tip:""}, {en:"安",ko:"편안 안",tip:""},
      {en:"午",ko:"낮 오",tip:""}, {en:"右",ko:"오른 우",tip:""}, {en:"子",ko:"아들 자",tip:""}, {en:"自",ko:"스스로 자",tip:""}, {en:"場",ko:"마당 장",tip:""},
      {en:"全",ko:"온전 전",tip:""}, {en:"前",ko:"앞 전",tip:""}, {en:"電",ko:"번개 전",tip:""}, {en:"正",ko:"바를 정",tip:""}, {en:"足",ko:"발 족",tip:""},
      {en:"左",ko:"왼 좌",tip:""}, {en:"直",ko:"곧을 직",tip:""}, {en:"平",ko:"평평할 평",tip:""}, {en:"下",ko:"아래 하",tip:""}, {en:"漢",ko:"한나라 한",tip:""},
      {en:"海",ko:"바다 해",tip:""}, {en:"話",ko:"말씀 화",tip:""}, {en:"活",ko:"살 활",tip:""}, {en:"孝",ko:"효도 효",tip:""}, {en:"後",ko:"뒤 후",tip:""},
    ]
  },
  {
    id:3, title:"7급", emoji:"📘",
    color:"#F472B6", dark:"#be185d",
    desc:"한국어문회 7급 · 150자",
    words:[
      {en:"敎",ko:"가르칠 교",tip:""}, {en:"校",ko:"학교 교",tip:""}, {en:"九",ko:"아홉 구",tip:""}, {en:"國",ko:"나라 국",tip:""}, {en:"軍",ko:"군사 군",tip:""},
      {en:"金",ko:"쇠 금",tip:""}, {en:"南",ko:"남녘 남",tip:""}, {en:"女",ko:"여자 녀",tip:""}, {en:"年",ko:"해 년",tip:""}, {en:"大",ko:"큰 대",tip:""},
      {en:"東",ko:"동녘 동",tip:""}, {en:"六",ko:"여섯 륙",tip:""}, {en:"萬",ko:"일만 만",tip:""}, {en:"母",ko:"어미 모",tip:""}, {en:"木",ko:"나무 목",tip:""},
      {en:"門",ko:"문 문",tip:""}, {en:"民",ko:"백성 민",tip:""}, {en:"白",ko:"흰 백",tip:""}, {en:"父",ko:"아비 부",tip:""}, {en:"北",ko:"북녘 북",tip:""},
      {en:"四",ko:"넉 사",tip:""}, {en:"山",ko:"메 산",tip:""}, {en:"三",ko:"석 삼",tip:""}, {en:"生",ko:"날 생",tip:""}, {en:"西",ko:"서녘 서",tip:""},
      {en:"先",ko:"먼저 선",tip:""}, {en:"小",ko:"작을 소",tip:""}, {en:"水",ko:"물 수",tip:""}, {en:"室",ko:"집 실",tip:""}, {en:"十",ko:"열 십",tip:""},
      {en:"五",ko:"다섯 오",tip:""}, {en:"王",ko:"임금 왕",tip:""}, {en:"外",ko:"바깥 외",tip:""}, {en:"月",ko:"달 월",tip:""}, {en:"二",ko:"두 이",tip:""},
      {en:"人",ko:"사람 인",tip:""}, {en:"一",ko:"하나 일",tip:""}, {en:"日",ko:"날 일",tip:""}, {en:"長",ko:"긴 장",tip:""}, {en:"弟",ko:"아우 제",tip:""},
      {en:"中",ko:"가운데 중",tip:""}, {en:"靑",ko:"푸를 청",tip:""}, {en:"寸",ko:"마디 촌",tip:""}, {en:"七",ko:"일곱 칠",tip:""}, {en:"土",ko:"흙 토",tip:""},
      {en:"八",ko:"여덟 팔",tip:""}, {en:"學",ko:"배울 학",tip:""}, {en:"韓",ko:"나라 한",tip:""}, {en:"兄",ko:"형 형",tip:""}, {en:"火",ko:"불 화",tip:""},
      {en:"家",ko:"집 가",tip:""}, {en:"間",ko:"사이 간",tip:""}, {en:"江",ko:"강 강",tip:""}, {en:"車",ko:"수레 차",tip:""}, {en:"工",ko:"장인 공",tip:""},
      {en:"空",ko:"빌 공",tip:""}, {en:"氣",ko:"기운 기",tip:""}, {en:"記",ko:"기록할 기",tip:""}, {en:"男",ko:"사내 남",tip:""}, {en:"內",ko:"안 내",tip:""},
      {en:"農",ko:"농사 농",tip:""}, {en:"答",ko:"대답 답",tip:""}, {en:"道",ko:"길 도",tip:""}, {en:"動",ko:"움직일 동",tip:""}, {en:"力",ko:"힘 력",tip:""},
      {en:"立",ko:"설 립",tip:""}, {en:"每",ko:"매양 매",tip:""}, {en:"名",ko:"이름 명",tip:""}, {en:"物",ko:"물건 물",tip:""}, {en:"方",ko:"모 방",tip:""},
      {en:"不",ko:"아닐 불",tip:""}, {en:"事",ko:"일 사",tip:""}, {en:"上",ko:"윗 상",tip:""}, {en:"姓",ko:"성 성",tip:""}, {en:"世",ko:"인간 세",tip:""},
      {en:"手",ko:"손 수",tip:""}, {en:"市",ko:"저자 시",tip:""}, {en:"時",ko:"때 시",tip:""}, {en:"食",ko:"밥 식",tip:""}, {en:"安",ko:"편안 안",tip:""},
      {en:"午",ko:"낮 오",tip:""}, {en:"右",ko:"오른 우",tip:""}, {en:"子",ko:"아들 자",tip:""}, {en:"自",ko:"스스로 자",tip:""}, {en:"場",ko:"마당 장",tip:""},
      {en:"全",ko:"온전 전",tip:""}, {en:"前",ko:"앞 전",tip:""}, {en:"電",ko:"번개 전",tip:""}, {en:"正",ko:"바를 정",tip:""}, {en:"足",ko:"발 족",tip:""},
      {en:"左",ko:"왼 좌",tip:""}, {en:"直",ko:"곧을 직",tip:""}, {en:"平",ko:"평평할 평",tip:""}, {en:"下",ko:"아래 하",tip:""}, {en:"漢",ko:"한나라 한",tip:""},
      {en:"海",ko:"바다 해",tip:""}, {en:"話",ko:"말씀 화",tip:""}, {en:"活",ko:"살 활",tip:""}, {en:"孝",ko:"효도 효",tip:""}, {en:"後",ko:"뒤 후",tip:""},
      {en:"歌",ko:"노래 가",tip:""}, {en:"口",ko:"입 구",tip:""}, {en:"旗",ko:"기 기",tip:""}, {en:"同",ko:"한가지 동",tip:""}, {en:"洞",ko:"마을 동",tip:""},
      {en:"冬",ko:"겨울 동",tip:""}, {en:"登",ko:"오를 등",tip:""}, {en:"來",ko:"올 래",tip:""}, {en:"老",ko:"늙을 로",tip:""}, {en:"里",ko:"마을 리",tip:""},
      {en:"林",ko:"수풀 림",tip:""}, {en:"面",ko:"낯 면",tip:""}, {en:"命",ko:"목숨 명",tip:""}, {en:"文",ko:"글월 문",tip:""}, {en:"問",ko:"물을 문",tip:""},
      {en:"百",ko:"일백 백",tip:""}, {en:"夫",ko:"사내 부",tip:""}, {en:"算",ko:"셈 산",tip:""}, {en:"色",ko:"빛 색",tip:""}, {en:"夕",ko:"저녁 석",tip:""},
      {en:"少",ko:"적을 소",tip:""}, {en:"所",ko:"바 소",tip:""}, {en:"數",ko:"셈 수",tip:""}, {en:"植",ko:"심을 식",tip:""}, {en:"心",ko:"마음 심",tip:""},
      {en:"語",ko:"말씀 어",tip:""}, {en:"然",ko:"그러할 연",tip:""}, {en:"有",ko:"있을 유",tip:""}, {en:"育",ko:"기를 육",tip:""}, {en:"邑",ko:"고을 읍",tip:""},
      {en:"入",ko:"들 입",tip:""}, {en:"字",ko:"글자 자",tip:""}, {en:"祖",ko:"할아비 조",tip:""}, {en:"住",ko:"살 주",tip:""}, {en:"主",ko:"임금 주",tip:""},
      {en:"重",ko:"무거울 중",tip:""}, {en:"紙",ko:"종이 지",tip:""}, {en:"地",ko:"땅 지",tip:""}, {en:"千",ko:"일천 천",tip:""}, {en:"天",ko:"하늘 천",tip:""},
      {en:"川",ko:"시내 천",tip:""}, {en:"草",ko:"풀 초",tip:""}, {en:"村",ko:"마을 촌",tip:""}, {en:"秋",ko:"가을 추",tip:""}, {en:"春",ko:"봄 춘",tip:""},
      {en:"出",ko:"날 출",tip:""}, {en:"便",ko:"편할 편",tip:""}, {en:"夏",ko:"여름 하",tip:""}, {en:"花",ko:"꽃 화",tip:""}, {en:"休",ko:"쉴 휴",tip:""},
    ]
  },
];

// ── 학년 내 단어 배치 셔플 (고정 시드) ──────────────────────────
// 각 학년(초등 1~8 / 중학 9~14 / 고등 15~19) 안에서만 단어를 섞어,
// 스테이지 1이 'a'로만 채워지는 단조로움을 없앤다. 시드 고정이라 항상 동일 배치
// → 진행 체크/이어하기가 안정적이고 기기가 달라도 같다. 월드·스테이지 제목/개수는 유지.
const seededShuffle = (arr, seed) => {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const GRADE_RANGES = [
  { min: 1, max: 1, seed: 0x9e3779b1 },  // 8급
  { min: 2, max: 2, seed: 0x85ebca77 },  // 준7급
  { min: 3, max: 3, seed: 0xc2b2ae3d },  // 7급
];
const applyGradeShuffle = (worlds) => {
  const result = worlds.map(w => ({ ...w }));
  for (const g of GRADE_RANGES) {
    const idxs = result.map((w, i) => i).filter(i => result[i].id >= g.min && result[i].id <= g.max);
    if (!idxs.length) continue;
    const flat = idxs.flatMap(i => result[i].words);
    const shuffled = seededShuffle(flat, g.seed);
    let p = 0;
    for (const i of idxs) {
      const len = result[i].words.length;
      result[i] = { ...result[i], words: shuffled.slice(p, p + len) };
      p += len;
    }
  }
  return result;
};
const WORLDS = applyGradeShuffle(RAW_WORLDS);

const PASS_RATE     = 0.7;
const STAGE_SIZE    = 20;   // 한 스테이지당 단어 수
const XP_CORRECT    = 10;
const XP_WORLD      = 200;
const SWIPE_THRESH  = 80;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getStageCount = (world) => Math.ceil(world.words.length / STAGE_SIZE);

const initProgress = () => WORLDS.map(w => ({
  worldId: w.id,
  mastered: [],
  failed: [],
  cleared: false,
  stageCleared: new Array(getStageCount(w)).fill(false), // 70% 통과(잠금해제용)
  stageDone:    new Array(getStageCount(w)).fill(false), // 끝까지 풂(체크 표시용, 점수 무관)
}));

// ── 진행 상태 영구 저장 (localStorage) ───────────────────
// 모바일 브라우저는 홈 이동/탭 전환 시 페이지를 재로드하므로
// React 메모리 state만으로는 진행 기록이 사라진다 → localStorage에 영속화.
const PROGRESS_KEY = "hanjagame_progress_v1";

// 저장된 진행 기록을 현재 WORLDS 구조에 맞춰 병합해 복원.
// (한자장/스테이지 수가 바뀌어도 안전)
const loadProgress = () => {
  const base = initProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    const savedProgress = Array.isArray(saved?.progress) ? saved.progress : [];
    const merged = base.map((w) => {
      const s = savedProgress.find((p) => p && p.worldId === w.id);
      if (!s) return w;
      const stageCleared = w.stageCleared.map((v, i) =>
        Array.isArray(s.stageCleared) ? !!s.stageCleared[i] : v
      );
      const stageDone = w.stageDone.map((v, i) =>
        Array.isArray(s.stageDone) ? !!s.stageDone[i] : (stageCleared[i] || v)
      );
      return {
        ...w,
        mastered: Array.isArray(s.mastered) ? s.mastered : [],
        failed:   Array.isArray(s.failed)   ? s.failed   : [],
        cleared:  stageCleared.length > 0 && stageCleared.every(Boolean),
        stageCleared,
        stageDone,
      };
    });
    // 내한자장(커스텀) 진행기록도 보존 — base에 없는 worldId 엔트리 복원
    const baseIds = new Set(base.map((w) => w.id));
    const extra = savedProgress
      .filter((p) => p && !baseIds.has(p.worldId))
      .map((p) => ({
        worldId: p.worldId,
        mastered: Array.isArray(p.mastered) ? p.mastered : [],
        failed:   Array.isArray(p.failed)   ? p.failed   : [],
        cleared:  !!p.cleared,
        stageCleared: Array.isArray(p.stageCleared) ? p.stageCleared : [false],
        stageDone:    Array.isArray(p.stageDone)    ? p.stageDone    : [false],
      }));
    return [...merged, ...extra];
  } catch (e) {
    return base;
  }
};

const loadStat = (key, fallback) => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    const v = saved?.[key];
    return typeof v === "number" && !isNaN(v) ? v : fallback;
  } catch (e) {
    return fallback;
  }
};

// ── 메인 앱 ────────────────────────────────────────────────

// ── 커스텀 한자장 파싱 ──────────────────────────────────
const parseCustomWords = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([^\t, ]+)[\t, ]+(.+)$/);
    if (match) {
      result.push({ en: match[1].trim(), ko: match[2].trim(), tip: "" });
    } else {
      result.push({ en: trimmed, ko: "", tip: "" });
    }
  }
  return result;
};

export default function HanjaGame() {
  usePageSeo({
    title: "한국어문회 한자 플래시카드 | 8급·준7급·7급 한자능력검정",
    description: "한국어문회 한자능력검정시험 8급·준7급·7급 한자를 플래시카드로 재미있게 암기. 나만의 한자장도 직접 추가. 가입 없이 무료 학습.",
    keywords: "한자 암기, 한자 플래시카드, 한국어문회, 한자능력검정시험, 8급 한자, 준7급 한자, 7급 한자, 한자장, 한자 앱",
    url: "https://fun.uncledison.com/hanja",
    image: "https://fun.uncledison.com/assets/hanja_kakao.png",
  });
  usePwaManifest('hanja');
  const [progress,        setProgress]        = useState(loadProgress);
  const [xp,              setXp]              = useState(() => loadStat("xp", 0));
  const [streak,          setStreak]          = useState(() => loadStat("streak", 0));
  const [screen,          setScreen]          = useState(() => {
    try {
      if (localStorage.getItem("hanja_custom_only_mode") === "true") return "customVocab";
      // 학년을 한 번이라도 골랐으면(열어뒀으면) 맵으로 복귀
      try {
        const us = JSON.parse(localStorage.getItem('hanjagame_unlocked_starts') || '[]');
        if (Array.isArray(us) && us.length > 0) return "map";
      } catch(e) {}
      // 저장된 진행 기록이 있으면 레벨선택 화면을 건너뛰고 맵으로 복귀.
      // 모바일 재로드 시 1판부터 다시 시작되던 오류 방지.
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const hasProgress = Array.isArray(saved?.progress) && saved.progress.some(p =>
          (p?.mastered?.length || p?.failed?.length || p?.cleared ||
           (Array.isArray(p?.stageCleared) && p.stageCleared.some(Boolean)))
        );
        if (hasProgress) return "map";
      }
      return "levelselect";
    } catch(e) { return "levelselect"; }
  });
  const [activeWorld,     setActiveWorld]     = useState(null);
  const [activeStage,     setActiveStage]     = useState(0);    // 현재 스테이지 (0부터)
  const [queue,           setQueue]           = useState([]);
  const [cardIdx,         setCardIdx]         = useState(0);
  const [flipped,         setFlipped]         = useState(false);
  const [swipeDir,        setSwipeDir]        = useState(null);
  const [dragX,           setDragX]           = useState(0);
  const [isDragging,      setIsDragging]      = useState(false);
  const [sessionCorrect,  setSessionCorrect]  = useState(0);
  const [sessionTotal,    setSessionTotal]    = useState(0);
  const [combo,           setCombo]           = useState(0);
  const [comboPopup,      setComboPopup]      = useState(false);
  const [animKey,         setAnimKey]         = useState(0);
  const [speakingWord,    setSpeakingWord]    = useState(null); // 발음 재생 중인 단어
  const [finalCorrect,    setFinalCorrect]    = useState(0);
  const [finalTotal,      setFinalTotal]      = useState(0);
  const [isReview,        setIsReview]        = useState(false); // 복습 모드 여부
  const [tab,             setTab]             = useState("map");  // map | vocab
  const [vocabFilter,     setVocabFilter]     = useState("mastered");  // all | mastered | failed
  const [expandedCard,    setExpandedCard]    = useState(null);   // 펼친 단어 en
  const [searchQuery,    setSearchQuery]    = useState("");      // 검색어
  const [showLevelConfirm, setShowLevelConfirm] = useState(false); // 레벨변경 확인 팝업
  const [showQuitConfirm, setShowQuitConfirm]   = useState(false); // 게임 중 나가기 팝업
  const [quitTarget,      setQuitTarget]        = useState("map"); // 나가기 후 이동할 탭
  const [participantCount, setParticipantCount] = useState(null); // 오늘 참여자 수
  // ── 로그인/동기화 상태 ──────────────
  const [session,         setSession]         = useState(null);  // Supabase 세션(로그인 여부)
  const [approved,        setApproved]        = useState(null);  // null=확인중, true/false=승인여부
  const [membership,      setMembership]      = useState("regular"); // regular | vip
  const [isAdmin,         setIsAdmin]         = useState(false);  // 관리자(CEO)
  // ── 공유(일촌/전송) ──────────────
  const [myHandle,        setMyHandle]        = useState("");
  const [connections,     setConnections]     = useState([]);     // [{other_id,name,handle}]
  const [inbox,           setInbox]           = useState([]);     // 받은 한자장(대기)
  const [invitePrompt,    setInvitePrompt]    = useState(null);   // {handle} 초대 수락 팝업
  const [sendModalSet,    setSendModalSet]    = useState(null);   // 전송할 단어셋
  const [sendHandle,      setSendHandle]      = useState("");     // VIP·CEO용 직접 입력
  const [shareMsg,        setShareMsg]        = useState("");     // 토스트성 안내
  const [connAlias,       setConnAlias]       = useState(() => {  // 일촌 별명 {other_id: "엄마"}
    try { return JSON.parse(localStorage.getItem("hanjagame_conn_alias") || "{}"); } catch (e) { return {}; }
  });
  const [avatar,          setAvatar]          = useState(() => { try { return localStorage.getItem("hanjagame_avatar") || ""; } catch(e) { return ""; } });
  const AVATARS = [
    // 동물 1 (28)
    "🦊","🐱","🐶","🐼","🐯","🦁","🐰","🐸","🐧","🐵","🐨","🦄","🐢","🐙","🐝","🐳","🦉","🐹","🦋","🐘","🦒","🦓","🦏","🦛","🐊","🐬","🦈","🐅",
    // 동물 2 (28)
    "🦌","🐄","🐖","🐑","🐐","🦔","🦇","🦅","🦜","🦚","🦢","🐍","🦎","🐌","🐞","🐜","🐺","🦝","🦦","🦥","🦫","🦡","🐿️","🦃","🦩","🕊️","🦖","🦕",
    // 직업·되고 싶은 것 + 식물 (28)
    "👨‍⚕️","👩‍⚕️","🧑‍🚒","👮","🧑‍🍳","🧑‍🏫","🧑‍🔬","🧑‍🌾","🧑‍✈️","🧑‍🚀","🧑‍🎨","🧑‍💻","🧑‍⚖️","🧑‍🏭","🧑‍🔧","🧑‍🎤","🕵️","💂","🤵","👰","🦸","🌱","🌷","🌻","🌹","🌸","🌵","🌳",
    // 표정 (28)
    "😀","😄","😁","😆","😅","😂","🤣","😊","🙂","😉","😍","🥰","😘","😎","🤩","🥳","😏","🤗","🤔","🤓","🧐","😜","🤪","😝","🤠","🥸","😇","🤡",
  ];
  const AVATAR_PER_PAGE = 28;
  const avatarPageCount = Math.ceil(AVATARS.length / AVATAR_PER_PAGE);
  const [avatarPage, setAvatarPage] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const avatarTouchRef = useRef(0);
  const pickAvatar = (em) => { setAvatar(em); try { localStorage.setItem("hanjagame_avatar", em); } catch(e) {} };
  const [nickname, setNickname] = useState(() => { try { return localStorage.getItem("hanjagame_nickname") || ""; } catch(e) { return ""; } });
  const changeNickname = (v) => { setNickname(v); try { localStorage.setItem("hanjagame_nickname", v); } catch(e) {} };
  const [showAuthModal,   setShowAuthModal]   = useState(false);
  const [authEmail,       setAuthEmail]       = useState("");
  const [authStatus,      setAuthStatus]      = useState("");    // "" | sending | sent | error
  const [authError,       setAuthError]       = useState("");    // 실제 에러 메시지
  const syncedRef = useRef(false);
  // 비로그인 3 / 로그인(일반) 5 / VIP·CEO 무한(내부 상한 100)
  const maxSets = (session && approved === true)
    ? ((membership === "vip" || isAdmin) ? 100 : 5)
    : 3;
  const maxSetsLabel = maxSets >= 100 ? "무한" : String(maxSets);
  const [customWorlds, setCustomWorlds] = useState(() => {
    try {
      const stored = localStorage.getItem('hanja_custom_worlds');
      return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
  });
  const [customTitle, setCustomTitle] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [editingId, setEditingId] = useState(null);          // 편집 중인 커스텀 세트 id (null=새로 만들기)
  const [resumePrompt, setResumePrompt] = useState(null);    // 이어/처음 선택 팝업 대상 세트
  const [customResume, setCustomResume] = useState(() => {    // 세트별 이어하기 북마크
    try { return JSON.parse(localStorage.getItem('hanja_custom_resume') || '{}'); } catch(e) { return {}; }
  });
  const saveCustomResume = (id, rec) => {
    setCustomResume(prev => {
      const next = { ...prev, [id]: rec };
      try { localStorage.setItem('hanja_custom_resume', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const clearCustomResume = (id) => {
    setCustomResume(prev => {
      const next = { ...prev }; delete next[id];
      try { localStorage.setItem('hanja_custom_resume', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const [customOnlyMode, setCustomOnlyMode] = useState(() => {
    try { return localStorage.getItem('hanja_custom_only_mode') === 'true'; } catch(e) { return false; }
  });
  // 사용자가 "열어둔" 학년 시작 월드 id 목록 (학년 선택은 비파괴 — 진도 초기화 안 함)
  const [unlockedStarts, setUnlockedStarts] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem('hanjagame_unlocked_starts') || '[]'); return Array.isArray(v) ? v : []; } catch(e) { return []; }
  });
  const unlockGradeStart = (worldId) => {
    setUnlockedStarts(prev => {
      const next = prev.includes(worldId) ? prev : [...prev, worldId];
      try { localStorage.setItem('hanjagame_unlocked_starts', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const levelStartWorldRef = useRef(loadStat("levelStartWorld", 1));   // 현재 선택된 레벨의 시작 월드 ID (복원)
  const scrollTargetRef = useRef(levelStartWorldRef.current > 1 ? levelStartWorldRef.current : null);   // 맵 진입 시 스크롤 대상 (ref로 클로저 문제 방지)
  const [scrollTrigger, setScrollTrigger] = useState(0); // 스크롤 강제 실행 트리거

  const touchStartX = useRef(0);
  const touchCurX   = useRef(0);
  const processingRef = useRef(false);

  // ── 진행 상태 영구 저장 ────────────────────────────────
  // progress/xp/streak이 바뀔 때마다 localStorage에 저장 →
  // 모바일에서 페이지 재로드돼도 클리어한 스테이지가 유지된다.
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ progress, xp, streak, levelStartWorld: levelStartWorldRef.current }));
    } catch (e) { /* 저장 실패 무시 */ }
  }, [progress, xp, streak]);

  // ── 로그인 후 클라우드 상태를 화면에 반영 ──────────────
  const reloadStatesFromLocal = () => {
    try { setProgress(loadProgress()); } catch (e) {}
    setXp(loadStat("xp", 0));
    setStreak(loadStat("streak", 0));
    try { setCustomWorlds(JSON.parse(localStorage.getItem("hanja_custom_worlds") || "[]")); } catch (e) {}
    try { setCustomResume(JSON.parse(localStorage.getItem("hanja_custom_resume") || "{}")); } catch (e) {}
    try { setUnlockedStarts(JSON.parse(localStorage.getItem("hanjagame_unlocked_starts") || "[]")); } catch (e) {}
    setCustomOnlyMode(localStorage.getItem("hanja_custom_only_mode") === "true");
    try { setAvatar(localStorage.getItem("hanjagame_avatar") || ""); } catch (e) {}
    try { setNickname(localStorage.getItem("hanjagame_nickname") || ""); } catch (e) {}
  };
  // 로그인 감지 시: 승인 여부 확인 → 승인된 경우에만 동기화
  const handleSignedIn = async (userId) => {
    let isApproved = false;
    try {
      const { data } = await supabase
        .from("profiles").select("approved, membership_level, is_admin").eq("id", userId).maybeSingle();
      isApproved = !!data?.approved;
      setApproved(isApproved);
      setMembership(data?.membership_level || "regular");
      setIsAdmin(!!data?.is_admin);
    } catch (e) {
      setApproved(false);
    }
    if (!isApproved) return;            // 미승인 → 동기화 안 함 (대기 화면 표시)
    if (syncedRef.current) return;
    syncedRef.current = true;
    const cloud = await pullCloud(userId);
    if (cloud && Object.keys(cloud).length) {
      applyLocalState(cloud);
      reloadStatesFromLocal();
    } else {
      await pushCloud(userId);
    }
  };

  // ── 세션 감지 (마운트 시 + 변경 시) ──────────────
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) handleSignedIn(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) handleSignedIn(sess.user.id);
      else { syncedRef.current = false; setApproved(null); setIsAdmin(false); }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  // ── 공유: 로그인 시 핸들·일촌·받은한자장 로드 ──────────────
  useEffect(() => {
    if (!session) { setMyHandle(""); setConnections([]); setInbox([]); return; }
    (async () => {
      const h = await ensureHandle(session.user.id);
      if (h) setMyHandle(h);
      setConnections(await listConnections());
      setInbox(await listInbox());
      try { setConnAlias(JSON.parse(localStorage.getItem("hanjagame_conn_alias") || "{}")); } catch (e) {}
    })();
  }, [session]);

  const setConnAliasFor = (otherId, name) => {
    setConnAlias(prev => {
      const next = { ...prev };
      if (name && name.trim()) next[otherId] = name.trim(); else delete next[otherId];
      try { localStorage.setItem("hanjagame_conn_alias", JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };
  const renameConn = (otherId, currentName) => {
    const v = prompt("이 일촌의 별명 (예: 엄마, 아빠, 동생)", connAlias[otherId] || currentName || "");
    if (v === null) return;
    setConnAliasFor(otherId, v);
  };
  const removeConn = async (otherId, label) => {
    if (!confirm(`'${label}'님과 일촌을 끊을까요?\n(이미 받은 한자장은 그대로 남아요)`)) return;
    await removeConnection(otherId, session.user.id);
    setConnAliasFor(otherId, "");
    refreshSharing();
    setShareMsg("일촌을 끊었어요");
    setTimeout(() => setShareMsg(""), 2500);
  };

  // 초대링크(?invite=핸들) 감지 — 로그인 왕복에도 유지되도록 localStorage 보관
  useEffect(() => {
    try {
      const inv = new URLSearchParams(window.location.search).get("invite");
      if (inv) { localStorage.setItem("pending_invite", inv); setInvitePrompt({ handle: inv }); }
      else {
        const saved = localStorage.getItem("pending_invite");
        if (saved) setInvitePrompt({ handle: saved });
      }
    } catch (e) {}
  }, []);

  const refreshSharing = async () => {
    setConnections(await listConnections());
    setInbox(await listInbox());
  };
  const copyInviteLink = () => {
    const link = `https://fun.uncledison.com/api/invite?u=${myHandle}`;
    try { navigator.clipboard.writeText(link); } catch (e) {}
    setShareMsg("초대링크 복사됨! 카톡으로 붙여넣어 보내세요 📋");
    setTimeout(() => setShareMsg(""), 3500);
  };
  const dismissInvite = () => {
    setInvitePrompt(null);
    try { localStorage.removeItem("pending_invite"); } catch (e) {}
  };
  const doAcceptInvite = async () => {
    if (!session) { setShowAuthModal(true); return; }
    const r = await acceptInvite(invitePrompt.handle, session.user.id);
    if (r.ok) {
      setShareMsg(`${r.name}님과 일촌이 됐어요! 🤝`);
      setInvitePrompt(null);
      try { localStorage.removeItem("pending_invite"); } catch (e) {}
      refreshSharing();
      try { const u = new URL(window.location.href); u.searchParams.delete("invite"); window.history.replaceState({}, "", u.toString()); } catch (e) {}
    } else { setShareMsg(r.error || "일촌 맺기 실패"); }
    setTimeout(() => setShareMsg(""), 3500);
  };
  const importTransfer = (t) => {
    const words = Array.isArray(t.words) ? t.words : [];
    const newWorld = { id: 1000 + Date.now() % 100000, title: t.title || "받은 한자장", emoji: "📩", color: "#A78BFA", dark: "#6d28d9", desc: "받은 한자장", words, isCustom: true };
    const next = [...customWorlds, newWorld];
    setCustomWorlds(next);
    try { localStorage.setItem("hanja_custom_worlds", JSON.stringify(next)); } catch (e) {}
    deleteTransfer(t.id);
    setInbox(prev => prev.filter(x => x.id !== t.id));
    setShareMsg("내 한자장에 추가됐어요! ✅");
    setTimeout(() => setShareMsg(""), 3000);
  };
  const doSendSet = async (toUserId) => {
    if (!sendModalSet) return;
    const fromName = nickname.trim() || session?.user?.user_metadata?.name || "익명";
    const ok = await sendSet(toUserId, fromName, sendModalSet.title, sendModalSet.words);
    setSendModalSet(null); setSendHandle("");
    setShareMsg(ok ? "전송 완료! 상대의 '받은 한자장'에 도착해요 📤" : "전송 실패");
    setTimeout(() => setShareMsg(""), 3500);
  };
  const doSendByHandle = async () => {
    const u = await lookupUser(sendHandle);
    if (!u) { setShareMsg("그 아이디를 못 찾았어요"); setTimeout(() => setShareMsg(""), 3000); return; }
    await doSendSet(u.id);
  };
  const canSendFree = (membership === "vip" || isAdmin); // VIP·CEO는 아무에게나

  // 공유 모달들 (컴포넌트 아닌 함수 렌더 — 입력 포커스 유지)
  const renderInviteModal = () => {
    if (!invitePrompt) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "0 24px" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "32px 26px", maxWidth: 340, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🤝</div>
          <h3 style={{ color: "#fff", fontSize: 19, fontWeight: 900, margin: "0 0 10px" }}>일촌 신청이 왔어요!</h3>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, margin: "0 0 22px" }}><b style={{ color: "#A78BFA" }}>@{invitePrompt.handle}</b> 님과<br />일촌을 맺을까요?</p>
          <button onClick={doAcceptInvite} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#A78BFA,#6d28d9)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>수락하기</button>
          <button onClick={dismissInvite} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>나중에</button>
        </div>
      </div>
    );
  };
  const renderSendModal = () => {
    if (!sendModalSet) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "0 24px" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "28px 22px", maxWidth: 360, width: "100%" }}>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 4px", textAlign: "center" }}>📤 한자장 보내기</h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center", margin: "0 0 18px" }}>"{sendModalSet.title}" ({sendModalSet.words.length}개)</p>
          {canSendFree && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>아이디로 보내기 (VIP·CEO)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={sendHandle} onChange={e => setSendHandle(e.target.value)} placeholder="@아이디"
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
                <button onClick={doSendByHandle} style={{ padding: "0 16px", background: "#FF8C00", border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, cursor: "pointer" }}>보내기</button>
              </div>
            </div>
          )}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>일촌에게 보내기</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
            {connections.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "center", padding: "16px" }}>아직 일촌이 없어요.<br />계정에서 초대링크를 보내 일촌을 맺어보세요.</div>
            ) : connections.map(c => (
              <button key={c.other_id} onClick={() => doSendSet(c.other_id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", background: "rgba(167,139,250,0.1)", border: "1px solid #A78BFA40", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <span>{connAlias[c.other_id] || c.name}</span><span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>@{c.handle} 📤</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setSendModalSet(null); setSendHandle(""); }} style={{ width: "100%", padding: "12px", marginTop: 14, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>닫기</button>
        </div>
      </div>
    );
  };
  const renderShareToast = () => {
    if (!shareMsg) return null;
    return (
      <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 1300, background: "#1a1a2e", border: "1px solid #A78BFA55", borderRadius: 16, padding: "12px 20px", color: "#fff", fontSize: 13, fontWeight: 700, maxWidth: 320, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>{shareMsg}</div>
    );
  };

  // ── 로그인 상태에서 변경되면 클라우드에 자동 저장 (디바운스) ──────────────
  useEffect(() => {
    if (!session || approved !== true) return;   // 승인된 경우에만 클라우드 저장
    const t = setTimeout(() => { pushCloud(session.user.id); }, 1500);
    return () => clearTimeout(t);
  }, [session, approved, progress, xp, streak, customWorlds, customResume, customOnlyMode, unlockedStarts, avatar, nickname]);

  // ── 로그인 액션 ──────────────
  const sendMagicLink = async () => {
    const email = authEmail.trim();
    if (!email) return;
    setAuthStatus("sending");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/hanja" },
      });
      if (error) { setAuthError(error.message || "전송 실패"); setAuthStatus("error"); }
      else setAuthStatus("sent");
    } catch (e) {
      setAuthError(String((e as any)?.message || e)); setAuthStatus("error");
    }
  };
  // 소셜 로그인 (카카오/구글)
  const signInWithProvider = async (provider) => {
    try {
      const options: any = { redirectTo: window.location.origin + "/hanja" };
      // 카카오: scope를 직접 덮어써서 Supabase가 강제하는 account_email을 제거
      // (이메일 동의항목/비즈앱 없이 닉네임·프로필만으로 로그인)
      if (provider === "kakao") {
        options.scopes = "profile_nickname profile_image";
        options.queryParams = { scope: "profile_nickname profile_image" };
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider, options });
      if (error) { setAuthError(error.message); setAuthStatus("error"); }
    } catch (e) {
      setAuthError(String((e as any)?.message || e)); setAuthStatus("error");
    }
  };
  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    syncedRef.current = false;
    setSession(null);
    setApproved(null);
    setIsAdmin(false);
    setShowAuthModal(false);
  };

  // ── 로그인/계정 모달 (컴포넌트 아닌 함수 렌더 — 입력 포커스 유지) ──────────────
  const renderAuthModal = () => {
    if (!showAuthModal) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "0 24px" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, maxWidth: 360, width: "100%", maxHeight: "88vh", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <button onClick={() => { setShowAuthModal(false); setAuthStatus(""); }} aria-label="닫기" style={{ position: "absolute", top: 12, right: 12, zIndex: 2, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 17, lineHeight: 1, cursor: "pointer" }}>✕</button>
          <div style={{ padding: "32px 26px", textAlign: "center", overflowY: "auto" }}>
          {session ? (
            <>
              <div style={{ fontSize: 50, marginBottom: 8, lineHeight: 1 }}>{avatar || "👤"}</div>
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 4px" }}>
                {nickname.trim() || session.user?.user_metadata?.name || session.user?.user_metadata?.full_name || (session.user?.email || "").split("@")[0]}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 10px" }}>{session.user.email}</p>
              <div style={{ display: "inline-block", fontSize: 12, margin: "0 0 6px", padding: "3px 12px", borderRadius: 20, fontWeight: 800,
                background: isAdmin ? "rgba(255,107,0,0.15)" : membership === "vip" ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.06)",
                color: isAdmin ? "#FF8C00" : membership === "vip" ? "#FFB800" : "rgba(255,255,255,0.4)" }}>
                {isAdmin ? "👔 CEO" : membership === "vip" ? "👑 VIP 회원" : "일반 회원"}
              </div>
              <p style={{ color: "#FFB800", fontSize: 13, fontWeight: 800, margin: "6px 0 16px" }}>🏆 외운 한자 {totalMasteredCount}자 · Lv.{level}</p>
              <div style={{ margin: "0 0 16px", textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>별명</div>
                <input value={nickname} onChange={e => changeNickname(e.target.value)} maxLength={12}
                  placeholder={session.user?.user_metadata?.name || "별명을 입력하세요"}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div style={{ margin: "0 0 18px" }}>
                {!showAvatarPicker ? (
                  <button onClick={() => setShowAvatarPicker(true)} style={{ width: "100%", padding: "11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🎨 아바타 바꾸기 {avatar || "👤"}</button>
                ) : (<>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>아바타 고르기 ✨ <span style={{ color: "rgba(255,255,255,0.25)" }}>(좌우로 넘기기)</span></div>
                <div
                  onTouchStart={(e) => { avatarTouchRef.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - avatarTouchRef.current;
                    if (dx < -40) setAvatarPage(p => Math.min(p + 1, avatarPageCount - 1));
                    else if (dx > 40) setAvatarPage(p => Math.max(p - 1, 0));
                  }}
                  style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
                  {AVATARS.slice(avatarPage * AVATAR_PER_PAGE, avatarPage * AVATAR_PER_PAGE + AVATAR_PER_PAGE).map((em, i) => (
                    <button key={avatarPage + "-" + i} onClick={() => pickAvatar(em)} style={{ aspectRatio: "1", padding: 0, fontSize: 18, borderRadius: 9, cursor: "pointer", border: avatar === em ? "2px solid #FF8C00" : "1px solid rgba(255,255,255,0.1)", background: avatar === em ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.04)" }}>{em}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 10 }}>
                  <button onClick={() => setAvatarPage(p => Math.max(p - 1, 0))} disabled={avatarPage === 0} style={{ background: "none", border: "none", color: avatarPage === 0 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 24, fontWeight: 900, cursor: "pointer", padding: "0 6px", lineHeight: 1 }}>‹</button>
                  <div style={{ display: "flex", gap: 6 }}>
                    {Array.from({ length: avatarPageCount }).map((_, i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i === avatarPage ? "#FF8C00" : "rgba(255,255,255,0.2)" }} />
                    ))}
                  </div>
                  <button onClick={() => setAvatarPage(p => Math.min(p + 1, avatarPageCount - 1))} disabled={avatarPage === avatarPageCount - 1} style={{ background: "none", border: "none", color: avatarPage === avatarPageCount - 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 24, fontWeight: 900, cursor: "pointer", padding: "0 6px", lineHeight: 1 }}>›</button>
                </div>
                </>)}
              </div>
              {myHandle && (
                <div style={{ margin: "0 0 16px", textAlign: "left", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>내 아이디 · 일촌 {connections.length > 0 && `${connections.length}명`}</div>
                  <div style={{ color: "#A78BFA", fontWeight: 800, fontSize: 15, marginBottom: 10 }}>@{myHandle}</div>
                  {connections.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                      {connections.map(c => {
                        const label = connAlias[c.other_id] || c.name;
                        return (
                          <div key={c.other_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "9px 12px" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
                              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>@{c.handle}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button onClick={() => renameConn(c.other_id, c.name)} style={{ padding: "6px 9px", background: "rgba(167,139,250,0.12)", border: "none", borderRadius: 9, color: "#A78BFA", fontSize: 12, cursor: "pointer" }}>✏️ 별명</button>
                              <button onClick={() => removeConn(c.other_id, label)} style={{ padding: "6px 9px", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 9, color: "#EF4444", fontSize: 12, cursor: "pointer" }}>끊기</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={copyInviteLink} style={{ width: "100%", padding: "12px", background: "rgba(167,139,250,0.15)", border: "1px solid #A78BFA55", borderRadius: 14, color: "#C4B5FD", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🔗 일촌 초대링크 복사</button>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>복사해서 카톡으로 가족에게 보내세요</div>
                </div>
              )}
              {isAdmin && (
                <button onClick={() => { window.location.href = "/admin.html"; }} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>📋 승인 대시보드 바로가기</button>
              )}
              <button onClick={signOut} style={{ width: "100%", padding: "14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, color: "#EF4444", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>로그아웃</button>
              <button onClick={() => setShowAuthModal(false)} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>닫기</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>로그인</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>로그인하면 내 한자장·진도가 클라우드에 저장돼요.<br />폰을 바꾸거나 잃어버려도 그대로 복구! 📱➡️💻</p>

              {/* 소셜 로그인 */}
              <button onClick={() => signInWithProvider("kakao")} style={{ width: "100%", padding: "14px", background: "#FEE500", border: "none", borderRadius: 14, color: "#191600", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                💬 카카오로 로그인
              </button>
              <button onClick={() => signInWithProvider("google")} style={{ width: "100%", padding: "14px", background: "#fff", border: "none", borderRadius: 14, color: "#1a1a1a", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ color: "#4285F4" }}>G</span> 구글로 로그인
              </button>

              {authStatus === "error" && <div style={{ color: "#EF4444", fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>{authError || "로그인 실패. 다시 시도해주세요."}</div>}

              <button onClick={() => { setShowAuthModal(false); setAuthStatus(""); }} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>닫기</button>
            </>
          )}
          </div>
        </div>
      </div>
    );
  };

  // ── 참여자 수 계산 (시간대별 기반 + localStorage 누적) ───────────────
  useEffect(() => {
    // 한자는 영단어보다 20~40명 적게 보이도록 기준치를 약 30 낮춤
    const calculateBaseCount = (hour, minutes) => {
      let base = 0;
      if (hour < 6) base = 9;
      else if (hour < 9) base = 15;
      else if (hour < 12) base = 65;
      else if (hour < 14) base = 110;
      else if (hour < 18) base = 180;
      else if (hour < 22) base = 250;
      else base = 130;
      return base + Math.floor(minutes * 0.4);
    };
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const storageKey = `hanjagame_participants_${dateKey}`;
    const stored = localStorage.getItem(storageKey);
    const newBase = calculateBaseCount(now.getHours(), now.getMinutes());
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let nextCount = parsed.count;
        const timeDiff = now.getTime() - new Date(parsed.timestamp).getTime();
        if (timeDiff > 1000 * 60 * 3) nextCount += Math.floor(Math.random() * 3) + 1;
        else if (timeDiff > 1000 * 30 && nextCount <= newBase) nextCount += 1;
        if (nextCount < newBase) nextCount = newBase + Math.floor(Math.random() * 5);
        setParticipantCount(nextCount);
        localStorage.setItem(storageKey, JSON.stringify({ count: nextCount, timestamp: now.toISOString() }));
      } catch(e) {
        const c = newBase + Math.floor(Math.random() * 5);
        setParticipantCount(c);
        localStorage.setItem(storageKey, JSON.stringify({ count: c, timestamp: now.toISOString() }));
      }
    } else {
      const c = newBase + Math.floor(Math.random() * 5);
      setParticipantCount(c);
      localStorage.setItem(storageKey, JSON.stringify({ count: c, timestamp: now.toISOString() }));
    }
  }, []);

  const level   = Math.floor(xp / 100) + 1;
  const xpMod   = xp % 100;

  // ── 해당 월드로 스크롤 (scrollTrigger 증가 시 항상 실행) ────────────
  useLayoutEffect(() => {
    if (!scrollTargetRef.current) return;
    const targetId = scrollTargetRef.current;
    scrollTargetRef.current = null;
    const HEADER = 175;
    const el = document.getElementById(`world-card-${targetId}`);
    if (el) {
      let top = 0;
      let cur = el;
      while (cur) { top += cur.offsetTop; cur = cur.offsetParent; }
      const target = Math.max(0, top - HEADER);
      document.documentElement.scrollTop = target;
      document.body.scrollTop = target;
    }
  }, [scrollTrigger]);

  const worlds = WORLDS.map((w, i) => {
    if (i === 0) return { ...w, unlocked: true };
    const prev = progress[i - 1];
    // 학년 선택으로 열어둔 시작 월드 OR 이전 월드 클리어 OR mastered 70% 이상이면 해제
    const unlocked = unlockedStarts.includes(w.id)
      || prev?.cleared
      || (prev ? prev.mastered.length / WORLDS[i - 1].words.length >= PASS_RATE : false);
    return { ...w, unlocked };
  });

  // ── 스테이지 단어 추출 헬퍼 ──────────────
  const getStageWords = (world, stageIdx) => {
    const start = stageIdx * STAGE_SIZE;
    return world.words.slice(start, start + STAGE_SIZE);
  };

  const getNextStage = (world, stageIdx) => {
    const totalStages = getStageCount(world);
    // 다음 스테이지 찾기 — 현재 이후 중 미클리어된 첫 번째
    for (let i = stageIdx + 1; i < totalStages; i++) {
      const p = progress.find(p => p.worldId === world.id);
      if (!p?.stageCleared[i]) return i;
    }
    // 모두 클리어면 0번부터 다시
    return 0;
  };

  // ── 게임 시작 (스테이지 기반 + 스테이지 도중 이어하기) ────────────
  const startWorld = (world, stageIdx = null) => {
    if (!world.unlocked) return;
    const p = progress.find(p => p.worldId === world.id);

    // 스테이지 도중에 저장한 북마크가 있으면 그 위치부터 이어하기
    // (명시적 stageIdx가 주어지면 = "다음 스테이지" 등 → 이어하기 무시)
    const rec = customResume[world.id];
    const canResume = stageIdx === null && rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length;

    let targetStage, queueArr, startIdx, correct, total;
    if (canResume) {
      targetStage = rec.stage || 0;
      const byEn = Object.fromEntries(world.words.map(w => [w.en, w]));
      queueArr = rec.order.map(en => byEn[en]).filter(Boolean);
      startIdx = Math.min(rec.pos, Math.max(0, queueArr.length - 1));
      correct = rec.correct || 0;
      total = rec.total || 0;
    } else {
      // 스테이지 결정 — 명시적으로 전달되면 그거, 아니면 첫 미클리어 스테이지
      targetStage = stageIdx;
      if (targetStage === null) {
        const totalStages = getStageCount(world);
        targetStage = 0;
        for (let i = 0; i < totalStages; i++) {
          if (!p?.stageCleared?.[i]) { targetStage = i; break; }
        }
      }
      const stageWords = getStageWords(world, targetStage);
      const failed = stageWords.filter(w => p?.failed.includes(w.en));   // 틀린 단어 우선
      const others = shuffle(stageWords.filter(w => !p?.failed.includes(w.en)));
      queueArr = [...failed, ...others];
      startIdx = 0; correct = 0; total = 0;
      clearCustomResume(world.id);   // 새 스테이지 시작 → 오래된 북마크 제거
    }

    setActiveWorld(world);
    setActiveStage(targetStage);
    setQueue(queueArr);
    setCardIdx(startIdx);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(correct);
    setSessionTotal(total);
    setCombo(0);
    setIsReview(false);
    processingRef.current = false;
    setScreen("game");
  };


  // 커스텀 세트의 진행 북마크가 유효한지 (중간에 멈춘 상태)
  const hasResume = (world) => {
    const rec = customResume[world.id];
    return !!(rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length);
  };

  // 세트 클릭 → 진행 중이면 이어/처음 팝업, 아니면 바로 시작
  const openCustomWorld = (world) => {
    if (hasResume(world)) setResumePrompt(world);
    else startCustomWorld(world, false);
  };

  // resume=true 이어서 하기 / false 처음부터
  const startCustomWorld = (world, resume) => {
    let currentProgress = [...progress];
    let p = currentProgress.find(p => p.worldId === world.id);
    if (!p) {
      p = { worldId: world.id, mastered: [], failed: [], cleared: false, stageCleared: [false] };
      currentProgress.push(p);
      setProgress(currentProgress);
    }

    const rec = customResume[world.id];
    let orderEns, pos, correct, total;
    if (resume && rec && Array.isArray(rec.order)) {
      orderEns = rec.order;
      pos = rec.pos || 0;
      correct = rec.correct || 0;
      total = rec.total || 0;
    } else {
      // 처음부터: 새로 섞음 + 기존 북마크 제거
      orderEns = shuffle(world.words.map(w => w.en));
      pos = 0; correct = 0; total = 0;
      clearCustomResume(world.id);
    }

    // 저장된 영어 순서로 단어 객체 복원 (편집으로 사라진 단어는 건너뜀)
    const byEn = Object.fromEntries(world.words.map(w => [w.en, w]));
    const q = orderEns.map(en => byEn[en]).filter(Boolean);
    const startIdx = Math.min(pos, Math.max(0, q.length - 1));

    setActiveWorld({ ...world, unlocked: true, isCustom: true });
    setActiveStage(0);
    setQueue(q);
    setCardIdx(startIdx);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(correct);
    setSessionTotal(total);
    setCombo(0);
    setIsReview(false);
    processingRef.current = false;
    setResumePrompt(null);
    setScreen("game");
  };

  // 현재 진행 위치를 북마크에 저장 (복습 중이면 메인 위치를 덮어쓰지 않음)
  const persistCurrentResume = () => {
    if (activeWorld && !isReview) {
      saveCustomResume(activeWorld.id, {
        order: queue.map(c => c.en),
        pos: cardIdx,
        correct: sessionCorrect,
        total: sessionTotal,
        stage: activeStage,   // 고정 한자장: 어느 스테이지인지 기억
      });
    }
  };
  // 오늘 여기까지 — 현재 위치 저장 후 홈(커스텀=내 한자장 / 고정=맵)
  const saveCustomAndExit = () => {
    persistCurrentResume();
    setShowQuitConfirm(false);
    if (activeWorld?.isCustom) {
      setScreen("customVocab");
    } else {
      if (activeWorld) { scrollTargetRef.current = activeWorld.id; setScrollTrigger(t => t + 1); }
      setScreen("map");
    }
  };
  // 틀린 문제 풀기 — 현재 위치 자동 저장 후 복습 시작
  const reviewWithSave = () => {
    persistCurrentResume();
    setShowQuitConfirm(false);
    startReview(activeWorld);
  };

  // 커스텀 세트 편집 시작 (폼에 기존 내용 채움)
  const startEditCustom = (world) => {
    setEditingId(world.id);
    setCustomTitle(world.title);
    setCustomInput(world.words.map(w => (w.ko ? `${w.en} ${w.ko}` : w.en)).join("\n"));
  };
  const cancelEditCustom = () => {
    setEditingId(null);
    setCustomTitle("");
    setCustomInput("");
  };

  // ── 복습 모드 시작 ────────────────────────
  const startReview = (world) => {
    const p = progress.find(p => p.worldId === world.id);
    const failedWords = world.words.filter(w => p.failed.includes(w.en));
    if (!failedWords.length) return;
    setActiveWorld(world);
    setQueue(shuffle(failedWords));
    setCardIdx(0);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setCombo(0);
    setIsReview(true);
    processingRef.current = false;
    setScreen("game");
  };

  // ── 스와이프 확정 ─────────────────────────
  const doSwipe = useCallback((dir) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setSwipeDir(dir);
    setIsDragging(false);

    const correct = dir === "right";
    if (navigator.vibrate) navigator.vibrate(correct ? 40 : [40, 30, 40]);

    const newCombo = correct ? combo + 1 : 0;
    const gained   = correct ? XP_CORRECT + (newCombo >= 5 ? 5 : 0) : 0;

    setCombo(newCombo);
    if (correct && newCombo > 0 && newCombo % 3 === 0) {
      setComboPopup(true);
      setTimeout(() => setComboPopup(false), 1200);
    }
    setXp(x => x + gained);
    setStreak(s => correct ? s + 1 : 0);

    const sc = sessionCorrect + (correct ? 1 : 0);
    const st = sessionTotal  + 1;
    setSessionCorrect(sc);
    setSessionTotal(st);

    // progress — 즉시 계산해서 반영 (setProgress 비동기 문제 방지)
    const en         = queue[cardIdx].en;
    const curProg    = progress.find(p => p.worldId === activeWorld.id);
    const newMastered = correct
      ? [...new Set([...curProg.mastered, en])]
      : curProg.mastered.filter(w => w !== en);
    const newFailed   = correct
      ? curProg.failed.filter(w => w !== en)
      : [...new Set([...curProg.failed, en])];

    const updatedProgress = progress.map(p => {
      if (p.worldId !== activeWorld.id) return p;
      return { ...p, mastered: newMastered, failed: newFailed };
    });
    setProgress(updatedProgress);

    setTimeout(() => {
      const nextIdx = cardIdx + 1;
      if (nextIdx >= queue.length) {
        setFinalCorrect(sc);
        setFinalTotal(st);

        // 본 학습(스테이지)을 끝까지 풂 → 이어하기 북마크 삭제 (복습 완료는 제외)
        if (!isReview) clearCustomResume(activeWorld.id);

        const count = parseInt(localStorage.getItem('play_count') || '0') + 1;
        localStorage.setItem('play_count', count.toString());
        if (!localStorage.getItem('feedback_done') && [3, 10, 25, 50].includes(count)) {
          setTimeout(() => window.dispatchEvent(new Event("showFeedback")), 1200);
        }

        if (isReview) {
          setScreen("reviewdone");
        } else {
          const passed = sc / st >= PASS_RATE;
          // 끝까지 푼 스테이지: stageDone 체크(점수 무관) + 70% 이상이면 stageCleared(잠금해제)
          const finalProgress = updatedProgress.map(p => {
            if (p.worldId !== activeWorld.id) return p;
            const cnt = getStageCount(activeWorld);
            const baseDone = Array.isArray(p.stageDone) ? p.stageDone : new Array(cnt).fill(false);
            const newStageDone = baseDone.map((v, i) => i === activeStage ? true : v);
            const newStageCleared = passed
              ? p.stageCleared.map((v, i) => i === activeStage ? true : v)
              : p.stageCleared;
            return {
              ...p,
              stageDone: newStageDone,
              stageCleared: newStageCleared,
              cleared: newStageCleared.length > 0 && newStageCleared.every(Boolean),
            };
          });
          setProgress(finalProgress);
          if (passed) {
            setXp(x => x + XP_WORLD);
            setScreen("worldclear");
          } else {
            setScreen("result");
          }
        }
      } else {
        setCardIdx(nextIdx);
        setFlipped(false);
        setSwipeDir(null);
        setDragX(0);
        setAnimKey(k => k + 1);
        processingRef.current = false;
      }
    }, 350);
  }, [combo, sessionCorrect, sessionTotal, cardIdx, queue, activeWorld, isReview]);

  // ── 터치 핸들러 ──────────────────────────
  const onTouchStart = (e) => {
    if (processingRef.current) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurX.current   = e.touches[0].clientX;
    setIsDragging(true);
    setDragX(0);
  };
  const onTouchMove = (e) => {
    if (!isDragging || processingRef.current) return;
    touchCurX.current = e.touches[0].clientX;
    setDragX(touchCurX.current - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (!isDragging || processingRef.current) return;
    setIsDragging(false);
    const dx = touchCurX.current - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESH) {
      doSwipe(dx > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  // 마우스 드래그 (PC)
  const onMouseDown = (e) => {
    if (processingRef.current) return;
    touchStartX.current = e.clientX;
    setIsDragging(true);
    setDragX(0);
  };
  const onMouseMove = (e) => {
    if (!isDragging || processingRef.current) return;
    setDragX(e.clientX - touchStartX.current);
  };
  const onMouseUp = () => {
    if (!isDragging || processingRef.current) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESH) {
      doSwipe(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  const card   = queue[cardIdx];
  const w      = activeWorld;
  const absDx  = Math.abs(dragX);
  const swipeProgress = Math.min(absDx / SWIPE_THRESH, 1); // 0~1

  // ── 전체 단어 집계 ────────────────────────
  const targetWorlds = customOnlyMode ? customWorlds : WORLDS;

// 검색용 전체 단어 flat
  const searchAllWords = targetWorlds.flatMap(w =>
    w.words.map(word => ({ ...word, worldId: w.id, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }))
  );

  const allMastered = targetWorlds.flatMap(w => {
    const p = progress.find(p => p.worldId === w.id);
    return w.words.filter(word => p?.mastered.includes(word.en))
      .map(word => ({ ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }));
  });
  // 계정 모달용 — 급수 + 내한자장 전체에서 '서로 다른' 마스터 한자 수(중복 제거)
  // (8급·준7급·7급이 누적 구조라 같은 한자가 여러 급에 중복 → distinct로 실제 외운 수만 집계)
  const totalMasteredCount = new Set(progress.flatMap(p => p?.mastered || [])).size;
  const allFailed = targetWorlds.flatMap(w => {
    const p = progress.find(p => p.worldId === w.id);
    return w.words.filter(word => p?.failed.includes(word.en))
      .map(word => ({ ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }));
  });
  const allWords = targetWorlds.flatMap(w =>
    w.words.map(word => {
      const p = progress.find(p => p.worldId === w.id);
      const isMastered = p?.mastered.includes(word.en);
      const isFailed   = p?.failed.includes(word.en);
      return { ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji, isMastered, isFailed };
    })
  );
  // vocabList → grouped 방식으로 대체됨

  // ── 공통 Fun.Uncle 헤더 ──────────────────────
  // 라이브러리 전환 (급수 한자 ↔ 내 한자장)
  const switchLibrary = (toCustom) => {
    setCustomOnlyMode(toCustom);
    try { localStorage.setItem('hanja_custom_only_mode', toCustom ? 'true' : 'false'); } catch (e) {}
    if (toCustom) {
      setScreen("customVocab");
    } else {
      setTab("map");
      setScreen("map");
    }
  };
  const FunUncleBar = ({ showLevel = false }: { showLevel?: boolean }) => (
    <>
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setScreen("levelselect")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 23, letterSpacing: -0.8 }}>한자</span>
          <span style={{ background: "linear-gradient(90deg,#FF8C00,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 13, letterSpacing: -0.3 }}>플래시카드</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setAuthStatus(""); setShowAuthModal(true); }} style={{ background: session ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${session ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, padding: session ? "4px 8px" : "6px 10px", borderRadius: 12, cursor: "pointer", fontSize: session && avatar ? 18 : 13, fontWeight: 800, color: session ? "#4ADE80" : "rgba(255,255,255,0.6)" }}>{session ? (avatar || "👤") : "로그인"}</button>
          <button onClick={() => window.dispatchEvent(new Event("showFeedback"))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 10px", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>💌</button>
          {showLevel ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 12, padding: "6px 12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#FFB800", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>Lv.{level}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700 }}>{xp} XP</div>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,184,0,0.05))", border: "1px solid rgba(255,184,0,0.3)", padding: "6px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ color: "#FFB800", fontWeight: 900, fontSize: 14 }}>{xp} XP</span>
            </div>
          )}
        </div>
      </div>
      {/* 라이브러리 전환 토글 */}
      <div style={{ marginTop: 12, display: "flex", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 3 }}>
        <button onClick={() => switchLibrary(false)}
          style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 800, background: !customOnlyMode ? "#FF8C00" : "transparent", color: !customOnlyMode ? "#3a1e00" : "rgba(255,255,255,0.45)" }}>급수 한자</button>
        <button onClick={() => switchLibrary(true)}
          style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 800, background: customOnlyMode ? "#A78BFA" : "transparent", color: customOnlyMode ? "#241452" : "rgba(255,255,255,0.45)" }}>내 한자장</button>
      </div>
    </div>
    </>
  );

  // ── 레벨변경 확인 팝업 ────────────────────────
  const LevelConfirmModal = () => !showLevelConfirm ? null : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>레벨을 변경할까요?</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
          현재 학습 기록이 모두<br />초기화됩니다.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowLevelConfirm(false)}
            style={{ flex: 1, padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            취소
          </button>
          <button
            onClick={() => { setShowLevelConfirm(false); setScreen(customOnlyMode ? "customVocab" : "levelselect"); }}
            style={{ flex: 1, padding: "15px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            변경하기
          </button>
        </div>
      </div>
    </div>
  );

  // ── 게임 중 나가기 확인 팝업 ──────────────────
  const QuitConfirmModal = () => {
    if (!showQuitConfirm) return null;
    const canSave = !!activeWorld && !isReview;   // 복습 중엔 일반 나가기
    const cp = progress.find(pp => pp.worldId === activeWorld?.id);
    const hasFailed = (cp?.failed?.length || 0) > 0;
    const plainExit = () => {
      setShowQuitConfirm(false);
      if (activeWorld?.isCustom) { setScreen("customVocab"); return; }
      if (customOnlyMode && quitTarget === "map") {
        setScreen("customVocab");
      } else {
        setScreen("map");
        setTab(quitTarget);
      }
      if (!customOnlyMode && levelStartWorldRef.current > 1 && quitTarget === "map") {
        scrollTargetRef.current = levelStartWorldRef.current;
        setScrollTrigger(t => t + 1);
      }
    };
    return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{canSave ? "📌" : "🚪"}</div>
        <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>{canSave ? "오늘은 여기까지?" : "학습을 종료할까요?"}</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
          {canSave
            ? <>지금 위치를 저장하면<br />다음에 <b style={{ color: "#A78BFA" }}>이어서 하기</b>로 계속할 수 있어요.</>
            : <>현재 스테이지 진행 기록은<br />저장되지 않습니다.</>}
        </p>
        {canSave ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={saveCustomAndExit}
              style={{ padding: "15px", background: "linear-gradient(135deg,#A78BFA,#6d28d9)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              💾 저장하고 나가기
            </button>
            {hasFailed && (
              <button onClick={reviewWithSave}
                style={{ padding: "15px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                🔁 틀린 문제 풀기 ({cp.failed.length}개)
              </button>
            )}
            <button onClick={() => setShowQuitConfirm(false)}
              style={{ padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              계속하기
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowQuitConfirm(false)}
              style={{ flex: 1, padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              계속하기
            </button>
            <button onClick={plainExit}
              style={{ flex: 1, padding: "15px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              나가기
            </button>
          </div>
        )}
      </div>
    </div>
    );
  };

  // ── 이어서 하기 / 처음부터 하기 팝업 ────────────
  const ResumePromptModal = () => {
    if (!resumePrompt) return null;
    const rec = customResume[resumePrompt.id] || {};
    const total = Array.isArray(rec.order) ? rec.order.length : resumePrompt.words.length;
    const done = rec.pos || 0;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>📖</div>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>{resumePrompt.title}</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
            지난번 <b style={{ color: "#A78BFA" }}>{done}번째</b>까지 했어요.<br />이어서 할까요? (총 {total}개)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => startCustomWorld(resumePrompt, true)}
              style={{ padding: "15px", background: "linear-gradient(135deg,#A78BFA,#6d28d9)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              ▶ 이어서 하기 ({done + 1}번부터)
            </button>
            <button onClick={() => startCustomWorld(resumePrompt, false)}
              style={{ padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              🔄 처음부터 하기
            </button>
            <button onClick={() => setResumePrompt(null)}
              style={{ padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── 카카오 공유 핸들러 ────────────────────────
  const handleKakaoShare = () => {
    const kakao = (window as any).Kakao;
    if (!kakao) return;
    if (!kakao.isInitialized()) kakao.init('8e68190d1ba932955a557fbf0ae0b659');
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '한자 플래시카드 🀄',
        description: "한국어문회 8·준7·7급 한자부터 '나만의 한자장'까지! 스와이프로 쉽게 외워요✨",
        imageUrl: 'https://fun.uncledison.com/assets/hanja_kakao.png',
        link: {
          mobileWebUrl: 'https://fun.uncledison.com/hanja',
          webUrl: 'https://fun.uncledison.com/hanja',
        },
      },
      buttons: [{ title: '공부하러 가기', link: { mobileWebUrl: 'https://fun.uncledison.com/hanja', webUrl: 'https://fun.uncledison.com/hanja' } }],
    });
  };

  // ── 하단 탭바 공통 컴포넌트 ─────────────────
  const TabBar = () => (
    <>
      {/* 카카오 플로팅 버튼 */}
      <button
        onClick={handleKakaoShare}
        style={{ position: "fixed", bottom: 90, right: 16, width: 48, height: 48, background: "#FAE100", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 60 }}
        aria-label="카카오톡 공유"
      >
        <svg viewBox="0 0 512 512" style={{ width: 24, height: 24, marginLeft: 1, marginTop: 1 }} fill="#3C1E1E">
          <path d="M408 64H104a56.16 56.16 0 00-56 56v192a56.16 56.16 0 0056 56h40v80l93.72-78.14a8 8 0 015.13-1.86H408a56.16 56.16 0 0056-56V120a56.16 56.16 0 00-56-56z" />
          <circle cx="160" cy="216" r="32" fill="#FAE100" />
          <circle cx="256" cy="216" r="32" fill="#FAE100" />
          <circle cx="352" cy="216" r="32" fill="#FAE100" />
        </svg>
      </button>
      {/* 탭바 */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d0d18", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", zIndex: 50 }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", display: "flex" }}>
        {[
          { key: "map",    label: "홈",      icon: "🏠" },
          { key: "vocab",  label: "내 한자장", icon: "📖" },
          { key: "search", label: "검색",     icon: "🔍" },
        ].map(t => (
          <button key={t.key} onClick={() => {
            if (screen === "game") {
              setQuitTarget(t.key);
              setShowQuitConfirm(true);
            } else {
              if (t.key === "map") {
                setScreen(customOnlyMode ? "customVocab" : "map");
                if (!customOnlyMode && levelStartWorldRef.current > 1) {
                  scrollTargetRef.current = levelStartWorldRef.current;
                  setScrollTrigger(t => t + 1);
                }
              } else {
                setScreen("map");
              }
              setTab(t.key);
              // GA 탭 방문 이벤트
              try { (window as any).gtag?.('event', 'tab_view', { tab: t.key, page: '/hanja' }); } catch(e) {}
            }
          }}
            style={{ flex: 1, padding: "12px 8px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ color: tab === t.key ? "#FFB800" : "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }}>{t.label}</span>
            {tab === t.key && <div style={{ width: 20, height: 2, background: "#FFB800", borderRadius: 2, marginTop: 2 }} />}
          </button>
        ))}
        </div>
      </div>
    </>
  );

  // ── 검색 화면 ──────────────────────────
  // ── 승인 대기 게이트 (로그인했지만 아직 미승인) ──────────────
  if (session && approved === false) {
    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 18 }}>🕐</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>가입 신청 완료!</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
            관리자 승인을 기다리는 중이에요.<br />승인되면 폰·PC 동기화와 모든 기능이 열립니다.
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 28px" }}>{session.user?.email || ""}</p>
          <button onClick={() => window.location.reload()} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>
            🔄 승인됐어요? 새로고침
          </button>
          <button onClick={signOut} style={{ width: "100%", padding: "13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            로그아웃하고 둘러보기
          </button>
        </div>
      </div>
    );
  }

  if (tab === "search" && screen === "map") {
    const q = searchQuery.trim().toLowerCase();
    const results = q.length < 1 ? [] : searchAllWords.filter(w =>
      w.en.toLowerCase().includes(q) || w.ko.includes(searchQuery.trim())
    );

    return (
      <div style={{ minHeight:"100dvh", background:"#07070f", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", justifyContent:"center" }}>
        <LevelConfirmModal />
        {renderAuthModal()}
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", paddingBottom:80 }}>
        {/* 헤더 */}
        <div style={{ background:"linear-gradient(180deg,#0e0e20 0%,#07070f 100%)" }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding:"12px 22px 16px" }}>
          {/* 검색창 */}
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
            <input
              type="text"
              placeholder="한자 또는 뜻·음으로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              style={{ width:"100%", padding:"14px 16px 14px 46px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, color:"#fff", fontSize:16, fontWeight:600, outline:"none", boxSizing:"border-box" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.1)", border:"none", borderRadius:"50%", width:24, height:24, color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12 }}>
                ✕
              </button>
            )}
          </div>
          {q.length > 0 && (
            <div style={{ color:"rgba(255,255,255,0.25)", fontSize:11, fontWeight:600, marginTop:8 }}>
              {results.length > 0 ? `${results.length}개 검색됨` : "검색 결과 없음"}
            </div>
          )}
          </div>
        </div>

        {/* 검색 결과 */}
        <div style={{ padding:"0 22px", overflowY:"auto", flex:1 }}>
          {q.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:14, fontWeight:700 }}>한자나 뜻·음으로 검색하세요</div>
              <div style={{ color:"rgba(255,255,255,0.12)", fontSize:12, marginTop:8 }}>{customOnlyMode ? `등록된 ${allWords.length}자 검색 가능` : `한국어문회 ${WORLDS.reduce((s,w)=>s+w.words.length,0)}자 검색 가능`}</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>😅</div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:14, fontWeight:700 }}>"{searchQuery}" 검색 결과가 없어요</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8, paddingTop:8 }}>
              {results.map((word, i) => {
                const isExpanded = expandedCard === word.en + "_search";
                const p = progress.find(p => p.worldId === word.worldId);
                const isMastered = p?.mastered.includes(word.en);
                const isFailed   = p?.failed.includes(word.en);
                const statusIcon = isMastered ? "✅" : isFailed ? "🔴" : "⬜";
                return (
                  <button key={i}
                    onClick={() => setExpandedCard(isExpanded ? null : word.en + "_search")}
                    style={{ background:isExpanded ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border:`1px solid ${isExpanded ? word.worldColor+"33" : "rgba(255,255,255,0.06)"}`, borderRadius:14, padding:"12px 14px", textAlign:"left", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:13 }}>{statusIcon}</span>
                      <span style={{ color:"#fff", fontSize:15, fontWeight:800, flex:1 }}>{word.en}</span>
                      <span style={{ color:"rgba(255,255,255,0.45)", fontSize:13 }}>{word.ko}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:12, marginLeft:4, transform:isExpanded?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
                    </div>
                    {/* 펼침 */}
                    {isExpanded && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                          <span style={{ fontSize:13 }}>{word.worldEmoji}</span>
                          <span style={{ color:word.worldColor, fontSize:11, fontWeight:700 }}>{word.worldTitle}</span>
                          <span style={{ color:"rgba(255,255,255,0.2)", fontSize:10 }}>WORLD {word.worldId}</span>
                        </div>
                        <div style={{ background:`${word.worldColor}10`, border:`1px solid ${word.worldColor}22`, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9, fontWeight:700, letterSpacing:1, marginBottom:4 }}>훈 · 음</div>
                          <div style={{ color:"#fff", fontSize:20, fontWeight:900 }}>{word.ko}</div>
                        </div>
                        {word.tip && (
                          <div style={{ background:"rgba(255,184,0,0.07)", border:"1px solid rgba(255,184,0,0.14)", borderRadius:10, padding:"8px 14px" }}>
                            <div style={{ color:"#FFB800", fontSize:11, fontWeight:700 }}>💡 {word.tip}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
              <div style={{ height:20 }} />
            </div>
          )}
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── 내 한자장 탭 ──────────────────────────
  if (tab === "vocab" && screen === "map") {
    // 필터별 단어 목록
    const displayList = vocabFilter === "mastered" ? allMastered
      : vocabFilter === "failed" ? allFailed
      : allWords;

    // 카테고리(월드)별 그룹핑
    const grouped = targetWorlds.map(world => {
      const p = progress.find(p => p.worldId === world.id);
      const words = world.words
        .filter(word => {
          const isMastered = p?.mastered.includes(word.en);
          const isFailed   = p?.failed.includes(word.en);
          if (vocabFilter === "mastered") return isMastered;
          if (vocabFilter === "failed")   return isFailed;
          return true;
        })
        .map(word => ({
          ...word,
          worldColor: world.color,
          isMastered: p?.mastered.includes(word.en) || false,
          isFailed:   p?.failed.includes(word.en)   || false,
        }));
      return { ...world, filteredWords: words };
    }).filter(g => g.filteredWords.length > 0);

    const filters = [
      { key: "all",      label: "전체",    count: allWords.length,    color: "rgba(255,255,255,0.55)", activeBg: "rgba(255,255,255,0.08)", activeBorder: "rgba(255,255,255,0.2)" },
      { key: "mastered", label: "마스터",   count: allMastered.length, color: "#4ADE80",               activeBg: "rgba(74,222,128,0.12)",  activeBorder: "rgba(74,222,128,0.35)" },
      { key: "failed",   label: "복습필요", count: allFailed.length,   color: "#EF4444",               activeBg: "rgba(239,68,68,0.12)",   activeBorder: "rgba(239,68,68,0.35)"  },
    ];

    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        {renderAuthModal()}
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
        {/* 헤더 */}
        <div style={{ background: "linear-gradient(180deg,#0e0e20 0%,#07070f 100%)" }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding: "12px 22px 20px" }}>
          {/* 통계 카드 = 필터 버튼 (클릭하면 필터 전환) */}
          <div style={{ display: "flex", gap: 10 }}>
            {filters.map(f => {
              const isActive = vocabFilter === f.key;
              return (
                <button key={f.key} onClick={() => setVocabFilter(f.key)}
                  style={{ flex: 1, background: isActive ? f.activeBg : "rgba(255,255,255,0.03)", border: `1.5px solid ${isActive ? f.activeBorder : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "14px 8px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ color: isActive ? f.color : "rgba(255,255,255,0.35)", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{f.count}</div>
                  <div style={{ color: isActive ? f.color : "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 5, fontWeight: 700 }}>{f.label}</div>
                  {isActive && <div style={{ width: 20, height: 2, background: f.color, borderRadius: 2, margin: "6px auto 0" }} />}
                </button>
              );
            })}
          </div>
          </div>
        </div>

        {/* 단어 목록 — 월드별 그룹 헤더 */}
        <div style={{ padding: "0 22px", overflowY: "auto" }}>
          {/* 복습필요 탭 선택 시 전체 복습 시작 버튼 */}
          {vocabFilter === "failed" && allFailed.length > 0 && (
            <button
              onClick={() => {
                // 모든 틀린 단어를 월드 구분 없이 한번에 복습
                // 가장 많이 틀린 월드의 world 객체로 시작
                const worldWithMostFailed = targetWorlds.reduce((acc, w) => {
                  const p = progress.find(p => p.worldId === w.id);
                  const cnt = p ? p.failed.length : 0;
                  return cnt > (progress.find(p => p.worldId === acc.id)?.failed.length || 0) ? w : acc;
                }, targetWorlds[0]);
                // 전체 틀린 단어를 하나의 큰 복습 세트로
                const allFailedWords = targetWorlds.flatMap(w => {
                  const p = progress.find(p => p.worldId === w.id);
                  return (w.words || []).filter(word => p?.failed.includes(word.en));
                });
                setActiveWorld({ ...worldWithMostFailed, unlocked: true, title: "전체 복습", emoji: "🔁" });
                const shuffled = [...allFailedWords].sort(() => Math.random() - 0.5);
                setQueue(shuffled);
                setCardIdx(0); setFlipped(false); setSwipeDir(null); setDragX(0);
                setSessionCorrect(0); setSessionTotal(0); setCombo(0);
                setIsReview(true);
                processingRef.current = false;
                setScreen("game");
              }}
              style={{ width: "100%", padding: "15px", background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 16, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              🔁 전체 복습 시작
              <span style={{ background: "rgba(239,68,68,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{allFailed.length}개</span>
            </button>
          )}
          {grouped.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {vocabFilter === "mastered" ? "🌱" : vocabFilter === "failed" ? "🎉" : "📖"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 700 }}>
                {vocabFilter === "mastered" ? "아직 마스터한 한자가 없어요! 게임을 시작해보세요!"
                  : vocabFilter === "failed" ? "틀린 한자가 없어요! 완벽해요 🎉"
                  : "게임을 시작하면 한자가 여기 쌓여요!"}
              </div>
            </div>
          ) : grouped.map(group => (
            <div key={group.id} style={{ marginBottom: 24 }}>
              {/* 월드 그룹 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0 10px" }}>
                <span style={{ fontSize: 16 }}>{group.emoji}</span>
                <span style={{ color: group.color, fontWeight: 800, fontSize: 13 }}>{group.title}</span>
                <div style={{ flex: 1, height: 1, background: `${group.color}25`, marginLeft: 4 }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600 }}>{group.filteredWords.length}개</span>
                {/* 그룹 헤더 복습 버튼 — 해당 월드에 틀린 단어 있을 때만 */}
                {(() => {
                  const gp = progress.find(p => p.worldId === group.id);
                  const hasFailed = gp && gp.failed.length > 0;
                  return hasFailed ? (
                    <button onClick={() => startReview({ ...(targetWorlds.find(w2 => w2.id === group.id) || group), unlocked: true })}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "3px 10px", color: "#EF4444", fontSize: 10, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                      🔁 {gp.failed.length}개
                    </button>
                  ) : null;
                })()}
              </div>

              {/* 단어 카드 목록 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.filteredWords.map((word, i) => {
                  const isExpanded = expandedCard === word.en;
                  const statusColor = word.isMastered ? "#4ADE80" : word.isFailed ? "#EF4444" : "rgba(255,255,255,0.2)";
                  const statusIcon  = word.isMastered ? "✅" : word.isFailed ? "🔴" : "⬜";
                  return (
                    <button key={`${word.en}-${i}`}
                      onClick={() => setExpandedCard(isExpanded ? null : word.en)}
                      style={{ background: isExpanded ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${isExpanded ? group.color + "33" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "12px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}>
                      {/* 접힌 상태 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{statusIcon}</span>
                        <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, flex: 1 }}>{word.en}</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{word.ko}</span>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, marginLeft: 4, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                      </div>
                      {/* 펼침 상세 */}
                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ background: `${group.color}10`, border: `1px solid ${group.color}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>훈 · 음</div>
                            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>{word.ko}</div>
                          </div>
                          <div style={{ background: "rgba(255,184,0,0.07)", border: "1px solid rgba(255,184,0,0.14)", borderRadius: 10, padding: "8px 14px" }}>
                            <div style={{ color: "#FFB800", fontSize: 11, fontWeight: 700 }}>💡 {word.tip}</div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ height: 20 }} />
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── 레벨 선택 화면 ───────────────────────
  // 베타 카운트다운 (오늘 2026-06-08 기준 +3개월 = 2026-09-08)
  const BETA_END = new Date("2026-09-26T00:00:00+09:00");  // 2026-06-28 기준 무료 90일
  const betaDiff = Math.max(0, BETA_END.getTime() - Date.now());
  const betaDays = Math.floor(betaDiff / (1000 * 60 * 60 * 24));

  if (screen === "levelselect") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* 베타 배너 */}
      <div style={{ width: "100%", background: "linear-gradient(90deg,#FFB800,#FF6B00)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 14 }}>🚨</span>
        <span style={{ color: "#000", fontWeight: 800, fontSize: 13 }}>[베타 기간 한정] 무료 서비스 종료까지</span>
        <span style={{ color: "#000", fontWeight: 900, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>D-{betaDays}</span>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 22px 40px", flex: 1 }}>
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
          한자<br />
          <span style={{ background: "linear-gradient(90deg,#FFB800,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 26 }}>플래시카드</span>
        </h1>
        <p style={{ color: "#FFB800", fontSize: 13, marginTop: 12, fontWeight: 700, letterSpacing: 0.5 }}>
          🀄 한국어문회 8급·준7급·7급 (50·100·150자)
        </p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 4, fontWeight: 400 }}>
          전국한자능력검정시험 급수 기준
        </p>
      </div>

      {/* 레벨 선택 카드 */}
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 참여자 수 */}
        {participantCount !== null && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: 30, padding: "8px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>
              오늘 <strong style={{ color: "#FFB800", fontWeight: 800 }}>{participantCount}명</strong>이 학습 중이에요
            </span>
          </div>
        )}

        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textAlign: "center", marginBottom: 4 }}>
          어느 레벨부터 시작할까요?
        </div>

                {[
          {
            key: "g8",
            emoji: "🌱", label: "8급", sublabel: "입문",
            desc: "기초 한자부터 차근차근",
            tag: "한국어문회 8급 · 50자",
            color: "#4ADE80", dark: "#15803d",
            worldId: 1,
          },
          {
            key: "g7b",
            emoji: "📗", label: "준7급", sublabel: "7급Ⅱ",
            desc: "기본은 알아요! 한 단계 위로",
            tag: "한국어문회 준7급 · 100자",
            color: "#60A5FA", dark: "#1d4ed8",
            worldId: 2,
          },
          {
            key: "g7",
            emoji: "📘", label: "7급", sublabel: "기본",
            desc: "필수 한자 마스터",
            tag: "한국어문회 7급 · 150자",
            color: "#F472B6", dark: "#be185d",
            worldId: 3,
          },
          {
            key: "custom",
            emoji: "✍️", label: "나만의 한자장", sublabel: "Custom",
            desc: "내가 직접 만든 한자장으로 학습",
            tag: "최대 5개 저장",
            color: "#A78BFA", dark: "#6d28d9",
            isCustomBtn: true,
          },
        ].map(lv => (
          <button key={lv.key}
            onClick={() => {
              if (lv.isCustomBtn) {
                setCustomOnlyMode(true);
                try { localStorage.setItem('hanja_custom_only_mode', 'true'); } catch(e) {}
                setScreen("customVocab");
                return;
              }
              // 급수 한자 라이브러리로 진입
              setCustomOnlyMode(false);
              try { localStorage.setItem('hanja_custom_only_mode', 'false'); } catch(e) {}
              // 비파괴: 진도 초기화 없이 해당 학년만 "열고" 그 위치로 이동
              unlockGradeStart(lv.worldId);
              levelStartWorldRef.current = lv.worldId;
              scrollTargetRef.current = lv.worldId;
              setScrollTrigger(t => t + 1);
              setScreen("map");
              setTab("map");
            }}
            style={{ background: `linear-gradient(135deg,${lv.color}14,${lv.dark}20)`, border: `1.5px solid ${lv.color}40`, borderRadius: 22, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 58, height: 58, background: `${lv.color}20`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {lv.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{lv.label}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{lv.sublabel}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 6 }}>{lv.desc}</div>
              <div style={{ display: "inline-block", background: `${lv.color}18`, border: `1px solid ${lv.color}30`, borderRadius: 20, padding: "2px 10px" }}>
                <span style={{ color: lv.color, fontSize: 10, fontWeight: 700 }}>{lv.tag}</span>
              </div>
            </div>
            <div style={{ color: lv.color, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>›</div>
          </button>
        ))}

      </div>

      <div style={{ marginTop: 16, color: "rgba(255,255,255,0.1)", fontSize: 10, textAlign: "center" }}>
        <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
      </div>
      </div>
    </div>
  );


  // ── 커스텀 한자장 화면 ─────────────────────────────
  if (screen === "customVocab") {
    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", justifyContent: "center" }}>
        <ResumePromptModal />
        {renderAuthModal()}
        {renderInviteModal()}
        {renderSendModal()}
        {renderShareToast()}
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
        {/* 헤더 */}
        <div style={{ background: "linear-gradient(180deg,#0e0e20 0%,#07070f 100%)", paddingBottom: 8 }}>
          <FunUncleBar showLevel={true} />
        </div>

        <div style={{ padding: "16px 22px 0", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 받은 한자장 */}
          {inbox.length > 0 && (
            <div style={{ background: "rgba(167,139,250,0.1)", border: "1px solid #A78BFA40", borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: "#C4B5FD", fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📩 받은 한자장 {inbox.length}개</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inbox.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title || "한자장"}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.from_name || "익명"} · 단어 {(t.words || []).length}개</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => importTransfer(t)} style={{ padding: "8px 12px", background: "#A78BFA", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>추가</button>
                      <button onClick={() => { deleteTransfer(t.id); setInbox(prev => prev.filter(x => x.id !== t.id)); }} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {customWorlds.map((cw, i) => {
              const rec = customResume[cw.id];
              const total = Array.isArray(rec?.order) ? rec.order.length : cw.words.length;
              const inProgress = rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length;
              return (
              <div key={cw.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => openCustomWorld(cw)} style={{ flex: 1, padding: "18px 20px", background: "linear-gradient(135deg,#A78BFA14,#6d28d920)", border: "1.5px solid #A78BFA40", borderRadius: 20, textAlign: "left", cursor: "pointer" }}>
                  <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{cw.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>단어 {cw.words.length}개</span>
                    {inProgress && <span style={{ background: "#A78BFA22", color: "#C4B5FD", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>이어하기 {rec.pos}/{total}</span>}
                  </div>
                  {inProgress && (
                    <div style={{ marginTop: 8, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round(rec.pos / total * 100)}%`, background: "linear-gradient(90deg,#6d28d9,#A78BFA)", borderRadius: 3 }} />
                    </div>
                  )}
                </button>
                {session && approved === true && (
                  <button onClick={() => setSendModalSet(cw)} aria-label="보내기" style={{ padding: "16px 13px", background: "rgba(74,222,128,0.12)", border: "none", borderRadius: 16, color: "#4ADE80", cursor: "pointer", flexShrink: 0, fontSize: 15 }}>📤</button>
                )}
                <button onClick={() => startEditCustom(cw)} aria-label="편집" style={{ padding: "16px 13px", background: "rgba(167,139,250,0.12)", border: "none", borderRadius: 16, color: "#A78BFA", cursor: "pointer", flexShrink: 0, fontSize: 15 }}>✏️</button>
                <button onClick={() => {
                  if(!confirm('정말 삭제하시겠습니까?')) return;
                  const newCw = customWorlds.filter(w => w.id !== cw.id);
                  setCustomWorlds(newCw);
                  localStorage.setItem('hanja_custom_worlds', JSON.stringify(newCw));
                  clearCustomResume(cw.id);
                  if (editingId === cw.id) cancelEditCustom();
                }} aria-label="삭제" style={{ padding: "16px 13px", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 16, color: "#EF4444", cursor: "pointer", flexShrink: 0, fontSize: 15 }}>🗑️</button>
              </div>
              );
            })}
            {customWorlds.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px 0" }}>생성된 한자장이 없습니다.<br/>아래에서 만들어보세요!</div>
            )}
          </div>

          {(editingId !== null || customWorlds.length < maxSets) ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${editingId !== null ? "#A78BFA66" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: 24, marginTop: 12 }}>
              <h3 style={{ color: "#fff", fontSize: 16, margin: "0 0 16px", fontWeight: 700 }}>{editingId !== null ? "✏️ 한자장 편집" : "새 한자장 만들기"}</h3>

              <input type="text" placeholder="한자장 이름 (미입력 시 날짜로 저장)" value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", marginBottom: 12 }} />
              
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      setCustomInput(prev => prev + (prev ? '\n' : '') + evt.target.result);
                    };
                    reader.readAsText(file);
                  } else {
                    alert('txt 또는 csv 파일만 가능합니다.');
                  }
                }}
              >
                <textarea 
                  placeholder={"敎 가르칠 교\n校 학교 교\n國 나라 국\n軍 군사 군\n民 백성 민\n靑 푸를 청\n\n이런식으로 '한자 뜻·음'을 한 줄에 하나씩 입력하세요\n(쉼표·탭·csv도 가능)"}
                  value={customInput} 
                  onChange={e => setCustomInput(e.target.value)}
                  style={{ width: "100%", height: 220, padding: "16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,255,255,0.2)", color: "#fff", marginBottom: 12, resize: "none" }} 
                />
              </div>
              
              <div style={{ marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                ※ 텍스트 파일(txt, csv)을 여기에 드래그앤드롭 하면 내용이 자동으로 채워집니다.
              </div>

              <button onClick={() => {
                const words = parseCustomWords(customInput);
                if (words.length === 0) return alert('한자를 입력해주세요.');

                const now = new Date();
                const defaultTitle = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} 한자장`;

                if (editingId !== null) {
                  // 편집 저장: 제목·단어 교체, 진행 북마크 초기화(위치 꼬임 방지)
                  const newWorlds = customWorlds.map(w =>
                    w.id === editingId ? { ...w, title: customTitle || w.title, words } : w
                  );
                  setCustomWorlds(newWorlds);
                  localStorage.setItem('hanja_custom_worlds', JSON.stringify(newWorlds));
                  clearCustomResume(editingId);
                  cancelEditCustom();
                  return;
                }

                const newWorld = {
                  id: 1000 + Date.now() % 100000,
                  title: customTitle || defaultTitle,
                  emoji: "📝",
                  color: "#A78BFA", dark: "#6d28d9",
                  desc: "사용자 생성 한자장",
                  words: words,
                  isCustom: true
                };

                const newWorlds = [...customWorlds, newWorld];
                setCustomWorlds(newWorlds);
                localStorage.setItem('hanja_custom_worlds', JSON.stringify(newWorlds));
                setCustomInput("");
                setCustomTitle("");
              }} style={{ width: "100%", padding: "16px", background: "#A78BFA", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                {editingId !== null ? "💾 저장하기" : `추가하기 (${customWorlds.length}/${maxSetsLabel})`}
              </button>
              {editingId !== null && (
                <button onClick={cancelEditCustom} style={{ width: "100%", padding: "13px", marginTop: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: 16, fontSize: 14 }}>
              {!session
                ? <>비로그인은 3개까지예요.<br /><button onClick={() => { setAuthStatus(""); setShowAuthModal(true); }} style={{ marginTop: 10, padding: "10px 18px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>로그인하고 5개까지 쓰기</button></>
                : (membership === "vip" || isAdmin)
                  ? "한자장을 마음껏 만들 수 있어요. (무한)"
                  : <>로그인 회원은 5개까지예요.<br /><span style={{ color: "#FFB800", fontWeight: 800 }}>👑 VIP가 되면 무한대로!</span></>}
            </div>
          )}
        </div>
        </div>
        <TabBar />
      </div>
    );
  }

  // ── MAP 화면 ─────────────────────────────
  if (screen === "map") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <LevelConfirmModal />
      {renderAuthModal()}
      {renderInviteModal()}
      {renderShareToast()}

      {/* 고정 헤더 */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", background: "#0e0e20", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding: "8px 22px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700 }}>다음 레벨</span>
              <span style={{ color: "#FFB800", fontSize: 10, fontWeight: 700 }}>{xpMod}/100</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpMod}%`, background: "linear-gradient(90deg,#FFB800,#FF6B00)", borderRadius: 5, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 본문 — 고정 헤더(타이틀+토글+레벨바 약 165px) + 탭바 만큼 여백 */}
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 172, paddingBottom: 96 }}>

      {streak > 2 && (
        <div style={{ margin: "0 22px 14px", background: "rgba(255,100,0,0.08)", border: "1px solid rgba(255,100,0,0.18)", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ color: "#FF6B00", fontWeight: 800, fontSize: 12 }}>{streak}연속 정답 스트릭 유지중!</span>
        </div>
      )}

      {/* 월드 카드 */}
      <div style={{ padding: "0 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {worlds.map((world) => {
          const p          = progress.find(p => p.worldId === world.id);
          const totalStages = getStageCount(world);
          const clearedStages = p?.stageCleared?.filter(Boolean).length || 0;
          const pct        = Math.round(clearedStages / totalStages * 100);
          const locked     = !world.unlocked;
          const wrec       = customResume[world.id];
          const hasWorldResume = !!(wrec && Array.isArray(wrec.order) && wrec.pos > 0 && wrec.pos < wrec.order.length);

          return (
            <div key={world.id} id={`world-card-${world.id}`}
              style={{ background: locked ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg,${world.color}14,${world.dark}20)`, border: `1.5px solid ${locked ? "rgba(255,255,255,0.05)" : world.color + "40"}`, borderRadius: 24, padding: "20px 22px", opacity: locked ? 0.45 : 1, transition: "opacity 0.2s" }}>

              {/* 월드 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: locked ? 0 : 14 }}>
                <div style={{ width: 54, height: 54, background: locked ? "rgba(255,255,255,0.04)" : `${world.color}20`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {locked ? "🔒" : world.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ color: locked ? "rgba(255,255,255,0.25)" : "#fff", fontWeight: 800, fontSize: 15 }}>WORLD {world.id}</span>
                    {p?.cleared && <span style={{ background: world.color, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20, letterSpacing: 1 }}>CLEAR ✓</span>}
                    {hasWorldResume && !p?.cleared && <span style={{ background: `${world.color}22`, color: world.color, fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20 }}>이어하기</span>}
                  </div>
                  <div style={{ color: locked ? "rgba(255,255,255,0.18)" : world.color, fontWeight: 700, fontSize: 14 }}>{world.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 2 }}>{clearedStages}/{totalStages} 스테이지 클리어</div>
                </div>
                {/* 플레이 버튼 — 북마크 있으면 이어하기, 없으면 첫 미클리어 스테이지 */}
                {!locked && (() => {
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); startWorld(world); }}
                      style={{
                        flexShrink: 0, width: 48, height: 48,
                        background: `linear-gradient(135deg,${world.color},${world.dark})`,
                        border: "none", borderRadius: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 14px ${world.color}44`,
                      }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  );
                })()}
              </div>

              {!locked && (
                <>
                  {/* 진행률 바 */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700 }}>진행률</span>
                    <span style={{ color: world.color, fontSize: 10, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${world.dark},${world.color})`, borderRadius: 5, transition: "width 0.5s" }} />
                  </div>

                  {/* 스테이지 버튼 그리드 */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: p.failed.length > 0 ? 10 : 0 }}>
                    {Array.from({ length: totalStages }, (_, i) => {
                      const isCleared  = p?.stageCleared?.[i];           // 70% 통과
                      const isDone     = p?.stageDone?.[i];              // 끝까지 풂(점수 무관)
                      const isNext     = !isCleared && (i === 0 || p?.stageCleared?.[i-1]);
                      const stageLocked = !isCleared && !isNext;
                      // 통과(초록 ✓) > 완료했지만 미통과(주황 ✓·다시) > 다음(번호) > 잠금
                      const checkColor = isCleared ? world.color : "#FFB800";
                      const showCheck  = isCleared || (isDone && isNext);
                      return (
                        <button key={i}
                          onClick={(e) => { e.stopPropagation(); if (!stageLocked) startWorld(world, i); }}
                          disabled={stageLocked}
                          title={isDone && !isCleared ? "끝까지 했어요 (70% 미달 — 다시 도전 시 잠금해제)" : undefined}
                          style={{
                            width: 36, height: 36,
                            borderRadius: 10,
                            background: showCheck ? `${checkColor}33`
                              : isNext ? `${world.color}18`
                              : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${showCheck ? checkColor + "88"
                              : isNext ? world.color + "44"
                              : "rgba(255,255,255,0.07)"}`,
                            color: showCheck ? checkColor
                              : isNext ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.2)",
                            fontSize: showCheck ? 14 : 11,
                            fontWeight: 800,
                            cursor: stageLocked ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                          {showCheck ? "✓" : i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* 복습 버튼 */}
                  {p.failed.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startReview(world); }}
                      style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 12, color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      🔁 틀린 단어 복습 <span style={{ background: "rgba(239,68,68,0.2)", borderRadius: 20, padding: "1px 8px" }}>{p.failed.length}개</span>
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", padding: "0 20px 32px", color: "rgba(255,255,255,0.12)", fontSize: 10, lineHeight: 1.8 }}>
        교육부 고시 제2022-33호 [별책 14] 기준<br />
        <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
      </div>
      </div>
      <TabBar />
    </div>
  );

  // ── GAME 화면 ─────────────────────────────
  if (screen === "game" && card) {
    // 스와이프 상태에서 카드 transform
    const isSwipingRight = (isDragging && dragX > 20) || swipeDir === "right";
    const isSwipingLeft  = (isDragging && dragX < -20) || swipeDir === "left";
    const rotate         = swipeDir
      ? (swipeDir === "right" ? 18 : -18)
      : dragX * 0.06;
    const translateX     = swipeDir
      ? (swipeDir === "right" ? "140%" : "-140%")
      : `${dragX}px`;

    // 오버레이 투명도
    const rightOpacity = swipeDir === "right" ? 0.95
      : (isDragging && dragX > 0) ? swipeProgress * 0.9 : 0;
    const leftOpacity  = swipeDir === "left"  ? 0.95
      : (isDragging && dragX < 0) ? swipeProgress * 0.9 : 0;

    // 아이콘 투명도
    const rightIconOp = isSwipingRight ? 0.15 + swipeProgress * 0.85 : 0.12;
    const leftIconOp  = isSwipingLeft  ? 0.15 + swipeProgress * 0.85 : 0.12;

    const progressPct = (cardIdx / queue.length) * 100;

    return (
      <div
        style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center", userSelect: "none" }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <LevelConfirmModal />
        <QuitConfirmModal />
        <style>{`
          @keyframes spkPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
          @keyframes spkBarA { 0%,100%{height:5px} 50%{height:17px} }
          @keyframes spkBarB { 0%,100%{height:15px} 50%{height:5px} }
          @keyframes spkBarC { 0%,100%{height:8px} 50%{height:18px} }
        `}</style>
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", cursor: isDragging ? "grabbing" : "grab", paddingBottom: 80 }}>
        {/* 상단 */}
        <div style={{ padding: "44px 20px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => { setQuitTarget("map"); setShowQuitConfirm(true); }}
              style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "8px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              🏠 홈
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ color: w.color, fontWeight: 800, fontSize: 13 }}>{w.emoji} {w.title}</div>
                {isReview
                  ? <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "1px 8px", color: "#EF4444", fontSize: 10, fontWeight: 800 }}>복습</span>
                  : activeWorld?.isCustom
                    ? <span style={{ background: `${w.color}18`, border: `1px solid ${w.color}33`, borderRadius: 20, padding: "1px 8px", color: w.color, fontSize: 10, fontWeight: 800 }}>📝 내 한자장</span>
                    : <span style={{ background: `${w.color}18`, border: `1px solid ${w.color}33`, borderRadius: 20, padding: "1px 8px", color: w.color, fontSize: 10, fontWeight: 800 }}>스테이지 {activeStage + 1}</span>
                }
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{cardIdx + 1} / {queue.length}</div>
            </div>
            <div style={{ background: combo >= 3 ? "rgba(255,184,0,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${combo >= 3 ? "rgba(255,184,0,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "8px 14px", minWidth: 52, textAlign: "center", transition: "all 0.3s" }}>
              <span style={{ color: combo >= 3 ? "#FFB800" : "rgba(255,255,255,0.25)", fontWeight: 800, fontSize: 13 }}>
                {combo >= 3 ? `🔥${combo}` : `×${combo}`}
              </span>
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg,${w.dark},${w.color})`, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* 콤보 팝업 */}
        {comboPopup && (
          <div style={{ position: "fixed", top: "22%", left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "#FFB800", borderRadius: 20, padding: "14px 28px", textAlign: "center", pointerEvents: "none", boxShadow: "0 8px 32px rgba(255,184,0,0.4)" }}>
            <div style={{ color: "#000", fontSize: 20, fontWeight: 900 }}>🔥 {combo}연속 콤보!</div>
            <div style={{ color: "rgba(0,0,0,0.55)", fontSize: 11, fontWeight: 700 }}>보너스 +5 XP!</div>
          </div>
        )}

        {/* 카드 래퍼 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 22px 20px" }}>
          {/* 카드 */}
          <div
            key={animKey}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onClick={() => { if (Math.abs(dragX) < 5 && !processingRef.current) setFlipped(f => !f); }}
            style={{
              width: "100%", maxWidth: 340, minHeight: 400,
              position: "relative", borderRadius: 32, overflow: "hidden",
              transform: `translateX(${translateX}) rotate(${rotate}deg)`,
              transition: isDragging ? "none" : swipeDir ? "transform 0.36s cubic-bezier(.4,0,.2,1)" : "transform 0.25s cubic-bezier(.4,0,.2,1)",
              cursor: isDragging ? "grabbing" : "grab",
              flexShrink: 0,
            }}
          >
            {/* 카드 본체 */}
            <div style={{
              width: "100%", height: "100%", minHeight: 400,
              background: flipped
                ? `linear-gradient(160deg, ${w.dark}33, ${w.color}22, #07070f)`
                : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${flipped ? w.color + "44" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 32,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "36px 28px", gap: 0,
              position: "relative",
              transition: "background 0.3s, border 0.3s",
            }}>

              {/* 좌 아이콘 (몰라요) */}
              <div style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", opacity: leftIconOp, transition: isDragging ? "none" : "opacity 0.2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "#EF4444" }}>✗</span>
                </div>
              </div>

              {/* 우 아이콘 (알아요) */}
              <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: rightIconOp, transition: isDragging ? "none" : "opacity 0.2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${w.color}20`, border: `1.5px solid ${w.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: w.color }}>✓</span>
                </div>
              </div>

              {/* 앞면 */}
              {!flipped && (
                <>
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>한자</div>
                  <div style={{ color: "#fff", fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif", fontSize: card.en.length > 3 ? 60 : card.en.length > 1 ? 84 : 110, fontWeight: 900, textAlign: "center", letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 28 }}>
                    {card.en}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>탭해서 뜻 확인 👆</div>
                </>
              )}

              {/* 뒷면 */}
              {flipped && (
                <>
                  {/* 뜻 */}
                  <div style={{ background: `linear-gradient(135deg,${w.dark}88,${w.color}44)`, border: `1px solid ${w.color}44`, borderRadius: 18, padding: "20px 28px", marginBottom: 16, width: "100%", textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>훈 · 음</div>
                    <div style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}>{card.ko}</div>
                  </div>
                  {/* 암기 팁 — tip 있을 때만 표시 */}
                  {card.tip && (
                    <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.18)", borderRadius: 14, padding: "10px 18px", width: "100%", textAlign: "center" }}>
                      <div style={{ color: "#FFB800", fontSize: 12, fontWeight: 700 }}>💡 {card.tip}</div>
                    </div>
                  )}
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, marginTop: 20, fontWeight: 600 }}>
                    스와이프로 판정하세요
                  </div>
                </>
              )}
            </div>

            {/* 오른쪽 스와이프 오버레이 */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: `${w.color}`, opacity: rightOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: isDragging ? "none" : "opacity 0.2s" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>✓</div>
                <div style={{ color: "#000", fontSize: 20, fontWeight: 900, marginTop: 8 }}>알아요!</div>
              </div>
            </div>

            {/* 왼쪽 스와이프 오버레이 */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: "#EF4444", opacity: leftOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: isDragging ? "none" : "opacity 0.2s" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>✗</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, marginTop: 8 }}>몰라요</div>
              </div>
            </div>
          </div>

          {/* XP 힌트 */}
          <div style={{ marginTop: 20, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>← 몰라요</div>
            <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: 10, padding: "4px 14px" }}>
              <span style={{ color: "#FFB800", fontSize: 11, fontWeight: 700 }}>정답 +{XP_CORRECT} XP</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>알아요 →</div>
          </div>
          {activeWorld && !isReview && (
            <button onClick={() => { setQuitTarget("map"); setShowQuitConfirm(true); }}
              style={{ width: "100%", maxWidth: 320, margin: "22px auto 0", display: "block", padding: "15px", background: activeWorld?.isCustom ? "rgba(167,139,250,0.14)" : `${w.color}18`, border: `1.5px solid ${activeWorld?.isCustom ? "#A78BFA55" : w.color + "55"}`, borderRadius: 16, color: activeWorld?.isCustom ? "#C4B5FD" : w.color, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              📌 오늘은 여기까지
            </button>
          )}
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── WORLD CLEAR ───────────────────────────
  if (screen === "worldclear") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
      <LevelConfirmModal />
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ color: w.color, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{activeWorld?.isCustom ? "한자장 완주!" : `WORLD ${w.id} CLEAR!`}</div>
        <h2 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 0 8px" }}>{w.title}<br />클리어!</h2>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 8 }}>
          {finalTotal}개 중 {finalCorrect}개 정답
        </div>
        <div style={{ color: "#FFB800", fontWeight: 800, fontSize: 15, marginBottom: 32 }}>+{XP_WORLD} XP 보너스 획득!</div>

        {w.id < WORLDS.length && (
          <div style={{ background: `${w.color}12`, border: `1px solid ${w.color}30`, borderRadius: 20, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 6 }}>🔓 다음 월드 해금!</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              WORLD {w.id + 1} — {WORLDS[w.id].title}
            </div>
          </div>
        )}

        {activeWorld?.isCustom ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => startCustomWorld(activeWorld, false)}
              style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              🔄 처음부터 다시
            </button>
            <button onClick={() => setScreen("customVocab")}
              style={{ padding: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, color: "rgba(255,255,255,0.55)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              내 한자장으로
            </button>
          </div>
        ) : (() => {
          const totalStages  = getStageCount(w);
          const nextStage    = activeStage + 1;
          const hasNextStage = nextStage < totalStages;
          const nextWorld    = WORLDS.find(ww => ww.id === w.id + 1);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hasNextStage ? (
                <button onClick={() => startWorld({ ...w, unlocked: true }, nextStage)}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                  스테이지 {nextStage + 1} 도전! →
                </button>
              ) : nextWorld ? (
                <button onClick={() => startWorld({ ...nextWorld, unlocked: true }, 0)}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                  다음 월드 도전! → {nextWorld.emoji}
                </button>
              ) : (
                <div style={{ color: "#FFB800", fontWeight: 800, fontSize: 15, textAlign: "center", padding: "10px" }}>🏆 모든 단어 완료!</div>
              )}
              <button onClick={() => setScreen((typeof w !== "undefined" && w?.isCustom) || activeWorld?.isCustom ? (customOnlyMode ? "customVocab" : "levelselect") : "map")}
                style={{ padding: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, color: "rgba(255,255,255,0.55)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                홈으로
              </button>
            </div>
          );
        })()}
      </div>
      </div>
    </div>
  );

  // ── REVIEW DONE (복습 완료) ──────────────
  if (screen === "reviewdone") {
    const p         = progress.find(p => p.worldId === w.id);
    const allClear  = p.failed.length === 0;
    const rate      = finalTotal > 0 ? Math.round(finalCorrect / finalTotal * 100) : 0;

    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>

          {/* 이모지 + 타이틀 */}
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {allClear ? "🎊" : rate >= 70 ? "💪" : "🔥"}
          </div>
          <div style={{ color: w.color, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>복습 완료!</div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
            {allClear ? "완벽 마스터!" : rate >= 70 ? "많이 외웠어요!" : "조금만 더!"}
          </h2>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>
            {finalTotal}개 중 {finalCorrect}개 정답
          </div>

          {/* 스코어 카드 */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: allClear ? w.color : rate >= 70 ? "#FFB800" : "#EF4444", lineHeight: 1 }}>{rate}%</div>

            {/* 상세 카운트 */}
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: w.color, fontSize: 22, fontWeight: 900 }}>{finalCorrect}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>맞힌 단어</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#EF4444", fontSize: 22, fontWeight: 900 }}>{finalTotal - finalCorrect}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>아직 틀린 단어</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#FFB800", fontSize: 22, fontWeight: 900 }}>+{finalCorrect * XP_CORRECT}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>XP 획득</div>
              </div>
            </div>

            {/* 남은 틀린 단어 안내 */}
            {p.failed.length > 0 && (
              <div style={{ marginTop: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 700 }}>
                  아직 {p.failed.length}개 남았어요 → 다시 복습하면 없어져요!
                </div>
              </div>
            )}
            {allClear && (
              <div style={{ marginTop: 16, background: `${w.color}10`, border: `1px solid ${w.color}25`, borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ color: w.color, fontSize: 12, fontWeight: 700 }}>
                  🎉 틀린 한자를 모두 마스터했어요!
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 다음 단계 버튼 — 복습 후에도 바로 이동 가능 */}
            {(() => {
              const nw = WORLDS.find(w2 => w2.id === w.id + 1);
              return nw ? (
                <button onClick={() => startWorld({ ...nw, unlocked: true })}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  다음 단계 도전! → {nw.emoji}
                </button>
              ) : null;
            })()}
            {p.failed.length > 0 && (
              <button onClick={() => startReview(w)}
                style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 18, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🔁 한 번 더 복습!
              </button>
            )}
            <button onClick={() => setScreen(activeWorld?.isCustom ? "customVocab" : "map")}
              style={{ padding: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {activeWorld?.isCustom ? "내 한자장으로" : "홈으로"}
            </button>
          </div>

          <div style={{ marginTop: 24, color: "rgba(255,184,0,0.25)", fontSize: 10 }}>
            교육부 고시 제2022-33호 [별책 14] · <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ── RESULT (실패) ─────────────────────────
  if (screen === "result") {
    const rate = finalTotal > 0 ? Math.round(finalCorrect / finalTotal * 100) : 0;
    const p    = progress.find(p => p.worldId === w.id);
    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>다시 도전!</h2>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 28 }}>클리어 조건: 70% 이상 정답</div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "28px", marginBottom: 20 }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: "#EF4444", lineHeight: 1 }}>{rate}%</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 8 }}>{finalTotal}개 중 {finalCorrect}개 정답</div>
            {p.failed.length > 0 && (
              <div style={{ marginTop: 10, color: "#EF4444", fontSize: 12, fontWeight: 600 }}>
                틀린 단어 {p.failed.length}개 → 다음엔 먼저 나와요!
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 다음 단계 버튼 — 최우선 */}
            {(() => {
              const nw = WORLDS.find(w2 => w2.id === w.id + 1);
              return nw ? (
                <button onClick={() => startWorld({ ...nw, unlocked: true })}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  다음 단계 도전! → {nw.emoji}
                </button>
              ) : null;
            })()}
            {/* 커스텀 세트 다시 도전 */}
            {activeWorld?.isCustom && (
              <button onClick={() => startCustomWorld(activeWorld, false)}
                style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer" }}>
                🔄 다시 도전
              </button>
            )}
            {/* 틀린 단어 복습 */}
            {p.failed.length > 0 && (
              <button onClick={() => startReview(w)}
                style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 18, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🔁 틀린 단어 복습 <span style={{ background: "rgba(239,68,68,0.18)", borderRadius: 20, padding: "1px 8px", fontSize: 12 }}>{p.failed.length}개</span>
              </button>
            )}
            <button onClick={() => setScreen(activeWorld?.isCustom ? "customVocab" : "map")}
              style={{ padding: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {activeWorld?.isCustom ? "내 한자장으로" : "홈으로"}
            </button>
          </div>
          <div style={{ marginTop: 24, color: "rgba(255,184,0,0.25)", fontSize: 10 }}>
            교육부 고시 제2022-33호 [별책 14] · <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return null;
}

