import { useEffect } from 'react';

interface Seo {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  image?: string;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// SPA 라우트별 동적 SEO. 구글(JS 렌더링)에는 반영되며,
// 카카오/네이버 OG 수집기는 원본 HTML만 보므로 한계가 있음(옵션 A).
export function usePageSeo({ title, description, keywords, url, image }: Seo) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    if (url) setMeta('property', 'og:url', url);
    if (image) setMeta('property', 'og:image', image);
    return () => {
      document.title = prevTitle;
    };
  }, [title, description, keywords, url, image]);
}
