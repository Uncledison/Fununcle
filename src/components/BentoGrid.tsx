import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import humanEvolutionBanner from '../assets/human_evolution_banner.png';
import careerBanner from '../assets/career_banner.png';
import comingSoonBanner from '../assets/coming_soon_banner.png';
import circleBanner from '/banner.png';


import { Link } from 'react-router-dom';

import { ComingSoonEffect } from './ComingSoonEffect';
import { useState } from 'react';

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
    const baseClasses = `transition-all duration-300 w-full h-full relative z-10`;
    const defaultVisuals = "bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl";
    const combinedClassName = `${defaultVisuals} ${baseClasses} cursor-pointer ${className || ''}`;

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
            <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...motionProps}
                className={`block ${combinedClassName}`}
            >
                {children}
            </motion.a>
        );
    }

    // 3. Static Card or Clickable Div
    return (
        <motion.div
            {...motionProps}
            className={`${defaultVisuals} ${baseClasses} ${className || ''}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

export const BentoGrid: React.FC = () => {
    const [isComingSoonActive, setIsComingSoonActive] = useState(false);

    return (
        <div className="relative z-10 w-full min-h-screen px-4 pb-20 pt-10">
            <ComingSoonEffect
                isActive={isComingSoonActive}
                onComplete={() => setIsComingSoonActive(false)}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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


                {/* 5. Coming Soon - Interaction Trigger */}
                <BentoCard
                    delay={0.4}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video cursor-pointer"
                    onClick={() => setIsComingSoonActive(true)}
                    whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                    }}
                >
                    <div className="w-full h-full relative overflow-hidden">
                        <img
                            src={comingSoonBanner}
                            alt="Coming Soon"
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 brightness-90"
                        />
                        {/* Closed Badge */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
                            <span className="text-[10px]">🔒</span> Closed
                        </div>

                        {/* Glassmorphic Speech Bubble (Centered in Banner) */}
                        <AnimatePresence>
                            {isComingSoonActive && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="bg-white/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-lg relative"
                                    >
                                        <span className="text-sm md:text-base font-bold text-white whitespace-nowrap drop-shadow-md">
                                            {["열심히 공사 중! 🔨", "조금만 기다려요! ⏳", "1급 비밀 🤫", "Coming Soon... ✨"][Math.floor(Math.random() * 4)]}
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
