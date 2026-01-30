import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroVideo from '../assets/uncledison_hero.mp4'; // Import video directly (Cache busted)

export const VideoHero: React.FC = () => {
    const { scrollY } = useScroll();
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Force play on mount to handle browser autoplay policies
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video play failed:", error);
            });
        }
    }, []);

    // Scroll interactions: Fade out and slightly zoom in as user scrolls down
    const opacity = useTransform(scrollY, [0, 600], [1, 0]);
    const scale = useTransform(scrollY, [0, 600], [1, 1.1]);
    const y = useTransform(scrollY, [0, 600], [0, 200]); // Parallax effect

    return (
        <div className="relative h-screen w-full overflow-hidden sticky top-0 -z-10">
            <motion.div
                style={{ opacity, scale, y }}
                className="absolute inset-0"
            >
                {/* Cinematic Video Background */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls // 디버깅용 컨트롤러 추가
                    className="h-full w-full object-cover"
                >
                    <source src={heroVideo} type="video/mp4" />
                </video>

                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
            </motion.div>

            {/* Hero Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4">
                <motion.h1
                    style={{ opacity, y: useTransform(scrollY, [0, 300], [0, -100]) }}
                    className="text-6xl md:text-9xl font-black text-white tracking-tighter text-center drop-shadow-2xl font-display"
                >
                    UNCLE
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        EDISON
                    </span>
                </motion.h1>
                <motion.p
                    style={{ opacity, y: useTransform(scrollY, [0, 300], [0, -50]) }}
                    className="mt-6 text-xl md:text-3xl font-light text-white/80 tracking-[0.2em] uppercase font-body"
                >
                    The Fun Lab
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
            </motion.div>
        </div>
    );
};
