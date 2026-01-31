import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Particle Background Component ---
// Define Era Types for strict typing
export type EraType = 'HADEAN' | 'OCEANIC' | 'PALEOZOIC' | 'ICE_AGE' | 'INDUSTRIAL' | 'NETWORK' | 'DIGITAL' | 'DEFAULT';

// --- Particle Background Component ---
export const EraBackground: React.FC<{ era: EraType }> = React.memo(({ era }) => {
    // Era Logic is now passed in as a prop to prevent re-renders on every year tick
    const isHadean = era === 'HADEAN';
    const isOceanic = era === 'OCEANIC';
    const isPaleozoic = era === 'PALEOZOIC';
    const isIceAge = era === 'ICE_AGE';

    // Modern Era Split
    const isDigital = era === 'DIGITAL';
    const isNetwork = era === 'NETWORK';
    const isIndustrial = era === 'INDUSTRIAL';

    const [particles, setParticles] = useState<{ id: number; left: number; top?: number; scale: number; speed: number; type: 'meteor' | 'ember' | 'bubble' | 'snow' | 'data' | 'network' | 'spark' }[]>([]);

    // 2. Particle System Logic
    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;

        const spawnParticle = () => {
            const id = Date.now() + Math.random();
            const left = Math.random() * 100;
            const top = Math.random() * 100; // For network
            const scale = Math.random() * 0.8 + 1.2; // Doubled size (was 0.5~1.0, now 1.2~2.0)
            const speed = Math.random() * 2 + 1;

            if (isPaleozoic) {
                // Meteors
                setParticles(prev => [...prev.slice(-2), { id, left, scale, speed, type: 'meteor' }]);
            } else if (isHadean) {
                // Embers (Red)
                setParticles(prev => [...prev.slice(-15), { id, left, scale, speed, type: 'ember' }]);
            } else if (isOceanic) {
                // Bubbles
                setParticles(prev => [...prev.slice(-10), { id, left, scale, speed: speed * 0.5, type: 'bubble' }]);
            } else if (isIceAge) {
                // Snow
                setParticles(prev => [...prev.slice(-20), { id, left, scale, speed, type: 'snow' }]);
            } else if (isDigital) {
                // Data (Vertical Rain)
                setParticles(prev => [...prev.slice(-20), { id, left, scale, speed, type: 'data' }]);
            } else if (isNetwork) {
                // Network (Horizontal Flow)
                setParticles(prev => [...prev.slice(-15), { id, left: -10, top, scale, speed, type: 'network' }]);
            } else if (isIndustrial) {
                // Sparks (Rising Gold)
                setParticles(prev => [...prev.slice(-20), { id, left, scale, speed, type: 'spark' }]);
            } else {
                setParticles([]);
            }
        };

        if (isPaleozoic || isHadean || isOceanic || isIceAge || isDigital || isNetwork || isIndustrial) {
            // Slower rates for better performance
            const rate = isPaleozoic ? 1200 : (isHadean || isIndustrial) ? 300 : 200;
            interval = setInterval(spawnParticle, rate);
        } else {
            setParticles([]);
        }

        return () => clearInterval(interval);
    }, [isPaleozoic, isHadean, isOceanic, isIceAge, isDigital, isNetwork, isIndustrial]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden backface-visibility-hidden translate-z-0">
            {/* 1. Deep Breath Ambient (Nebula Orbs) */}
            <div className="absolute inset-0 opacity-40 transition-opacity duration-[3000ms]">
                {(isDigital || isNetwork) && (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] bg-blue-900/30 rounded-full blur-[100px] animate-[spin_60s_linear_infinite]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] bg-purple-900/30 rounded-full blur-[100px] animate-[spin_50s_linear_infinite_reverse]" />
                    </>
                )
                }
                {
                    isIndustrial && (
                        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-orange-600/20 blur-[120px] animate-pulse" />
                    )
                }
                {isHadean && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-red-900/20 blur-[120px] animate-pulse" />}
                {isOceanic && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-cyan-900/20 blur-[120px] animate-pulse" />}
                {isIceAge && <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />}
            </div >

            {/* 2. Global Stars (Always Twinkling) */}
            < div className={`absolute inset-0 transition-opacity duration-1000 ${isDigital || isNetwork || isIndustrial ? 'opacity-30' : 'opacity-60'}`}>
                {
                    [...Array(60)].map((_, i) => ( // Increased stars
                        <motion.div
                            key={i}
                            className="absolute bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: Math.random() * 2 + 1,
                                height: Math.random() * 2 + 1
                            }}
                            animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))
                }
            </div >

            {/* 3. Particle System */}
            <AnimatePresence>
                {
                    particles.map(p => {
                        // Logic per type
                        if (p.type === 'meteor') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 1, top: -50, left: `${p.left}%` }}
                                    animate={{ opacity: 0, top: '100vh', left: `${p.left - 30}%` }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "linear" }}
                                    className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-orange-400 to-transparent rotate-[20deg]"
                                >
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-200 rounded-full blur-[2px]" />
                                </motion.div>
                            );
                        }
                        if (p.type === 'ember') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, bottom: -10, left: `${p.left}%` }}
                                    animate={{ opacity: [0, 1, 0], bottom: '40vh', left: `${p.left + (Math.random() * 10 - 5)}%` }}
                                    transition={{ duration: p.speed * 2, ease: "easeOut" }}
                                    className="absolute w-1 h-1 bg-red-400 rounded-full blur-[1px] shadow-[0_0_5px_rgba(255,100,0,0.8)]"
                                />
                            );
                        }
                        if (p.type === 'bubble') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, bottom: -20, left: `${p.left}%` }}
                                    animate={{ opacity: [0, 0.6, 0], bottom: '80vh', left: `${p.left + Math.sin(p.id)}%` }}
                                    transition={{ duration: p.speed * 4, ease: "easeInOut" }}
                                    className="absolute w-2 h-2 border border-white/30 rounded-full bg-white/5 backdrop-blur-sm"
                                />
                            );
                        }
                        if (p.type === 'snow') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, top: -10, left: `${p.left}%` }}
                                    animate={{ opacity: [0, 0.8, 0], top: '100vh', left: `${p.left + (Math.random() * 20 - 10)}%` }}
                                    transition={{ duration: p.speed * 3, ease: "linear" }}
                                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                                />
                            );
                        }
                        if (p.type === 'data') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, top: -10, left: `${p.left}%` }}
                                    animate={{ opacity: [0, 1, 0], top: '100vh' }}
                                    transition={{ duration: p.speed * 1.5, ease: "linear" }}
                                    className="absolute w-[1px] h-12 bg-gradient-to-b from-transparent via-green-400/50 to-transparent"
                                />
                            );
                        }
                        if (p.type === 'network') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, left: -20, top: `${p.top}%` }}
                                    animate={{ opacity: [0, 0.8, 0], left: '110vw' }}
                                    transition={{ duration: p.speed * 3, ease: "linear" }}
                                    className="absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
                                />
                            );
                        }
                        if (p.type === 'spark') {
                            return (
                                <motion.div
                                    key={p.id}
                                    style={{ scale: p.scale }}
                                    initial={{ opacity: 0, bottom: -10, left: `${p.left}%` }}
                                    animate={{ opacity: [0, 1, 0], bottom: '60vh', left: `${p.left + (Math.random() * 20 - 10)}%` }}
                                    transition={{ duration: p.speed * 2.5, ease: "easeOut" }}
                                    className="absolute w-1 h-1 bg-amber-300 rounded-full blur-[1px] shadow-[0_0_8px_rgba(252,211,77,0.6)]"
                                />
                            );
                        }
                        return null;
                    })
                }
            </AnimatePresence >


        </div >
    );
});
