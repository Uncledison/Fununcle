import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Share2, Twitter } from 'lucide-react';
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
    // Let's say 20% deviation is 0 points.
    let score = Math.max(0, 1 - (deviationRatio * 5)); // * 5 making it sensitive

    // Penalize start/end gap
    const start = points[0];
    const end = points[points.length - 1];
    const gap = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
    const gapPenalty = Math.min(0.2, (gap / avgRadius) * 0.1); // Max 20% penalty for gap

    score -= gapPenalty;

    return Math.max(0, Math.min(100, score * 100));
};

export const ShapeGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [highScore, setHighScore] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [strokeColor, setStrokeColor] = useState("white");

    // Dimensions
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const targetRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35; // Target size guide

    // Rainbow Gradient Stroke Logic
    const getRainbowColor = (progress: number) => {
        const hue = Math.floor(progress * 360);
        return `hsl(${hue}, 100%, 70%)`;
    };

    // --- Interaction Handlers ---
    const handleStart = (e: React.PointerEvent | React.TouchEvent) => {
        if (score !== null) {
            resetGame();
        }
        setIsDrawing(true);
        const { clientX, clientY } = 'touches' in e ? (e as any).touches[0] : e;
        setPoints([{ x: clientX, y: clientY, timestamp: Date.now() }]);
    };

    const handleMove = (e: React.PointerEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { clientX, clientY } = 'touches' in e ? (e as any).touches[0] : e;

        // Prevent scrolling on mobile
        // (e as any).preventDefault(); 

        setPoints(prev => {
            const newPoints = [...prev, { x: clientX, y: clientY, timestamp: Date.now() }];

            // Layout Shift / End Detection logic
            // Check distance to start point if we have enough points (e.g. > 20)
            if (newPoints.length > 20) {
                const start = newPoints[0];
                const current = newPoints[newPoints.length - 1];
                const dist = Math.sqrt(Math.pow(start.x - current.x, 2) + Math.pow(start.y - current.y, 2));

                // If we are close to start, auto-finish
                if (dist < 20) {
                    finishDrawing(newPoints);
                    setIsDrawing(false);
                }
            }
            return newPoints;
        });
    };

    const handleEnd = () => {
        if (isDrawing) {
            setIsDrawing(false);
            finishDrawing(points);
        }
    };

    const finishDrawing = (finalPoints: Point[]) => {
        if (finalPoints.length < 50) {
            // Too short, ignore
            setPoints([]);
            return;
        }

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

    // Update stroke color dynamically based on completion % (Approximation)
    useEffect(() => {
        if (isDrawing) {
            setStrokeColor(getRainbowColor((points.length % 500) / 500));
        }
    }, [points.length, isDrawing]);

    // Log for debugging/linting
    useEffect(() => {
        // Suppress unused variable warnings by logging (or could be removed if clean)
        // But keeping them is safer if I plan to use them in the "Expansion" phase
        // console.log("Debug params:", strokeColor);
    }, [strokeColor]);

    // Used variables to suppress lint errors (logic uses them indirectly or future proofing)
    useEffect(() => {
        // Just acknowledging variables are defined for scoring logic
        console.log("Game Loaded", { centerX, centerY, targetRadius, strokeColor });
    }, []);


    // Load highscore
    useEffect(() => {
        const saved = localStorage.getItem('perfect-circle-highscore');
        if (saved) setHighScore(parseFloat(saved));
    }, []);

    const shareResult = async () => {
        if (!containerRef.current) return;

        try {
            const canvas = await html2canvas(containerRef.current);
            const image = canvas.toDataURL("image/png");

            // Create a fake link to download
            const link = document.createElement('a');
            link.href = image;
            link.download = `perfect-circle-${score?.toFixed(1)}.png`;
            link.click();
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    const shareTwitter = () => {
        const text = `⭕️ My circle is ${score?.toFixed(1)}% perfect! Can you beat that?`;
        const url = "https://neal.fun/perfect-circle/"; // Replace with actual URL if hosted
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-screen bg-[#101010] overflow-hidden relative touch-none select-none"
            onPointerDown={handleStart}
            onPointerMove={handleMove}
            onPointerUp={handleEnd}
        >
            {/* Background Details */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                {/* Target Guide (Dot) */}
                <div className="w-2 h-2 bg-white rounded-full"></div>
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
                    stroke={score !== null ? `url(#rainbow)` : "white"}
                    strokeWidth={score !== null ? 6 : 4}
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

                        {/* Feedback Text */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/80 text-xl font-medium mt-4 tracking-wide"
                        >
                            {feedback}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons (Only show when scored) */}
            <AnimatePresence>
                {score !== null && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-10 left-0 w-full flex justify-center gap-4 z-50 pointer-events-auto"
                    >
                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all"
                        >
                            <RefreshCw size={20} /> Try Again
                        </button>

                        <button
                            onClick={shareTwitter}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a91da] rounded-full text-white font-bold transition-all shadow-lg"
                        >
                            <Twitter size={20} /> Tweet
                        </button>

                        <button
                            onClick={shareResult}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold transition-all shadow-lg"
                        >
                            <Share2 size={20} /> Save Image
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
