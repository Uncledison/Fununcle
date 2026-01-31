import React, { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { InteractiveMascot } from '../components/InteractiveMascot';
import { EraBackground } from '../components/EraBackground';
import { historyEvents } from '../data/historyEvents';
import { BackgroundMusic } from '../components/BackgroundMusic';

export const HistoryGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef });
    const [currentYear, setCurrentYear] = useState(2026);

    // 1. COMPACT Spacing Logic (Reduced by ~60%)
    const { eventPositions, totalHeight, finalPos } = useMemo(() => {
        let currentPos = 0;
        const positions = historyEvents.map((event, index) => {
            const isFirst = index === 0;

            // Much tighter gaps for faster pacing
            let gap = 500;

            if (event.category === 'tech' && event.year > 1900) {
                gap = 800;
            }

            if (isFirst) currentPos = window.innerHeight * 0.9;
            else currentPos += gap;

            return { ...event, top: currentPos, gap };
        });

        const finalPos = currentPos;

        return {
            eventPositions: positions,
            finalPos,
            totalHeight: currentPos + 1500 + window.innerHeight * 1.5 // Increased buffer for mobile scrolling
        };
    }, []);

    // 2. Spotlight Radial Gradient
    const backgroundColor = useTransform(
        scrollY,
        [0, totalHeight * 0.2, totalHeight * 0.5, totalHeight * 0.8, totalHeight],
        ["#1e1b4b", "#0f172a", "#14532d", "#3f1a1a", "#000000"]
    );

    // Gradient center color (brighter) vs edge color (darker)
    const backgroundStyle = {
        background: useTransform(backgroundColor, (color) => `radial-gradient(circle at center, ${color} 0%, #000000 100%)`)
    };

    // 3. Year Counter 
    useMotionValueEvent(scrollY, "change", (latest) => {
        let activeIndex = -1;
        for (let i = 0; i < eventPositions.length; i++) {
            if (latest < eventPositions[i].top) {
                activeIndex = i - 1;
                break;
            }
            activeIndex = i;
        }

        if (activeIndex < 0) {
            setCurrentYear(2026);
            return;
        }
        if (activeIndex >= eventPositions.length - 1) {
            setCurrentYear(eventPositions[eventPositions.length - 1].year);
            return;
        }

        const prevEvent = eventPositions[activeIndex];
        const nextEvent = eventPositions[activeIndex + 1];
        const segmentProgress = (latest - prevEvent.top) / (nextEvent.top - prevEvent.top);
        const clampedProgress = Math.max(0, Math.min(1, segmentProgress));
        const y1 = prevEvent.year;
        const y2 = nextEvent.year;
        setCurrentYear(Math.round(y1 + (y2 - y1) * clampedProgress));
    });

    const formatYear = (y: number) => {
        if (y > 0) return `${y} 년`;
        const absY = Math.abs(y);
        if (absY >= 100000000) return `${(absY / 100000000).toFixed(1)}억 년 전`;
        if (absY >= 10000) return `${(absY / 10000).toFixed(0)}만 년 전`;
        return `기원전 ${absY.toLocaleString()} 년`;
    };

    return (
        <motion.div
            ref={containerRef}
            style={backgroundStyle}
            className="w-full h-screen text-white overflow-y-scroll relative font-[Pretendard, -apple-system, BlinkMacSystemFont, system-ui] scroll-smooth"
        >
            {/* Header */}
            <div className="fixed top-0 left-0 w-full px-3 py-4 z-50 flex items-center justify-between pointer-events-none">
                <Link to="/" className="text-white/80 hover:text-white transition-colors group no-underline pointer-events-auto">
                    <motion.div
                        whileHover={{ y: -3, scale: 1.1, rotate: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="inline-block"
                    >
                        <span className="font-fun text-xl tracking-tight" style={{ fontFamily: '"Patrick Hand", cursive' }}>Fun.Uncle</span>
                    </motion.div>
                </Link>
                <div className="bg-black/10 px-5 py-2 rounded-full backdrop-blur-sm border border-white/5 shadow-lg flex items-center gap-2 pointer-events-auto">
                    {/* BGM Toggle - Left */}
                    <BackgroundMusic className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity scale-90" />

                    {/* Year Counter - Right (Matched Fun.Uncle Color) */}
                    <span className="text-sm font-medium text-white/80 tabular-nums tracking-wide">
                        {formatYear(currentYear)}
                    </span>
                </div>
            </div>

            {/* Central Timeline Line (Restored) */}
            <div className="fixed top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2 pointer-events-none z-10 hidden md:block"></div>

            {/* Main Scroll Content */}
            <div className="w-full relative" style={{ height: `${totalHeight} px` }}>

                {/* Intro Title */}
                <div className="w-full flex flex-col items-center justify-center pt-[20vh] sticky top-[10vh] z-0 pointer-events-none">
                    <motion.div
                        style={{ opacity: useTransform(scrollY, [0, 300], [1, 0]), scale: useTransform(scrollY, [0, 300], [1, 0.9]) }}
                        className="text-center"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-4 drop-shadow-2xl tracking-tighter">
                            인류의 진화
                        </h1>
                        <p className="text-xl text-blue-100/80 font-light tracking-wide max-w-md mx-auto leading-relaxed">
                            우주의 탄생부터 인공지능의 시대까지.<br />그 장대한 여정을 스크롤 해보세요.
                        </p>

                        <div className="mt-16 animate-bounce opacity-40">
                            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white to-transparent mx-auto"></div>
                        </div>
                    </motion.div>
                </div>

                {/* Vertical Timeline Line - Sparkle Effect */}
                <motion.div
                    style={{
                        opacity: useTransform(scrollY, [200, 500, finalPos, finalPos + 300], [0, 0.4, 0.4, 0]),
                        background: 'linear-gradient(to bottom, transparent, #60a5fa, transparent)',
                        backgroundSize: '1px 200px'
                    }}
                    className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 animate-[pulse_2s_infinite]"
                />
                <motion.div
                    style={{ opacity: useTransform(scrollY, [200, 500, finalPos, finalPos + 300], [0, 0.8, 0.8, 0]) }}
                    className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
                >
                    {/* Moving Sparkle Highlight */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white to-transparent animate-[shimmer_3s_linear_infinite]"
                        style={{
                            backgroundSize: '100% 50%',
                            backgroundRepeat: 'repeat-y'
                        }}
                    />
                    <style>{`
@keyframes shimmer {
    0 % { background- position: 0 % 0 %;
}
100 % { background- position: 0 % 100 %; }
                        }
`}</style>
                </motion.div>

                {/* Era Specific Background Effects (Stars, Meteors, Big Bang) */}
                <EraBackground currentYear={currentYear} />

                {/* Visual Texture */}
                <div className="fixed inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

                {/* Events */}
                {eventPositions.map((event, index) => {
                    const isEven = index % 2 === 0;
                    const absYear = Math.abs(event.year);

                    // Color Logic
                    let yearColor = "text-yellow-400";
                    if (absYear > 1000000000) yearColor = "text-purple-400";
                    else if (absYear > 65000000) yearColor = "text-red-400";
                    else if (absYear > 10000) yearColor = "text-emerald-400";

                    // Custom Logo Logic
                    const renderLogo = () => {
                        switch (event.emoji) {
                            case "N": // Naver (Keep as code per previous instruction unless changed)
                                return (
                                    <div className="w-32 h-32 bg-[#03C75A] rounded-[2rem] shadow-[0_8px_32px_rgba(3,199,90,0.4)] border border-white/10 flex items-center justify-center text-6xl font-black text-white shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(3,199,90,0.6)]">
                                        N
                                    </div>
                                );
                            case "KAKAO_TALK":
                                return (
                                    <div className="w-32 h-32 bg-[#FEE500] rounded-[2rem] shadow-[0_8px_32px_rgba(254,229,0,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(254,229,0,0.6)] overflow-hidden">
                                        <img src="/assets/logos/kakaotalk.png" alt="KakaoTalk" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "KAKAO_CORP":
                                // Fallback to Yellow Box or use generic logo if requested? keeping text for now as specific image was talk
                                return (
                                    <div className="w-32 h-32 bg-[#FEE500] rounded-[2rem] shadow-[0_8px_32px_rgba(254,229,0,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(254,229,0,0.6)]">
                                        <span className="text-[#3A1D1D] font-black text-3xl tracking-tighter">KAKAO</span>
                                    </div>
                                );
                            case "TESLA":
                                return (
                                    <div className="w-32 h-32 bg-[#E82127] rounded-[2rem] shadow-[0_8px_32px_rgba(232,33,39,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(232,33,39,0.6)] overflow-hidden">
                                        <img src="/assets/logos/tesla.png" alt="Tesla" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "SPACEX":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/20 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/spacex.png" alt="SpaceX" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "DAUM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-4">
                                        <img src="/assets/logos/daum.png" alt="Daum" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "LINEAGE":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/lineage.png" alt="Lineage" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "HANMAIL":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-3">
                                        <img src="/assets/logos/hanmail.png" alt="Hanmail" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "SAMSUNG_DRAM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/samsung_dram.png" alt="Samsung DRAM" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "APPLE":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-4">
                                        <img src="/assets/logos/apple_rainbow.png" alt="Apple" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "GEMINI_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-3">
                                        <img src="/assets/logos/gemini_logo.png" alt="Gemini" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "CHATGPT_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-[#10A37F] rounded-[2rem] shadow-[0_8px_32px_rgba(16,163,127,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(16,163,127,0.6)] overflow-hidden p-4">
                                        <img src="/assets/logos/chatgpt_logo.png" alt="ChatGPT" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "GALAXY_FOLD":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/galaxy_fold.png" alt="Galaxy Fold" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "DAUM_KAKAO_MERGER":
                                return (
                                    <div className="w-32 h-32 bg-[#FEE500] rounded-[2rem] shadow-[0_8px_32px_rgba(254,229,0,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(254,229,0,0.6)] overflow-hidden">
                                        <img src="/assets/logos/daum_kakao_merger.png" alt="Daum Kakao Merger" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "BENZ_MOTORWAGEN":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/benz_car.png" alt="Benz Motorwagen" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "GALAXY_S":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/galaxy_s.jpg" alt="Galaxy S" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "MICROSOFT_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-3">
                                        <img src="/assets/logos/microsoft_logo.png" alt="Microsoft" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "HYUNDAI_PONY":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/hyundai_pony.png" alt="Hyundai Pony" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "FORD_MODEL_T":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/ford_model_t.png" alt="Ford Model T" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "POSCO_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-[#F68A1E] rounded-[2rem] shadow-[0_8px_32px_rgba(246,138,30,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(246,138,30,0.6)] overflow-hidden">
                                        <img src="/assets/logos/posco_vintage.png" alt="POSCO" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "SK_VINTAGE":
                                return (
                                    <div className="w-32 h-32 bg-[#0068B7] rounded-[2rem] shadow-[0_8px_32px_rgba(0,104,183,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(0,104,183,0.6)] overflow-hidden">
                                        <img src="/assets/logos/sk_vintage.png" alt="Sunkyong" className="w-full h-full object-cover" />
                                        {/* Matches Sunkyong Blue */}
                                    </div>
                                );
                            case "LUCKY_VINTAGE":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/lucky_vintage.png" alt="Lucky Chemical" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "IPHONE_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/iphone.png" alt="iPhone" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "SK_HBM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/sk_hbm.png" alt="SK HBM" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "FALCON9":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/falcon9_final.png" alt="Falcon 9" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "NCSOFT":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/ncsoft_logo.png" alt="NCSoft" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "BARAM_OF_THE_WIND":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/baram.png" alt="Baram of the Wind" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "DAUM_COMM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/daum_comm.png" alt="Daum Communications" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "NEXON":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/nexon_logo.jpg" alt="Nexon" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "NVIDIA":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-3">
                                        <img src="/assets/logos/nvidia_logo.png" alt="NVIDIA" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "HYUNDAI_TOGEON":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/현대토건.png" alt="Hyundai Construction" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "SAMSUNG_SANGHOE":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/SAMSUNG.png" alt="Samsung Sanghoe" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "NASA_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-[#0B3D91] rounded-[2rem] shadow-[0_8px_32px_rgba(11,61,145,0.4)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(11,61,145,0.6)] overflow-hidden">
                                        <img src="/assets/logos/nasa_logo.png" alt="NASA" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "HUNMINJEONGEUM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/훈민정음.png" alt="Hunminjeongeum" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "CHEUGUGI":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/측우기.png" alt="Cheugugi" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "JAGYEONGNU":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/자격루.png" alt="Jagyeongnu" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "HWATONG_DOGAM":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/화통도감.png" alt="Hwatong Dogam" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "WHEEL":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/바퀴.png" alt="Wheel" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "LIGHT_BULB":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-3">
                                        <img src="/assets/logos/bulb.png" alt="Light Bulb" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "TELEPHONE":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/telephone.png" alt="Telephone" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "STEAM_ENGINE":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/steam_engine.png" alt="Steam Engine" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "APOLLO11":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/apollo11.png" alt="Apollo 11" className="w-full h-full object-cover" />
                                    </div>
                                );
                            // AI & Modern Tech
                            case "AGENTIC_AI":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/ai_agent.png" alt="Agentic AI" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "KLING_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/kling.png" alt="Kling AI" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "HAILUO_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/hailuo.png" alt="Hailuo AI" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "SORA_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/sora.png" alt="Sora" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "GROK_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/grok.png" alt="Grok" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "CLAUDE_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/Claude.png" alt="Claude" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "PERPLEXITY_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/Perplexity.png" alt="Perplexity" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "ELEVENLABS_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/ElevenLabs.png" alt="ElevenLabs" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "MIDJOURNEY_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/midjourney.png" alt="Midjourney" className="w-full h-full object-contain" />
                                    </div>
                                );
                            case "GAMMA_LOGO":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden p-2">
                                        <img src="/assets/logos/gamma.png" alt="Gamma" className="w-full h-full object-contain" />
                                    </div>
                                );

                            // Space & History
                            case "NURIHO":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/누리호.png" alt="Nuriho" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "NAROHO":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/나로호.png" alt="Naroho" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "ARIRANG1":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/아리랑1.png" alt="Arirang 1" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "KSR1":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/ksr-1.png" alt="KSR-1" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "URIBYEOL1":
                                return (
                                    <div className="w-32 h-32 bg-black rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/우리별1호.png" alt="Uribyeol 1" className="w-full h-full object-cover" />
                                    </div>
                                );
                            case "HYUNDAI_SHIPYARD":
                                return (
                                    <div className="w-32 h-32 bg-white rounded-[2rem] shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/10 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)] overflow-hidden">
                                        <img src="/assets/logos/현대조선소.png" alt="Hyundai Shipyard" className="w-full h-full object-cover" />
                                    </div>
                                );
                            default:
                                return (
                                    <div className="w-32 h-32 bg-white/5 backdrop-blur-lg rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-center text-6xl shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10 group-hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
                                        {event.emoji}
                                    </div>
                                );
                        }
                    };


                    return (
                        <motion.div
                            key={index}
                            className={`absolute left-1/2 flex items-center gap-6 group transition-all
flex-col-reverse -translate-x-1/2 w-[80vw] text-center
md:w-[550px] md:justify-end
                                ${isEven
                                    ? 'md:flex-row md:-translate-x-full md:pr-8 md:text-right'
                                    : 'md:flex-row-reverse md:pl-8 md:text-left md:translate-x-0'
                                }
`}
                            style={{ top: event.top }}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        >
                            {/* Text Content */}
                            <div className="flex-1 z-20 bg-black/30 backdrop-blur-md rounded-2xl p-6 md:bg-transparent md:backdrop-blur-none md:p-0 md:rounded-none">
                                <div className={`font-bold mb-2 text-sm md:text-lg tracking-wide opacity-80 ${yearColor} md:mb-2`}>{formatYear(event.year)}{event.month ? `.${event.month} ` : ""}</div>
                                <h3 className={`text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-sm tracking-tight transition-transform duration-300 group-hover:scale-105 group-hover:text-blue-200 origin-center ${isEven ? 'md:origin-right' : 'md:origin-left'} `}>{event.title}</h3>
                                <p className="text-white/60 font-medium text-sm md:text-lg leading-relaxed break-keep">{event.description}</p>
                            </div>

                            {/* Render Logo */}
                            <div className="z-20">
                                {renderLogo()}
                            </div>

                            {/* Connector Node */}
                            <div className={`hidden md:block absolute top-1/2 w-3 h-3 bg-white rounded-full ${isEven ? 'right-[-6px]' : 'left-[-6px]'} -translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,1)] z-20`}></div>

                            {/* Connector Line Gradient */}
                            <div className={`hidden md:block absolute top-1/2 h-[1px] w-20 ${isEven ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-white to-transparent opacity-50`}></div>
                        </motion.div>
                    );
                })}

                {/* Outro Section (Corrected Position & Size) */}
                <motion.div
                    style={{
                        top: finalPos + 600,
                        transform: 'translateY(-50%)' // Center the element itself on its anchor point
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-full flex flex-col items-center justify-center z-50 text-center pb-0"
                >
                    {/* 1. Main Title */}
                    <div className="flex flex-col items-center gap-1">
                        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter">
                            인류의 진화
                        </h1>

                        {/* 2. Brand Identity (Logo) - Negative margin to counteract scale whitespace */}
                        <div className="flex flex-col items-center justify-center group scale-[0.65] md:scale-[0.7] -mt-8">
                            {/* FUN UNCLE Row */}
                            <div className="flex items-center gap-1">
                                {/* FUN */}
                                <span className="text-5xl font-fun text-white tracking-tighter inline-block origin-bottom" style={{ fontFamily: '"Patrick Hand", cursive' }}>
                                    FUN
                                </span>

                                {/* Face (Home Link) */}
                                <Link to="/">
                                    <motion.div
                                        className="w-16 h-16 flex items-center justify-center -mx-1 relative z-10 cursor-pointer mt-4"
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <InteractiveMascot />
                                    </motion.div>
                                </Link>

                                {/* UNCLE */}
                                <span className="text-5xl font-fun text-white tracking-tighter inline-block origin-bottom" style={{ fontFamily: '"Patrick Hand", cursive' }}>
                                    UNCLE
                                </span>
                            </div>

                            {/* Subtitle */}
                            <div className="text-sm text-white/50 font-medium tracking-wide mt-2" style={{ fontFamily: '"Patrick Hand", cursive' }}>
                                By Uncledison
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
