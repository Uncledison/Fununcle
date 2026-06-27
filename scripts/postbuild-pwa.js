// 빌드 후 경로별 정적 PWA 진입 HTML 생성.
// /english, /hanja 는 각자 매니페스트/아이콘 <link>가 '정적으로' 박힌 별도
// HTML로 서빙된다(vercel.json rewrites). JS로 매니페스트를 바꾸지 않으므로
// 크롬이 설치/업데이트 시점에 항상 올바른 매니페스트를 읽어 WebAPK 정체성이
// 꼬이지 않는다. 같은 JS 번들을 로드하므로 SPA 동작은 동일.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const index = readFileSync(resolve(dist, 'index.html'), 'utf-8');

function makeVariant(manifestHref, iconHref) {
  return index
    .replaceAll('href="/manifest.json"', `href="${manifestHref}"`)
    .replaceAll('href="/icon-192.png"', `href="${iconHref}"`);
}

const targets = [
  { file: 'english.html', manifest: '/manifest-english.json', icon: '/icon-english-192.png' },
  { file: 'hanja.html',   manifest: '/manifest-hanja.json',   icon: '/icon-hanja-192.png' },
];

for (const t of targets) {
  writeFileSync(resolve(dist, t.file), makeVariant(t.manifest, t.icon));
  console.log(`postbuild-pwa: generated dist/${t.file} (${t.manifest})`);
}
