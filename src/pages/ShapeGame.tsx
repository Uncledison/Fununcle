import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Volume2, VolumeX } from 'lucide-react';
import Lottie from 'lottie-react';

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

    // Guard against tiny/degenerate shapes
    if (avgRadius < 10) return 10; // Minimum score for any visible shape

    // 3. Calculate variance/deviation from average radius
    const deviationSum = radii.reduce((acc, r) => acc + Math.abs(r - avgRadius), 0);
    const avgDeviation = deviationSum / points.length;

    // 4. Calculate Score - More generous scoring
    const deviationRatio = avgDeviation / avgRadius;

    // Base score: 100% at 0 deviation, scales down with deviation
    let score = Math.max(0.1, 1 - (deviationRatio * 2)); // Even more relaxed

    // Check if shape is closed/crossed (any intersection means effort was made)
    const start = points[0];
    const end = points[points.length - 1];
    const gap = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));

    // Small gap penalty (max 20% for very large gaps)
    const gapPenalty = Math.min(0.2, (gap / avgRadius) * 0.15);
    score -= gapPenalty;

    // IMPORTANT: Minimum score floor - any completed shape gets at least 10%
    // If the shape has enough points and some roundness, it deserves a score
    const minScore = 10;
    const rawScore = Math.max(minScore, Math.min(100, score * 100));

    return rawScore;
};

import { useNavigate } from 'react-router-dom';

