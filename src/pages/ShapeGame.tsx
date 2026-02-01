import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download } from 'lucide-react';
import * as d3Shape from 'd3-shape';
import html2canvas from 'html2canvas';

// --- Types ---
interface Point {
    x: number;
    y: number;
    timestamp: number;
}

// --- Scoring Utils ---
// Simple Circle Fit Algorithm (Centroid + Deviation)
const calculateCircleScore = (points: Point[]) => {
    if (points.length < 10) return 0;

    // 1. Calculate actual centroid of the drawn path
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    const centroid = { x: sum.x / points.length, y: sum.y / points.length };

    // 2. Calculate average radius from centroid
    let radiusSum = 0;
    const radii = points.map(p => {
        const r = Math.sqrt(Math.pow(p.x - centroid.x, 2) + Math.pow(p.y - centroid.y, 2));
        radiusSum += r;
        return r;
    });
    const avgRadius = radiusSum / points.length;

    // 3. Calculate variance/deviation from average radius
    // We penalize deviation from the perfect circle (constant radius)
    const deviationSum = radii.reduce((acc, r) => acc + Math.abs(r - avgRadius), 0);
    const avgDeviation = deviationSum / points.length;

    // 4. Calculate Score
    // Deviation ratio: How much it wobbles relative to its size
    const deviationRatio = avgDeviation / avgRadius;

    // Closer to 0 deviation = 100%
    // RELAXED: 25% deviation is 0 points (was 20%)
    // Multiplier changed from 5 to 4 to make it easier
    let score = Math.max(0, 1 - (deviationRatio * 2.5)); // Significant relax

    // Penalize start/end gap
    const start = points[0];
    const end = points[points.length - 1];
    const gap = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));

    // Gap penalty: Stronger penalty for larger gaps
    // Max 40% penalty for very large gaps
    const gapPenalty = Math.min(0.4, (gap / avgRadius) * 0.3);

    score -= gapPenalty;

    // Minimum score floor to avoid 0% for decent attempts
    if (deviationRatio < 0.3 && score < 0.1) score = 0.1;

    return Math.max(0, Math.min(100, score * 100));
};

