import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonEffectProps {
    isActive: boolean;
    onComplete: () => void;
    emojis: string[];
}

export const ComingSoonEffect: React.FC<ComingSoonEffectProps> = ({ isActive, onComplete, emojis }) => {
    const [particles, setParticles] = useState<{ id: number; x: number; emoji: string; delay: number; duration: number }[]>([]);
    useEffect(() => {
        if (isActive) {
            // Generate Particles - Increased count and better distribution
            const newParticles = Array.from({ length: 60 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // 0-100vw
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                delay: Math.random() * 1.5, // Spread out over time
                duration: 2 + Math.random() * 1.5 // Varied fall speed
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                onComplete();
            }, 3500);

            return () => clearTimeout(timer);
        } else {
            setParticles([]);
        }
    }, [isActive, onComplete]);

    return (
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
                    {/* Emoji Rain */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ y: -50, x: `${p.x}vw`, opacity: 0, rotate: 0 }}
                            animate={{ y: '110vh', opacity: 1, rotate: 360 }}
                            transition={{ duration: p.duration, ease: "linear", delay: p.delay }}
                            className="absolute top-0 text-3xl md:text-5xl"
                            style={{ left: 0 }} // Ensure x is relative to viewport left
                        >
                            {p.emoji}
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};
