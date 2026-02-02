import { useEffect } from 'react';

export const useFavicon = (href: string) => {
    useEffect(() => {
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        const originalHref = link ? link.href : '/icon-192.png';

        if (link) {
            link.href = href;
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = href;
            document.head.appendChild(newLink);
        }

        return () => {
            if (link) {
                link.href = originalHref;
            }
        };
    }, [href]);
};
