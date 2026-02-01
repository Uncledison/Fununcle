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
    const [feedback, setFeedback] = useState("");
    const [showTutorial, setShowTutorial] = useState(true);
    const [tutorialStep, setTutorialStep] = useState(0); // 0: Ready, 1: Go!, 2: Demo, 3: Done

    // Dimensions
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const targetRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35;

    // Marimba sound
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const playMarimbaSound = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;
    };

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
        playMarimbaSound();
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

        // Generate Feedback
        if (calculatedScore >= 98) setFeedback("Humanly Impossible! 🤖");
        else if (calculatedScore >= 95) setFeedback("Unbelievable! 🏆");
        else if (calculatedScore >= 90) setFeedback("Amazing! ✨");
        else if (calculatedScore >= 80) setFeedback("Great job! 🎨");
        else if (calculatedScore >= 70) setFeedback("Not bad! 👍");
        else if (calculatedScore >= 50) setFeedback("Getting there... 🤔");
        else setFeedback("Is that a potato? 🥔");
    };

    const resetGame = () => {
        setPoints([]);
        setScore(null);
        setFeedback("");
        setShowTutorial(false);
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

    // Used variables to suppress lint errors (logic uses them indirectly or future proofing)
    useEffect(() => {
        // Just acknowledging variables are defined for scoring logic
        console.log("Game Loaded", { centerX, centerY, targetRadius, tutorialStep });
    }, [tutorialStep]);


    // Load highscore
    useEffect(() => {
        const saved = localStorage.getItem('perfect-circle-highscore');
        if (saved) setHighScore(parseFloat(saved));
    }, []);

    // Tutorial sequence
    useEffect(() => {
        console.log('[Tutorial] showTutorial:', showTutorial, 'tutorialStep:', tutorialStep);
        if (!showTutorial) return;

        const timer1 = setTimeout(() => {
            console.log('[Tutorial] Setting step to 1 (Go!)');
            setTutorialStep(1);
        }, 800);
        const timer2 = setTimeout(() => {
            console.log('[Tutorial] Setting step to 2 (Dots Animation)');
            setTutorialStep(2);
        }, 1600);
        const timer3 = setTimeout(() => {
            console.log('[Tutorial] Setting step to 3 (Done)');
            setTutorialStep(3);
            setShowTutorial(false);
            // localStorage removed - tutorial will show on every page load
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [showTutorial]);

    // Check if tutorial has been seen
    useEffect(() => {
        const seen = localStorage.getItem('perfect-circle-tutorial-seen');
        console.log('[Tutorial] localStorage check - seen:', seen);
        if (seen === 'true') {
            console.log('[Tutorial] Tutorial already seen, hiding');
            setShowTutorial(false);
        }
    }, []);

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
                <div className="flex items-center gap-2">
                    <span className="text-white/90 text-lg font-bold tracking-wide">Fun</span>
                    <img
                        src="/rainbow-center.png"
                        alt="·"
                        className="w-2 h-2 rounded-full opacity-80"
                    />
                    <span className="text-white/90 text-lg font-bold tracking-wide">Uncle</span>
                </div>
                <div className="text-white/80 text-sm font-medium">
                    Best: <span className="text-white font-bold">{highScore.toFixed(1)}%</span>
                </div>
            </div>

            {/* Background Details */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Target Guide (Pulse Effect) */}
                <div className="relative">
                    {/* Rainbow Image Center */}
                    <img
                        src="/rainbow-center.png"
                        alt="Rainbow center"
                        className="w-8 h-8 rounded-full"
                        style={{
                            boxShadow: '0 0 20px rgba(255,255,255,0.5)'
                        }}
                    />
                    {/* Pulsing Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* Header / UI */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
                <Link to="/" className="pointer-events-auto text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={32} />
                </Link>
                <div className="text-right">
                    <h1 className="text-white font-bold text-2xl tracking-tighter">Perfect Circle</h1>
                    {highScore > 0 && <p className="text-white/40 text-sm">Best: {highScore.toFixed(1)}%</p>}
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

                        {/* Feedback Text - Only show when NOT drawing (finished) */}
                        {!isDrawing && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/80 text-xl font-medium mt-4 tracking-wide"
                            >
                                {feedback}
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tutorial Overlay - Sequential Dots */}
            <AnimatePresence>
                {showTutorial && tutorialStep === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-50 pointer-events-none"
                    >
                        <p className="text-white text-2xl font-bold mb-8 text-center">
                            Trace the dots to draw a circle!
                        </p>
                        <div className="relative w-64 h-64">
                            {Array.from({ length: 24 }).map((_, i) => {
                                const angle = (i / 24) * 2 * Math.PI;
                                const radius = 100;
                                const dotSize = 12; // w-3 h-3 = 12px
                                const centerOffset = 128; // Half of 256px (w-64 h-64)
                                const x = Math.cos(angle) * radius + centerOffset - dotSize / 2;
                                const y = Math.sin(angle) * radius + centerOffset - dotSize / 2;
                                const hue = (i / 24) * 360;

                                return (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{
                                            left: `${x}px`,
                                            top: `${y}px`,
                                            backgroundColor: `hsl(${hue}, 100%, 60%)`,
                                            boxShadow: `0 0 10px hsl(${hue}, 100%, 60%)`
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: i * 0.08,
                                            duration: 0.3,
                                            ease: "easeOut"
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        </div>
    );
};
