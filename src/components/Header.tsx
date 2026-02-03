import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InteractiveMascot } from './InteractiveMascot';
import { PigMascot } from './PigMascot';

export const Header: React.FC = () => {
    const [isBouncing, setIsBouncing] = useState(false);

    const triggerBounce = () => {
        if (!isBouncing) {
            setIsBouncing(true);
        }
        // Page reload removed to allow animation to play
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-center relative">
                {/* Logo Area (Centered Column) */}
                <div className="flex flex-col items-center justify-center relative">
                    {/* Main Logo Row */}
                    <div className="flex items-center gap-0">
                        {/* FUN - Jelly Wiggle Effect & Home Link */}
                        <motion.span
                            className="text-5xl font-fun text-black tracking-tighter inline-block origin-bottom cursor-pointer"
                            style={{ fontFamily: '"Patrick Hand", cursive' }}
                            whileHover={{
                                scale: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
                                rotate: [0, -5, 5, -3, 3, 0],
                                transition: { duration: 0.6, ease: "easeInOut" }
                            }}
                            onClick={() => window.location.href = 'https://fun.uncledison.com/'}
                        >
                            FUN
                        </motion.span>

                        {/* Character Face (Interactive Mascot - Period Style) */}
                        <motion.div
                            className="w-14 h-14 flex items-center justify-center -mx-1 relative z-10 mt-5 scale-[0.7] cursor-pointer"
                            animate={isBouncing ? {
                                y: [0, -60, 0, -20, 0],
                                scale: [1, 0.9, 1.1, 0.95, 1],
                                rotate: [0, -5, 5, -2, 0]
                            } : {}}
                            transition={{
                                duration: 0.6,
                                times: [0, 0.4, 0.6, 0.8, 1],
                                ease: "easeInOut"
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerBounce();
                            }}
                            onAnimationComplete={() => setIsBouncing(false)}
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.8 }}
                        >
                            <InteractiveMascot />
                        </motion.div>

                        {/* UNCLE - Jelly Wiggle Effect & Home Link */}
                        <motion.span
                            className="text-5xl font-fun text-black tracking-tighter inline-block origin-bottom cursor-pointer"
                            style={{ fontFamily: '"Patrick Hand", cursive' }}
                            whileHover={{
                                scale: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
                                rotate: [0, -5, 5, -3, 3, 0],
                                transition: { duration: 0.6, ease: "easeInOut" }
                            }}
                            onClick={() => window.location.href = 'https://fun.uncledison.com/'}
                        >
                            UNCLE
                        </motion.span>
                    </div>

                    {/* Pig Mascot Positioned Absolutely to the Right */}
                    <div className="absolute -right-16 top-6 md:-right-24 md:top-5 z-50">
                        <PigMascot />
                    </div>

                    {/* Subtitle */}
                    <motion.div
                        className="text-sm text-gray-400 font-medium tracking-wide -mt-1"
                        style={{ fontFamily: '"Patrick Hand", cursive' }}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        Play & Learn by Uncledison
                    </motion.div>
                </div>
            </div>
        </header>
    );
};