export const ShapeGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [highScore, setHighScore] = useState<number>(0);
    const [gameStarted, setGameStarted] = useState(false);


    // Marimba sound - Disabled
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // const playMarimbaSound = () => { ... } // Removed to fix unused var error

    const stopMarimbaSound = () => {
        if (oscillatorRef.current && gainNodeRef.current) {
            gainNodeRef.current.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 0.1);
            oscillatorRef.current.stop(audioContextRef.current!.currentTime + 0.1);
            oscillatorRef.current = null;
            gainNodeRef.current = null;
        }
    };

    // --- Interaction Handlers ---
    const handleStart = (e: React.PointerEvent | React.TouchEvent) => {
        if (score !== null) {
            resetGame();
        }
        setIsDrawing(true);
        // playMarimbaSound(); // Disabled
        const { clientX, clientY } = 'touches' in e ? (e as any).touches[0] : e;
        setPoints([{ x: clientX, y: clientY, timestamp: Date.now() }]);
    };


    const handleMove = (e: React.PointerEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { clientX, clientY } = 'touches' in e ? (e as any).touches[0] : e;

        setPoints(prev => {
            const newPoints = [...prev, { x: clientX, y: clientY, timestamp: Date.now() }];

            // Live Score Calculation
            if (newPoints.length % 5 === 0 && newPoints.length > 10) {
                const currentScore = calculateCircleScore(newPoints);
                setScore(currentScore);
            }

            // Auto-close detection: Check if we're close to start point
            if (newPoints.length > 80) {
                const start = newPoints[0];
                const current = newPoints[newPoints.length - 1];
                const dist = Math.sqrt(Math.pow(start.x - current.x, 2) + Math.pow(start.y - current.y, 2));

                // If very close to start (8px), auto-finish
                if (dist < 8) {
                    setIsDrawing(false);
                    finishDrawing([...newPoints, start]); // Close the loop visually
                }
            }
            return newPoints;
        });
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        // Check if the circle is closed when user releases
        if (points.length > 80) {
            const start = points[0];
            const end = points[points.length - 1];
            const dist = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));

            // Only finish if loop is reasonably closed (within 30px)
            if (dist < 30) {
                finishDrawing([...points, start]); // Close the loop
            } else {
                // Too far apart - reset
                setPoints([]);
                setScore(null);
            }
        } else {
            // Too short - reset
            setPoints([]);
            setScore(null);
        }
    };

    const finishDrawing = (finalPoints: Point[]) => {
        if (finalPoints.length < 50) {
            setPoints([]);
            setScore(null);
            return;
        }

        stopMarimbaSound();
        const calculatedScore = calculateCircleScore(finalPoints);
        setScore(calculatedScore);

        if (calculatedScore > highScore) {
            setHighScore(calculatedScore);
            localStorage.setItem('perfect-circle-highscore', calculatedScore.toString());
        }

        // Generate Feedback - Using Emojis as requested (Text is handled in render)
        // We set feedback just to trigger the state change if needed, effectively "game over state"
        // But the emoji rendering is static list, so we actually don't need 'feedback' string state for content anymore
        // However, let's keep it if we want conditional rendering based on score brackets later.
        // For now, request said "just show 10 small round emojis", so we might just toggle visibility.
        // setFeedback("done"); // Removed unused feedback setter
    };

    const resetGame = () => {
        setPoints([]);
        setScore(null);
        // setFeedback(""); // Removed unused feedback setter
    };

    // --- Path Generation ---
    const pathData = useMemo(() => {
        if (points.length < 2) return "";
        const line = d3Shape.line<Point>()
            .x((d: Point) => d.x)
            .y((d: Point) => d.y)
            .curve(d3Shape.curveBasis); // Smoothing!
        return line(points) || "";
    }, [points]);


    // Load highscore
    useEffect(() => {
        const saved = localStorage.getItem('perfect-circle-highscore');
        if (saved) setHighScore(parseFloat(saved));
    }, []);

    // New "Start Flow" logic: No specialized tutorial logic needed anymore
    // as it's handled by 'gameStarted' state and the conditional rendering in JSX.

    const shareKakao = () => {
        if (!(window as any).Kakao) {
            alert('카카오톡 공유 기능을 사용할 수 없습니다.');
            return;
        }
        (window as any).Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: 'Perfect Circle Challenge',
                description: `I scored ${score?.toFixed(1)}% on the Perfect Circle game! Can you beat my score?`,
                imageUrl: 'https://fununcle.vercel.app/rainbow-center.png',
                link: {
                    mobileWebUrl: 'https://fununcle.vercel.app/shape-game',
                    webUrl: 'https://fununcle.vercel.app/shape-game',
                },
            },
        });
    };

    const shareResult = async () => {
        if (!containerRef.current) return;
        try {
            const canvas = await html2canvas(containerRef.current);
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `perfect-circle-${score?.toFixed(1)}.png`;
            link.click();
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-screen overflow-hidden relative touch-none select-none"
            style={{
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
            }}
            onPointerDown={handleStart}
            onPointerMove={handleMove}
            onPointerUp={handleEnd}
        >
            {/* Header */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-10">
                <div className="flex items-center gap-[4px]">
                    <span className="text-white/90 text-lg font-bold tracking-wide">Fun</span>
                    <img
                        src="/rainbow-center.png"
                        alt="·"
                        className="w-1.5 h-1.5 rounded-full opacity-80 mt-1.5"
                    />
                    <span className="text-white/90 text-lg font-bold tracking-wide">Uncle</span>
                </div>
                <div className="text-white/80 text-sm font-medium">
                    Best: <span className="text-white font-bold">{highScore.toFixed(1)}%</span>
                </div>
            </div>

            {/* SVG Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff0000" />
                        <stop offset="20%" stopColor="#ffff00" />
                        <stop offset="40%" stopColor="#00ff00" />
                        <stop offset="60%" stopColor="#00ffff" />
                        <stop offset="80%" stopColor="#0000ff" />
                        <stop offset="100%" stopColor="#ff00ff" />
                    </linearGradient>
                </defs>

                {/* Drawn Path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#rainbow)"
                    strokeWidth={score !== null || isDrawing ? 6 : 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        filter: score !== null ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none',
                        transition: 'stroke 0.3s'
                    }}
                />
            </svg>

            {/* Score Overlay */}
            <AnimatePresence>
                {/* Show if Score exists (Live or Final) */}
                {score !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40"
                    >
                        {/* Score Count-up */}
                        <motion.div
                            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-2xl"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                        >
                            {score.toFixed(1)}%
                        </motion.div>

                        {/* Feedback - 10 Small Round Emojis */}
                        {!isDrawing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-2 mt-4 flex-wrap justify-center px-4"
                            >
                                {['🥔', '🍎', '🍊', '🥯', '🍠', '🍪', '⚽', '🏀', '🌕', '🍅'].map((emoji, i) => (
                                    <motion.span
                                        key={i}
                                        className="text-3xl select-none"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.1, type: "spring" }}
                                    >
                                        {emoji}
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Start Screen & Tutorial Overlay */}
            <AnimatePresence>
                {!gameStarted && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 pointer-events-auto"
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    >
                        {/* Auto-drawing Continuous Sketch Animation */}
                        <div className="relative w-80 h-80 mb-12 pointer-events-none">
                            <motion.svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 200 200"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ opacity: 0.9 }}
                            >
                                <defs>
                                    <linearGradient id="sketch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ff0000" />
                                        <stop offset="20%" stopColor="#ffff00" />
                                        <stop offset="40%" stopColor="#00ff00" />
                                        <stop offset="60%" stopColor="#00ffff" />
                                        <stop offset="80%" stopColor="#0000ff" />
                                        <stop offset="100%" stopColor="#ff00ff" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    d={(() => {
                                        let d = "";
                                        const loops = 5; // Draw over 5 times
                                        const pointsPerLoop = 60;
                                        const baseRadiusX = 80;
                                        const baseRadiusY = 65;
                                        const steps = loops * pointsPerLoop;

                                        for (let i = 0; i <= steps; i++) {
                                            const t = (i / pointsPerLoop) * Math.PI * 2;
                                            // Add smooth noise for "hand-drawn" look
                                            const noiseX = Math.sin(t * 2.5) * 3 + Math.cos(t * 1.5) * 2;
                                            const noiseY = Math.cos(t * 2.2) * 3 + Math.sin(t * 1.8) * 2;

                                            // Make it start exactly at angle 0 but allow drift
                                            const rx = baseRadiusX + noiseX;
                                            const ry = baseRadiusY + noiseY;

                                            const x = 100 + Math.cos(t) * rx;
                                            const y = 100 + Math.sin(t) * ry;

                                            d += (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)}`;
                                        }
                                        return d;
                                    })()}
                                    stroke="url(#sketch-gradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 8, // Takes 8 seconds to draw all loops
                                        ease: "linear",
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        repeatDelay: 0
                                    }}
                                />
                            </motion.svg>
                        </div>

                        {/* Staggered Text Reveal */}
                        <motion.div
                            className="flex overflow-hidden mb-12"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {"원을 그려보세요!".split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    className="text-white text-3xl font-bold drop-shadow-md mx-[2px]"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.div>

                        {/* Rainbow Gradient Start Button */}
                        <motion.button
                            onClick={() => setGameStarted(true)}
                            className="relative group px-1 py-1 rounded-full overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2.5, duration: 1 }}
                        >
                            {/* Rainbow Border/Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient-x opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Button Content */}
                            <div className="relative px-12 py-4 bg-black rounded-full transition-all group-hover:bg-black/90 active:scale-95">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 font-bold text-xl tracking-wider">
                                    시작
                                </span>
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interactive Center - Only visible after game starts */}
            {gameStarted && !isDrawing && !score && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }} // Slow fade in
                >
                    {/* Rotating Flower Center with Interaction */}
                    <motion.div
                        className="relative flex items-center justify-center w-8 h-8 pointer-events-auto cursor-pointer"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {/* Flower Petals Container - Rotating */}
                        <motion.div
                            className="relative w-full h-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 origin-bottom"
                                    style={{
                                        transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                        height: '50%',
                                        width: '30%',
                                        backgroundColor: `hsla(${i * 30}, 100%, 65%, 0.6)`,
                                        borderRadius: '50% 50% 0 0',
                                        mixBlendMode: 'screen',
                                    }}
                                />
                            ))}
                            {/* Center Core */}
                            <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] z-10" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Action Buttons (Only show when finished) */}
            <AnimatePresence>
                {!isDrawing && score !== null && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-50 pointer-events-auto px-4"
                    >
                        <button
                            onClick={resetGame}
                            className="flex items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20"
                            aria-label="Try Again"
                        >
                            <RefreshCw size={24} />
                        </button>

                        <button
                            onClick={shareKakao}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FEE500]/90 hover:bg-[#FEE500] backdrop-blur-md rounded-full text-[#3C1E1E] font-bold transition-all shadow-lg border border-[#FEE500]/50"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.9 1.88 5.45 4.68 7.01L5.5 21.5l4.25-2.55C10.47 19.3 11.22 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                            </svg>
                            Share
                        </button>

                        <button
                            onClick={shareResult}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all border border-white/20"
                        >
                            <Download size={20} /> Save
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};
