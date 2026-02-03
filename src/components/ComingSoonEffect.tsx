import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonEffectProps {
    isActive: boolean;
    onComplete: () => void;
}

const EMOJIS = ['❓', '❔', '❗', '🚧', '🔨', '🧐', '👀'];
const MESSAGES = [
    "열심히 공사 중입니다! 🔨",
    "조금만 기다려주세요! ⏳",
    "더 재미있는 게임을 준비 중! 🎮",
    "쉿! 1급 비밀입니다 🤫",
    "Coming Soon... ✨",
    "기대하셔도 좋아요! 😎"
];

export const ComingSoonEffect: React.FC<ComingSoonEffectProps> = ({ isActive, onComplete }) => {
    const [particles, setParticles] = useState<{ id: number; x: number; emoji: string; delay: number }[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (isActive) {
            // Generate Message
            setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

            // Generate Particles
            const newParticles = Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // percentage
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                delay: Math.random() * 0.5
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            setParticles([]);
        }
    }, [isActive, onComplete]);

    return (
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
                    {/* Speech Bubble */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="bg-white px-8 py-4 rounded-full shadow-2xl border-2 border-black relative z-50 mb-32"
                    >
                        <span className="text-xl md:text-2xl font-bold text-black whitespace-nowrap" style={{ fontFamily: '"Apple SD Gothic Neo", sans-serif' }}>
                            {message}
                        </span>
                        {/* Triangle */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-white"></div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-black -z-10 mt-[1.5px]"></div>
                    </motion.div>

                    {/* Emoji Rain */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ y: -100, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
                            animate={{ y: '110vh', rotate: 360 }}
                            transition={{ duration: 2, ease: "linear", delay: p.delay }}
                            className="absolute top-0 text-4xl"
                        >
                            {p.emoji}
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};
