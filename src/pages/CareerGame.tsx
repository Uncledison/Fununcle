import React, { useEffect } from 'react';

// career.uncledison.com 으로 직접 연결로 전환됨.
// 기존에 카톡 등으로 공유된 fun.uncledison.com/career 링크가 깨지지 않도록 리다이렉트로 유지.
export const CareerGame: React.FC = () => {
    useEffect(() => {
        window.location.replace('https://career.uncledison.com/');
    }, []);

    return (
        <div className="w-full flex items-center justify-center" style={{ height: '100dvh' }}>
            <a href="https://career.uncledison.com/" className="text-gray-500 underline">
                Career Compass로 이동 중…
            </a>
        </div>
    );
};
