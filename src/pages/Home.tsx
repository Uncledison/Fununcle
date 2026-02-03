import React from 'react';
import { Header } from '../components/Header';
import { BentoGrid } from '../components/BentoGrid';


export const Home: React.FC = () => {
    return (
        <main className="min-h-screen bg-white relative overflow-x-hidden">
            {/* Mascot positioned relative to this container */}
            <div className="relative max-w-4xl mx-auto pt-12 md:pt-16">
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
                                title: '심심할 때 웃긴 삼촌!',
                                description: '다양한 미니게임과 진로테스트를 즐겨보세요!',
                                imageUrl: 'https://fun.uncledison.com/assets/fununcle_share_square.png',
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
                className="fixed bottom-[90px] right-4 w-12 h-12 bg-[#FAE100] rounded-full shadow-lg z-50 flex items-center justify-center opacity-90 transition-transform active:scale-95 hover:scale-105"
                style={{ boxShadow: '0 2px 3.84px rgba(0,0,0,0.15)' }}
                aria-label="카카오톡 공유하기"
            >
                {/* Minimalist Chat Bubble Icon mimicking Ionicons 'chatbubble-ellipses' */}
                <svg viewBox="0 0 512 512" className="w-6 h-6 ml-[1px] mt-[1px]" fill="#3C1E1E">
                    <path d="M408 64H104a56.16 56.16 0 00-56 56v192a56.16 56.16 0 0056 56h40v80l93.72-78.14a8 8 0 015.13-1.86H408a56.16 56.16 0 0056-56V120a56.16 56.16 0 00-56-56z" />
                    <circle cx="160" cy="216" r="32" fill="#FAE100" />
                    <circle cx="256" cy="216" r="32" fill="#FAE100" />
                    <circle cx="352" cy="216" r="32" fill="#FAE100" />
                </svg>
            </button>
        </main>
    );
};
