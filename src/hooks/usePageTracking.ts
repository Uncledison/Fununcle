import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

/**
 * SPA 라우트 변경 시 Google Analytics 페이지뷰 이벤트 전송
 */
export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: location.pathname,
                page_location: window.location.href,
                page_title: document.title,
            });
        }
    }, [location.pathname]);
}
