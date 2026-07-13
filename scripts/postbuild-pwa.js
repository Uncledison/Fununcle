// 빌드 후 경로별 정적 PWA 진입 HTML 생성.
// /english, /hanja 는 각자 매니페스트/아이콘 <link>가 '정적으로' 박힌 별도
// HTML로 서빙된다(vercel.json rewrites). JS로 매니페스트를 바꾸지 않으므로
// 크롬이 설치/업데이트 시점에 항상 올바른 매니페스트를 읽어 WebAPK 정체성이
// 꼬이지 않는다. 같은 JS 번들을 로드하므로 SPA 동작은 동일.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const index = readFileSync(resolve(dist, 'index.html'), 'utf-8');

function makeVariant(t) {
  return index
    .replaceAll('href="/manifest.json"', `href="${t.manifest}"`)
    .replaceAll('href="/icon-192.png"', `href="${t.icon}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${t.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${t.description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${t.description}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${t.image}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${t.url}$2`);
}

// title/description/image 값은 각 페이지의 usePageSeo() 호출과 동일하게 맞춘다
// (WordGame.tsx, HanjaGame.tsx). 카톡 등 링크 미리보기 봇은 JS를 실행하지
// 않으므로 usePageSeo가 클라이언트에서 바꾸는 것과 별개로 정적 HTML에도
// 박아둬야 한다.
const targets = [
  {
    file: 'english.html', manifest: '/manifest-english.json', icon: '/icon-english-192.png',
    title: '초중고 영단어 플래시카드 | 교육부 필수 영단어 암기',
    description: '교육부 권장 3,000 영단어를 플래시카드로 재미있게 암기. 초등 797·중고등 2,210 필수 영어단어. 가입 없이 무료 영단어 암기 학습.',
    url: 'https://fun.uncledison.com/english',
    image: 'https://fun.uncledison.com/assets/wordgame_banner.png',
  },
  {
    file: 'hanja.html', manifest: '/manifest-hanja.json', icon: '/icon-hanja-192.png',
    title: '한국어문회 한자 플래시카드 | 8급·준7급·7급 한자능력검정',
    description: '한국어문회 한자능력검정시험 8급·준7급·7급 한자를 플래시카드로 재미있게 암기. 나만의 한자장도 직접 추가. 가입 없이 무료 학습.',
    url: 'https://fun.uncledison.com/hanja',
    image: 'https://fun.uncledison.com/assets/hanja_kakao.png',
  },
];

for (const t of targets) {
  writeFileSync(resolve(dist, t.file), makeVariant(t));
  console.log(`postbuild-pwa: generated dist/${t.file} (${t.manifest})`);
}
