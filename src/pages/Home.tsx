import React from 'react';
import { Header } from '../components/Header';
import { BentoGrid } from '../components/BentoGrid';
import { CursorParticles } from '../components/CursorParticles';

export const Home: React.FC = () => {
    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            <CursorParticles />
            <div className="relative z-10">
                <Header />
                <BentoGrid />
            </div>

            {/* Kakao Share Floating Button */}
            <button
                onClick={() => {
                    const kakao = (window as any).Kakao;
                    if (kakao) {
                        if (!kakao.isInitialized()) {
                            kakao.init('8e68190d1ba932955a557fbf0ae0b659');
                        }
                        kakao.Share.sendDefault({
                            objectType: 'feed',
                            content: {
                                title: 'Fun.Uncle - 심심할 땐 엉클에디슨!',
                                description: '다양한 미니게임과 심리테스트를 즐겨보세요! 👇',
                                imageUrl: 'https://fun.uncledison.com/assets/bottle_share_square.png',
                                link: {
                                    mobileWebUrl: window.location.origin,
                                    webUrl: window.location.origin,
                                },
                            },
                            buttons: [
                                {
                                    title: '놀러가기',
                                    link: {
                                        mobileWebUrl: window.location.origin,
                                        webUrl: window.location.origin,
                                    },
                                },
                            ],
                        });
                    }
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#FEE500] rounded-full shadow-lg z-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                aria-label="카카오톡 공유하기"
            >
                <svg viewBox="0 0 24 24" fill="#3B1E1E" className="w-7 h-7">
                    <path d="M12 3C7.58 3 4 5.79 4 9.24C4 11.22 5.21 12.96 7 14.12L6.16 17.27C6.1 17.5 6.36 17.7 6.58 17.57L10.03 15.42C10.66 15.5 11.31 15.5 12 15.5C16.42 15.5 20 12.71 20 9.24C20 5.79 16.42 3 12 3Z" />
                </svg>
            </button>
        </main>
    );
};
