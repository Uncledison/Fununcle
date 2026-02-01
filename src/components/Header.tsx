import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { InteractiveMascot } from './InteractiveMascot';
const [isBouncing, setIsBouncing] = useState(false);
const navigate = useNavigate();

const triggerBounce = () => {
    if (!isBouncing) {
        setIsBouncing(true);
    }
    navigate('/');
};

return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-center relative">
            {/* Logo Area (Centered Column) */}
            <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={triggerBounce}>
                {/* Main Logo Row */}
                <div className="flex items-center gap-0">
                    {/* FUN - Jelly Wiggle Effect */}
                    <motion.span
                        className="text-5xl font-fun text-black tracking-tighter inline-block origin-bottom"
                        style={{ fontFamily: '"Patrick Hand", cursive' }}
                        whileHover={{
                            scale: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], // Rubber band squash & stretch
                            rotate: [0, -5, 5, -3, 3, 0], // Wiggle
                            transition: { duration: 0.6, ease: "easeInOut" }
                        }}
                    >
                        FUN
                    </motion.span>

                    {/* Character Face (Interactive Mascot - Period Style) */}
                    <motion.div
                        className="w-14 h-14 flex items-center justify-center -mx-1 relative z-10 mt-5 scale-[0.7]"
                        animate={isBouncing ? {
                            y: [0, -60, 0, -20, 0], // Reduced jump height for smaller size
                            scale: [1, 0.9, 1.1, 0.95, 1],
                            rotate: [0, -5, 5, -2, 0]
                        } : {}}
                        transition={{
                            duration: 0.6, // Faster animation for smaller object
                            times: [0, 0.4, 0.6, 0.8, 1],
                            ease: "easeInOut"
                        }}
                        onAnimationComplete={() => setIsBouncing(false)}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.8 }}
                    >
                        <InteractiveMascot />
                    </motion.div>

                    {/* UNCLE - Jelly Wiggle Effect (Matching FUN) */}
                    <motion.span
                        className="text-5xl font-fun text-black tracking-tighter inline-block origin-bottom"
                        style={{ fontFamily: '"Patrick Hand", cursive' }}
                        whileHover={{
                            scale: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], // Rubber band squash & stretch
                            rotate: [0, -5, 5, -3, 3, 0], // Wiggle
                            transition: { duration: 0.6, ease: "easeInOut" }
                        }}
                    >
                        UNCLE
                    </motion.span>
                </div>

                {/* Subtitle */}
                <motion.div
                    className="text-sm text-gray-400 font-medium tracking-wide -mt-1"
                    style={{ fontFamily: '"Patrick Hand", cursive' }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    By Uncledison
                </motion.div>
            </div>
        </div>
    </header>
);
};