export const ShapeGame: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [highScore, setHighScore] = useState<number>(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [resultEmoji, setResultEmoji] = useState<string>("");
    const [fireworksData, setFireworksData] = useState<any>(null);
    const [showFireworks, setShowFireworks] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Mouse click sound effect (Mouse-click-01 to 03)
    const playMouseClickSound = () => {
        const soundNum = Math.floor(Math.random() * 3) + 1;
        const audio = new Audio(`/sounds/Mouse-click-0${soundNum}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(() => { });
    };

    // Success sound effect (clap-01 to 05)
    const playSuccessSound = () => {
        if (isMuted) return; // Skip if muted
        const soundNum = Math.floor(Math.random() * 5) + 1;
        const audio = new Audio(`/sounds/clap-0${soundNum}.wav`);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    };


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

        // Allow scoring for any drawn shape with enough points
        // No longer requires start/end to meet - alpha shapes are OK
        if (points.length > 50) {
            finishDrawing(points);
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

        // Generate Feedback - Single Random Emoji
        const emojis = [
            // Fruits/Veg
            '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕',
            // Food
            '🥯', '🍞', '🥨', '🧀', '🥞', '🧇', '🍖', '🌭', '🍔', '🍟', '🍕', '🌮', '🌯', '🥚', '🥘', '🍲', '🍿', '🧈', '🧂', '🥫',
            // Objects
            '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🔮', '🧶', '🎈', '🧧', '🏮', '🪀', '💿', '📀', '🧭', '⏱️', '⏰'
        ];
        setResultEmoji(emojis[Math.floor(Math.random() * emojis.length)]);

        // Trigger Fireworks and Success Sound
        const fireworkNum = Math.floor(Math.random() * 5) + 1;
        playSuccessSound();
        fetch(`/lottie/Fireworks-0${fireworkNum}.json`)
            .then(res => res.json())
            .then(data => {
                setFireworksData(data);
                setShowFireworks(true);
                // Auto-hide after 3 seconds
                setTimeout(() => setShowFireworks(false), 3000);
            })
            .catch(err => console.error('Failed to load fireworks', err));
    };

    const resetGame = () => {
        setPoints([]);
        setScore(null);
        setScore(null);
        setResultEmoji("");
    };


    // Load highscore
    useEffect(() => {
        const saved = localStorage.getItem('perfect-circle-highscore');
        if (saved) setHighScore(parseFloat(saved));
    }, []);

    // New "Start Flow" logic: No specialized tutorial logic needed anymore
    // as it's handled by 'gameStarted' state and the conditional rendering in JSX.

    const handleShare = async () => {
        const shareData = {
            title: 'Circle',
            text: `내 원은 ${score?.toFixed(1)}% 완전히 원이야. 내 기록 깰 수 있어?`,
            url: 'https://fununcle.vercel.app/shape'
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert('결과가 복사되었습니다!');
            } catch (err) {
                console.error('Clipboard failed', err);
            }
        }
    };

    const handleSaveImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            // Create a canvas manually
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size (use window dimensions)
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width * 2; // 2x for retina
            canvas.height = height * 2;
            ctx.scale(2, 2);

            // Draw background (radial gradient)
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw the circle path with variable thickness
            if (points.length > 1) {
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const point = points[i];

                    // Calculate stroke width (calligraphy effect)
                    const progress = i / points.length;
                    const baseWidth = 8;
                    const widthMultiplier = 0.4 + 0.6 * Math.sin(progress * Math.PI);
                    const strokeWidth = Math.max(2, baseWidth * widthMultiplier);

                    // Rainbow color
                    const hue = (progress * 360) % 360;

                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            // Draw texts
            if (score !== null) {
                ctx.textAlign = 'center';

                // 0. Load and draw flower logo + Fun.Uncle at top
                const logoImg = new Image();
                logoImg.src = '/flower-logo.png';
                await new Promise((resolve) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = resolve; // Continue even if logo fails
                });

                // Draw header (Logo + Text centered)
                const logoSize = 60;
                ctx.font = 'bold 40px sans-serif';
                const textMetrics = ctx.measureText('Fun.Uncle');
                const textWidth = textMetrics.width;
                const gap = 12;
                const totalHeaderWidth = logoSize + gap + textWidth;

                const startX = (width - totalHeaderWidth) / 2;

                // Draw logo
                ctx.drawImage(logoImg, startX, 40, logoSize, logoSize);

                // Draw text
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText('Fun.Uncle', startX + logoSize + gap, 85);
                ctx.textAlign = 'center';

                // 1. Description above score (smaller text)
                ctx.font = 'bold 24px sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText('나의 동그라미 정확도', width / 2, height / 2 - 80);

                // 2. Score (large gradient text)
                ctx.font = 'bold 100px sans-serif';
                ctx.textBaseline = 'middle';
                const textGradient = ctx.createLinearGradient(width / 2 - 150, height / 2, width / 2 + 150, height / 2);
                textGradient.addColorStop(0, '#60a5fa'); // blue-400
                textGradient.addColorStop(1, '#a855f7'); // purple-500
                ctx.fillStyle = textGradient;
                ctx.fillText(`${score.toFixed(1)}%`, width / 2, height / 2);

                // 3. Emoji below score (Connected to content)
                if (resultEmoji) {
                    ctx.font = '80px serif'; // Emoji font
                    ctx.textBaseline = 'ideographic'; // Better for emojis
                    // Center emoji just below score
                    ctx.fillText(resultEmoji, width / 2, height / 2 + 120);
                }

                // 4. URL at very bottom
                ctx.font = 'bold 24px sans-serif';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillText('fun.uncledison.com', width / 2, height - 40);


            }

            // Download
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `circle-score-${score?.toFixed(1) || '0'}.png`;
            link.click();
        } catch (err) {
            console.error('Save failed', err);
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
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-50 pointer-events-none">
                <motion.div
                    className="flex items-center gap-[1px] pointer-events-auto cursor-pointer"
                    onClick={() => { playMouseClickSound(); navigate('/'); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.span
                        className="text-white/90 text-lg font-bold tracking-wide"
                        whileHover={{ y: -3, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        Fun
                    </motion.span>
                    {/* Mini Flower Logo (40% smaller, positioned lower) */}
                    <motion.div
                        className="relative w-[6px] h-[6px] mt-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 origin-bottom"
                                style={{
                                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                    height: '50%',
                                    width: '30%',
                                    backgroundColor: `hsla(${i * 30}, 100%, 65%, 0.7)`,
                                    borderRadius: '50% 50% 0 0',
                                    mixBlendMode: 'screen',
                                }}
                            />
                        ))}
                        <div className="absolute inset-0 m-auto w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)] z-10" />
                    </motion.div>
                    <motion.span
                        className="text-white/90 text-lg font-bold tracking-wide"
                        whileHover={{ y: -3, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        Uncle
                    </motion.span>
                </motion.div>
                <div className="flex items-center gap-2 pointer-events-auto text-white/80 text-sm font-medium">
                    {/* Sound Toggle Icon */}
                    <motion.div
                        onClick={() => setIsMuted(!isMuted)}
                        className="cursor-pointer"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isMuted ? (
                            <VolumeX size={16} className="text-white/50" />
                        ) : (
                            <Volume2 size={16} className="text-white/80" />
                        )}
                    </motion.div>
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

                {/* Brush Stroke Effect - Variable Thickness */}
                {points.length > 1 && points.map((point, i) => {
                    if (i === 0) return null;
                    const prev = points[i - 1];

                    // Calculate stroke width based on position (calligraphy effect)
                    // Thinner at start and end, thicker in the middle
                    const progress = i / points.length;
                    const baseWidth = score !== null ? 8 : 6;
                    // Bell curve: sin gives smooth transition
                    const widthMultiplier = 0.4 + 0.6 * Math.sin(progress * Math.PI);
                    const strokeWidth = Math.max(2, baseWidth * widthMultiplier);

                    // Calculate color based on progress for rainbow effect
                    const hue = (progress * 360) % 360;

                    return (
                        <line
                            key={i}
                            x1={prev.x}
                            y1={prev.y}
                            x2={point.x}
                            y2={point.y}
                            stroke={`hsl(${hue}, 100%, 60%)`}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            style={{
                                filter: score !== null ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none'
                            }}
                        />
                    );
                })}
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
                        {!isDrawing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-white/70 text-lg sm:text-xl font-bold mb-2"
                            >
                                나의 동그라미 정확도
                            </motion.div>
                        )}
                        <motion.div
                            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-2xl"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                        >
                            {score.toFixed(1)}%
                        </motion.div>

                        {/* Feedback - Single Random Emoji */}
                        {!isDrawing && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="flex justify-center mt-6"
                            >
                                <span className="text-6xl select-none filter drop-shadow-lg">
                                    <span className="text-6xl select-none filter drop-shadow-lg">
                                        {resultEmoji}
                                    </span>
                                </span>
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
                        {/* 1. Title Text at the Top */}
                        <motion.div
                            className="flex overflow-hidden mb-8"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {"동그라미 그려봐!".split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    className="text-white text-5xl font-black drop-shadow-md mx-[2px]"
                                    variants={{
                                        hidden: { opacity: 0, y: 15 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.div>

                        {/* 2. Animation & Button Container */}
                        <div className="relative w-80 h-80 flex items-center justify-center">
                            {/* Chaotic Sketch Animation */}
                            <motion.svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
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
                                        const loops = 8;
                                        const pointsPerLoop = 50;
                                        const steps = loops * pointsPerLoop;
                                        for (let i = 0; i <= steps; i++) {
                                            const t = (i / pointsPerLoop) * Math.PI * 2;
                                            const loopIndex = Math.floor(i / pointsPerLoop);
                                            let noiseX = 0;
                                            let noiseY = 0;
                                            if (loopIndex % 3 === 0) {
                                                noiseX = Math.sin(t) * 10;
                                                noiseY = Math.cos(t) * 5;
                                            } else if (loopIndex % 3 === 1) {
                                                noiseX = Math.sin(t * 3) * 8;
                                                noiseY = Math.cos(t * 3) * 8;
                                            } else {
                                                noiseX = Math.sin(t * 5) * 5;
                                                noiseY = Math.cos(t * 4) * 5;
                                            }
                                            const driftAngle = (i / steps) * Math.PI;
                                            const baseR = 75;
                                            const r = baseR + Math.sin(loopIndex) * 5;
                                            const rawX = Math.cos(t) * r + noiseX;
                                            const rawY = Math.sin(t) * r + noiseY;
                                            const x = 100 + rawX * Math.cos(driftAngle) - rawY * Math.sin(driftAngle);
                                            const y = 100 + rawX * Math.sin(driftAngle) + rawY * Math.cos(driftAngle);
                                            d += (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)}`;
                                        }
                                        return d;
                                    })()}
                                    stroke="url(#sketch-gradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 10,
                                        ease: "linear",
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        repeatDelay: 0
                                    }}
                                />
                            </motion.svg>

                            {/* Flower Center Button with GO text */}
                            <motion.div
                                onClick={() => { playMouseClickSound(); setGameStarted(true); }}
                                className="relative flex items-center justify-center w-20 h-20 cursor-pointer z-10"
                                whileHover={{ scale: 1.4 }}
                                whileTap={{ scale: 0.9 }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: 1
                                }}
                                transition={{
                                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                    opacity: { delay: 1.5, duration: 0.5 }
                                }}
                            >
                                {/* Flower Petals Container - Rotating */}
                                <motion.div
                                    className="absolute inset-0"
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
                                </motion.div>
                                {/* GO Text Overlay */}
                                <span className="relative text-black font-black text-2xl tracking-wider drop-shadow-sm z-20">
                                    GO
                                </span>
                            </motion.div>
                        </div>
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
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={resetGame}
                            className="flex items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20"
                            aria-label="Try Again"
                        >
                            <RefreshCw size={24} />
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FEE500]/90 hover:bg-[#FEE500] backdrop-blur-md rounded-full text-[#3C1E1E] font-bold transition-all shadow-lg border border-[#FEE500]/50"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.9 1.88 5.45 4.68 7.01L5.5 21.5l4.25-2.55C10.47 19.3 11.22 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                            </svg>
                            Share
                        </button>

                        <button
                            onClick={handleSaveImage}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all border border-white/20"
                        >
                            <Download size={20} /> Save
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fireworks Animation Overlay */}
            <AnimatePresence>
                {showFireworks && fireworksData && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Lottie
                            animationData={fireworksData}
                            loop={false}
                            className="w-full h-full absolute inset-0"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};
