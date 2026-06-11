import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import humanEvolutionBanner from '../assets/human_evolution_banner.png';
import careerBanner from '../assets/career_banner.png';
import comingSoonBanner from '../assets/coming_soon_banner.png';
import circleBanner from '/banner.png';


import { Link } from 'react-router-dom';

import { ComingSoonEffect } from './ComingSoonEffect';
import { useState } from 'react';
import { COMING_SOON_MESSAGES, EMOJI_THEMES } from '../data/comingSoonData';

const BentoCard = ({
    children,
    className,
    delay = 0,
    href,
    whileHover,
    onClick
}: {
    children: React.ReactNode,
    className?: string,
    delay?: number,
    href?: string,
    whileHover?: any,
    onClick?: () => void
}) => {
    // Base classes that are always present
    const defaultVisuals = "bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl";


    const motionProps = {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.5, delay },
        whileHover: whileHover,
    };

    // 1. Internal Link (starts with /)
    if (href && href.startsWith('/')) {
        return (
            <Link
                to={href}
                className={`block ${className || ''} relative z-10`}
            >
                <motion.div
                    {...motionProps}
                    className={`${defaultVisuals} w-full h-full`}
                >
                    {children}
                </motion.div>
            </Link>
        );
    }

    // 2. External Link
    if (href && href !== '#') {
        return (
            <div className={`block ${className || ''} relative z-10 overflow-hidden rounded-3xl`}>
                <motion.a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...motionProps}
                    className={`block ${defaultVisuals} w-full h-full`}
                >
                    {children}
                </motion.a>
            </div>
        );
    }

    // 3. Static Card or Clickable Div
    return (
        <div className={`${className || ''} relative z-10 overflow-hidden rounded-3xl`}>
            <motion.div
                {...motionProps}
                className={`${defaultVisuals} w-full h-full`}
                onClick={onClick}
            >
                {children}
            </motion.div>
        </div>
    );
};

