import { useEffect } from 'react';

export function useManifest(manifestPath: string) {
  useEffect(() => {
    const link = document.head.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const originalHref = link?.getAttribute('href') ?? '/manifest.json';

    if (link) {
      link.setAttribute('href', manifestPath);
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'manifest';
      newLink.href = manifestPath;
      document.head.appendChild(newLink);
    }

    return () => {
      const el = document.head.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (el) el.setAttribute('href', originalHref);
    };
  }, [manifestPath]);
}
