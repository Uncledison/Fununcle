import { useEffect } from 'react';

// 경로별 PWA 정체성(매니페스트 + 아이콘)을 React 라우팅 중에도 항상 맞춰준다.
// index.html의 인라인 스크립트는 '첫 풀로드' 때만 실행되므로, SPA 이동
// (홈 → 카드 클릭)으로 들어오면 매니페스트가 루트(Fun Uncle)인 채로 남는다.
// 이 훅이 각 페이지에서 마운트 시 올바른 매니페스트/아이콘으로 강제 교체한다.
type Variant = 'root' | 'english' | 'hanja';

const CONFIG: Record<Variant, { manifest: string; icon: string }> = {
  root:    { manifest: '/manifest.json',         icon: '/icon-192.png' },
  english: { manifest: '/manifest-english.json', icon: '/icon-english-192.png' },
  hanja:   { manifest: '/manifest-hanja.json',   icon: '/icon-hanja-192.png' },
};

export function usePwaManifest(variant: Variant) {
  useEffect(() => {
    const { manifest, icon } = CONFIG[variant];
    const m = document.querySelector('link[rel="manifest"]');
    if (m) m.setAttribute('href', manifest);
    // iOS '홈 화면에 추가' 및 안드로이드 바로가기 폴백은 apple-touch-icon/favicon을 쓴다.
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach((el) => el.setAttribute('href', icon));
    const fav = document.querySelector('link[rel="icon"]');
    if (fav) fav.setAttribute('href', icon);
  }, [variant]);
}