export const BentoGrid: React.FC = () => {
    const [clickCount, setClickCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeEffects, setActiveEffects] = useState<{ id: number; emojis: string[] }[]>([]);

    const handleComingSoonClick = () => {
        if (clickCount >= 50) {
            if (confirm("너 50번 눌렀다. 대단해!! 최고다 이제 처음부터 다시?? 🤪")) {
                setClickCount(0);
                setCurrentIndex(0);
                setActiveEffects([]); // Clear stack on reset
            }
            return;
        }

        let newIndex;
        // Logic: Random until 45, then Sequential for Countdown (45-49)
        if (clickCount < 45) {
            do {
                newIndex = Math.floor(Math.random() * 45); // Random from 0 to 44
            } while (newIndex === currentIndex && clickCount > 0); // Avoid repeat
        } else {
            // Sequential for countdown (45, 46, 47, 48, 49)
            newIndex = clickCount;
        }

        // Randomly select emoji theme for this click
        const randomEmojiIndex = Math.floor(Math.random() * EMOJI_THEMES.length);
        const selectedEmojis = EMOJI_THEMES[randomEmojiIndex];

        // Add new effect layer to the stack
        const newEffectId = Date.now() + Math.random();
        setActiveEffects(prev => [...prev, { id: newEffectId, emojis: selectedEmojis }]);

        setCurrentIndex(newIndex);
        setClickCount(prev => prev + 1);
    };

    const handleEffectComplete = (id: number) => {
        setActiveEffects(prev => prev.filter(effect => effect.id !== id));
    };

    // Derived state for message
    const currentMessage = COMING_SOON_MESSAGES[Math.min(currentIndex, COMING_SOON_MESSAGES.length - 1)];

    return (
        <div className="relative z-10 w-full min-h-screen px-4 pb-20 pt-10">
            {/* Render Multiple Stacking Emoji Rains */}
            {activeEffects.map(effect => (
                <ComingSoonEffect
                    key={effect.id}
                    isActive={true}
                    onComplete={() => handleEffectComplete(effect.id)}
                    emojis={effect.emojis}
                />
            ))}

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 0. 4ATT 우리 가족 동물검사 (정적 하위앱 /4att) */}
                <a
                    href="/4att/"
                    className="md:col-span-1 md:row-span-1 relative group block overflow-hidden rounded-3xl aspect-video z-10"
                    aria-label="우리 가족 동물검사 4ATT"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                        className="w-full h-full relative flex flex-col items-center justify-center"
                        style={{ background: 'radial-gradient(circle at 30% 18%, #FBEFD8, #FDF6EA 65%)' }}
                    >
                        <div className="absolute top-3 right-3 bg-[#E8A33D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                            NEW
                        </div>

                        <svg viewBox="0 0 240 68" className="w-[74%] mb-2 transition-transform duration-300 group-hover:scale-105">
                            {/* 사자 */}
                            <g>
                                <circle cx="30" cy="33" r="25" fill="#E8A33D" />
                                <circle cx="30" cy="6" r="5" fill="#E8A33D" />
                                <circle cx="11" cy="16" r="5" fill="#E8A33D" />
                                <circle cx="49" cy="16" r="5" fill="#E8A33D" />
                                <circle cx="6" cy="36" r="5" fill="#E8A33D" />
                                <circle cx="54" cy="36" r="5" fill="#E8A33D" />
                                <circle cx="30" cy="33" r="18" fill="#F8CD7A" />
                                <circle cx="23.5" cy="31" r="2.6" fill="#3A2E25" />
                                <circle cx="36.5" cy="31" r="2.6" fill="#3A2E25" />
                                <circle cx="24.5" cy="30" r="0.8" fill="#fff" />
                                <circle cx="37.5" cy="30" r="0.8" fill="#fff" />
                                <path d="M25 38 Q30 42 35 38" fill="none" stroke="#3A2E25" strokeWidth="1.6" strokeLinecap="round" />
                            </g>
                            {/* 돌고래 */}
                            <g>
                                <circle cx="92" cy="33" r="22" fill="#6CC3EF" />
                                <ellipse cx="92" cy="43" rx="12" ry="7" fill="#D6EEFB" />
                                <circle cx="85.5" cy="30" r="2.6" fill="#3A2E25" />
                                <circle cx="98.5" cy="30" r="2.6" fill="#3A2E25" />
                                <circle cx="86.5" cy="29" r="0.8" fill="#fff" />
                                <circle cx="99.5" cy="29" r="0.8" fill="#fff" />
                                <path d="M85 36 Q92 43 99 36 Q92 40 85 36 Z" fill="#2B4150" />
                            </g>
                            {/* 강아지 */}
                            <g>
                                <ellipse cx="135" cy="20" rx="7" ry="12" fill="#C9935E" transform="rotate(22 135 20)" />
                                <ellipse cx="165" cy="20" rx="7" ry="12" fill="#C9935E" transform="rotate(-22 165 20)" />
                                <circle cx="150" cy="34" r="22" fill="#F2D8B4" />
                                <circle cx="143.5" cy="31" r="2.6" fill="#3A2E25" />
                                <circle cx="156.5" cy="31" r="2.6" fill="#3A2E25" />
                                <circle cx="144.5" cy="30" r="0.8" fill="#fff" />
                                <circle cx="157.5" cy="30" r="0.8" fill="#fff" />
                                <ellipse cx="150" cy="37" rx="3" ry="2.3" fill="#5C4632" />
                                <path d="M150 39 Q150 43 145 43 M150 39 Q150 43 155 43" fill="none" stroke="#3A2E25" strokeWidth="1.4" strokeLinecap="round" />
                            </g>
                            {/* 비버 */}
                            <g>
                                <circle cx="210" cy="33" r="22" fill="#B07B52" />
                                <circle cx="196" cy="14" r="5" fill="#8F5E3C" />
                                <circle cx="224" cy="14" r="5" fill="#8F5E3C" />
                                <ellipse cx="210" cy="40" rx="10" ry="7.5" fill="#EBD3AE" />
                                <rect x="206.4" y="40" width="3.3" height="6.5" rx="1" fill="#fff" stroke="#D8C9A8" strokeWidth="0.4" />
                                <rect x="210.3" y="40" width="3.3" height="6.5" rx="1" fill="#fff" stroke="#D8C9A8" strokeWidth="0.4" />
                                <circle cx="203.5" cy="29" r="2.6" fill="#3A2E25" />
                                <circle cx="216.5" cy="29" r="2.6" fill="#3A2E25" />
                                <circle cx="204.5" cy="28" r="0.8" fill="#fff" />
                                <circle cx="217.5" cy="28" r="0.8" fill="#fff" />
                            </g>
                        </svg>

                        <h3 style={{ fontFamily: '"Do Hyeon", sans-serif' }} className="text-[#3A2E25] text-xl md:text-2xl leading-none">
                            우리 가족 동물검사
                        </h3>
                        <p className="text-[#3A2E25]/55 text-[11px] mt-1.5 font-medium tracking-wide">
                            사자 · 돌고래 · 강아지 · 비버 · 5분
                        </p>
                    </motion.div>
                </a>

                {/* 1. Career Compass (Internal via iframe) */}
                <BentoCard
                    href="/career"
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={careerBanner}
                            alt="Career Compass"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 2. Human Evolution (Internal Game) */}
                <BentoCard
                    href="/history"
                    delay={0.1}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={humanEvolutionBanner}
                            alt="Human Evolution"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 3. Perfect Circle (New Game) */}
                <BentoCard
                    href="/circle"
                    delay={0.2}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={circleBanner}
                            alt="Perfect Circle"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 4. Bottle Flip (New Game) */}
                <BentoCard
                    href="/bottle"
                    delay={0.3}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src="/assets/bottle_banner.png"
                            alt="Bottle Flip"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>


                {/* 5. Neon Tetris (New Game) */}
                <BentoCard
                    href="/tetris"
                    delay={0.4}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-[#0f0f1e] overflow-hidden rounded-3xl aspect-video border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 },
                        borderColor: '#00f0ff',
                        boxShadow: '0 0 30px rgba(0,240,255,0.3)'
                    }}
                >
                    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#0f0f1e] to-[#2a0e35] overflow-hidden">
                        {/* Neon Background Grid */}
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                            }}
                        />

                        {/* Text Branding */}
                        <div className="z-10 text-center">
                            <h3 className="text-6xl font-black italic text-white tracking-tighter drop-shadow-[0_0_20px_#00f0ff] leading-none transform skew-x-[-10deg]">
                                <span className="text-[#00f0ff] block mb-2">NEON</span>TETRIS
                            </h3>
                        </div>

                        {/* Floating Blocks Decor */}
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-4 left-4 w-8 h-8 bg-[#f0f000] shadow-[0_0_15px_#f0f000] rounded-sm opacity-80"
                        />
                        <motion.div
                            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-4 right-4 w-8 h-12 bg-[#a000f0] shadow-[0_0_15px_#a000f0] rounded-sm opacity-80"
                        />
                    </div>
                </BentoCard>

                {/* 6. Word Flashcard Game */}
                <BentoCard
                    href="/english"
                    delay={0.45}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src="/assets/wordgame_banner.png"
                            alt="영단어 플래시카드"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 7. Brain Diagnosis (External Link) */}
                <BentoCard
                    href="https://brain.uncledison.com"
                    delay={0.5}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                >
                    <div className="w-full h-full relative overflow-hidden rounded-3xl">
                        <img
                            src="/assets/brainbanner.png"
                            alt="뇌과학 자녀 진단센터"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                        />
                    </div>
                </BentoCard>

                {/* 8. Today Memory (External Link) */}
                <BentoCard
                    href="https://todaymemory.vercel.app"
                    delay={0.55}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                >
                    <div className="w-full h-full relative overflow-hidden rounded-3xl">
                        <img
                            src="/assets/todaymemory_banner.png"
                            alt="오늘의 기억력"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                        />
                    </div>
                </BentoCard>

                {/* 9. Coming Soon - Interaction Trigger */}
                <BentoCard
                    delay={0.5}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video cursor-pointer"
                    onClick={handleComingSoonClick}
                >
                    <div className="w-full h-full relative overflow-hidden">
                        <img
                            src={comingSoonBanner}
                            alt="Coming Soon"
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 brightness-90"
                        />
                        {/* Closed Badge */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
                            <span className="text-[10px]">🔒 Closed {clickCount > 0 && `(${clickCount})`}</span>
                        </div>

                        {/* Glassmorphic Speech Bubble (Centered in Banner) */}
                        <AnimatePresence>
                            {activeEffects.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                    <motion.div
                                        key={currentMessage} // Animate text change
                                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="bg-white/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-lg relative"
                                    >
                                        <span className="text-sm md:text-base font-bold text-white whitespace-nowrap drop-shadow-md">
                                            {currentMessage}
                                        </span>
                                        {/* Triangle */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/30"></div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </BentoCard>
            </div>

            <div className="text-center mt-20 text-gray-400 text-sm font-medium border-t border-gray-100 pt-8">
                © 2026 fun.uncledison.com
            </div>
        </div>
    );
};
