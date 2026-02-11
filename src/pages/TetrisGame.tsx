
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Pause } from 'lucide-react';
import { useFavicon } from '../hooks/useFavicon';

// --- Constants & Types ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Base size, will scale with Canvas CSS

const TETROMINOS: any = {
    'I': { shape: [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]], color: 1 },
    'O': { shape: [[[2, 2], [2, 2]], [[2, 2], [2, 2]], [[2, 2], [2, 2]], [[2, 2], [2, 2]]], color: 2 },
    'T': { shape: [[[0, 3, 0], [3, 3, 3], [0, 0, 0]], [[0, 3, 0], [0, 3, 3], [0, 3, 0]], [[0, 0, 0], [3, 3, 3], [0, 3, 0]], [[0, 3, 0], [3, 3, 0], [0, 3, 0]]], color: 3 },
    'S': { shape: [[[0, 4, 4], [4, 4, 0], [0, 0, 0]], [[0, 4, 0], [0, 4, 4], [0, 0, 4]], [[0, 0, 0], [0, 4, 4], [4, 4, 0]], [[4, 0, 0], [4, 4, 0], [0, 4, 0]]], color: 4 },
    'Z': { shape: [[[5, 5, 0], [0, 5, 5], [0, 0, 0]], [[0, 0, 5], [0, 5, 5], [0, 5, 0]], [[0, 0, 0], [5, 5, 0], [0, 5, 5]], [[0, 5, 0], [5, 5, 0], [5, 0, 0]]], color: 5 },
    'J': { shape: [[[6, 0, 0], [6, 6, 6], [0, 0, 0]], [[0, 6, 6], [0, 6, 0], [0, 6, 0]], [[0, 0, 0], [6, 6, 6], [0, 0, 6]], [[0, 6, 0], [0, 6, 0], [6, 6, 0]]], color: 6 },
    'L': { shape: [[[0, 0, 7], [7, 7, 7], [0, 0, 0]], [[0, 7, 0], [0, 7, 0], [0, 7, 7]], [[0, 0, 0], [7, 7, 7], [7, 0, 0]], [[7, 7, 0], [0, 7, 0], [0, 7, 0]]], color: 7 }
};

const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const COLORS: any = {
    1: '#00f0ff', // Cyan
    2: '#f0f000', // Yellow
    3: '#a000f0', // Purple
    4: '#00f000', // Green
    5: '#f00000', // Red
    6: '#0000f0', // Blue
    7: '#f0a000'  // Orange
};

const LEVEL_SPEEDS = [800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80];

class Piece {
    type: string;
    rotation: number;
    shape: number[][];
    color: number;
    x: number;
    y: number;

    constructor(type: string) {
        this.type = type;
        this.rotation = 0;
        this.shape = TETROMINOS[type].shape[this.rotation];
        this.color = TETROMINOS[type].color;
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    rotate() {
        this.rotation = (this.rotation + 1) % 4;
        this.shape = TETROMINOS[this.type].shape[this.rotation];
    }
}


export const TetrisGame: React.FC = () => {
    useFavicon('/favicon.ico');
    const navigate = useNavigate();

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nextCanvasRef = useRef<HTMLCanvasElement>(null);

    // Game State Refs
    const boardRef = useRef<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    const currentPieceRef = useRef<Piece | null>(null);
    const nextPieceRef = useRef<Piece | null>(null);
    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pieceBagRef = useRef<string[]>([]);

    // UI State
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [highScore, setHighScore] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Animation Effects state
    const [comboText, setComboText] = useState<{ text: string, color: string } | null>(null);

    // Audio Refs
    const soundsRef = useRef<any>({});

    // Touch Logic Refs
    const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

    useEffect(() => {
        const savedHigh = localStorage.getItem('tetrisHighScore');
        if (savedHigh) setHighScore(parseInt(savedHigh));

        // Init Audio
        const audioFiles = {
            move: '/tetris/audio/flip.wav',
            rotate: '/tetris/audio/beep.wav',
            drop: '/tetris/audio/drop.wav',
            clear: '/tetris/audio/success.mp3',
            levelUp: '/tetris/audio/level-up.wav',
            gameStart: '/tetris/audio/beep.wav',
            gameOver: '/tetris/audio/whoosh.wav',
            bgm: '/tetris/audio/bgm01.mp3'
        };

        const loadAudio = () => {
            const sounds: any = {};
            Object.entries(audioFiles).forEach(([key, path]) => {
                sounds[key] = new Audio(path);
                sounds[key].volume = 0.3;
            });
            sounds.bgm.loop = true;
            soundsRef.current = sounds;
        };
        loadAudio();

        return () => {
            stopGameLoop();
            if (soundsRef.current.bgm) {
                soundsRef.current.bgm.pause();
                soundsRef.current.bgm.currentTime = 0;
            }
        };
    }, []);

    // Mute Toggle Logic
    useEffect(() => {
        if (soundsRef.current.bgm) {
            soundsRef.current.bgm.muted = isMuted;
            if (!isMuted && isPlaying && !isPaused && !isGameOver) {
                soundsRef.current.bgm.play().catch(() => { });
            } else if (isMuted) {
                soundsRef.current.bgm.pause();
            }
        }
    }, [isMuted, isPlaying, isPaused, isGameOver]);

    const toggleMute = () => setIsMuted(!isMuted);


    // --- Core Game Logic ---

    const playSound = (name: string) => {
        if (isMuted) return;
        try {
            if (soundsRef.current[name]) {
                if (name !== 'bgm') soundsRef.current[name].currentTime = 0;
                soundsRef.current[name].play().catch(() => { });
            }
        } catch (e) { }
    };

    const getNextPiece = () => {
        if (pieceBagRef.current.length === 0) {
            pieceBagRef.current = [...TETROMINO_TYPES];
            for (let i = pieceBagRef.current.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pieceBagRef.current[i], pieceBagRef.current[j]] = [pieceBagRef.current[j], pieceBagRef.current[i]];
            }
        }
        return new Piece(pieceBagRef.current.pop()!);
    };

    const checkCollision = (piece: Piece, offsetX = 0, offsetY = 0) => {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;
                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                    if (newY >= 0 && boardRef.current[newY][newX]) return true;
                }
            }
        }
        return false;
    };

    const lockPiece = () => {
        const piece = currentPieceRef.current;
        if (!piece) return;

        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const by = piece.y + row;
                    const bx = piece.x + col;
                    if (by >= 0) boardRef.current[by][bx] = piece.color;
                }
            }
        }

        // Check Lines
        let linesCleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (boardRef.current[r].every((c: number) => c !== 0)) {
                boardRef.current.splice(r, 1);
                boardRef.current.unshift(Array(COLS).fill(0));
                linesCleared++;
                r++;
            }
        }

        if (linesCleared > 0) {
            playSound('clear');
            setLines(prev => {
                const newLines = prev + linesCleared;
                setLevel(Math.floor(newLines / 10) + 1);
                return newLines;
            });
            const points = [0, 100, 300, 500, 800][linesCleared] * level;
            setScore(prev => prev + points);

            // Visual Effects (Vibrate & Combo Text)
            if (navigator.vibrate) navigator.vibrate(50 * linesCleared);

            if (linesCleared >= 2) {
                let text = linesCleared === 4 ? "NEON TETRIS!" : linesCleared === 3 ? "TRIPLE!" : "DOUBLE!";
                let color = linesCleared === 4 ? "#b026ff" : linesCleared === 3 ? "#00f0ff" : "#f0f000";
                setComboText({ text, color });
                setTimeout(() => setComboText(null), 1500);
            }
        }

        spawnPiece();
    };

    const spawnPiece = () => {
        currentPieceRef.current = nextPieceRef.current;
        nextPieceRef.current = getNextPiece();

        if (checkCollision(currentPieceRef.current!)) {
            gameOver();
        } else {
            drawNext();
        }
    };

    const gameOver = () => {
        stopGameLoop();
        setIsPlaying(false);
        setIsGameOver(true);
        if (soundsRef.current.bgm) soundsRef.current.bgm.pause();
        playSound('gameOver');

        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('tetrisHighScore', score.toString());
        }
    };

    const move = useCallback((dir: number) => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        if (!checkCollision(currentPieceRef.current, dir, 0)) {
            currentPieceRef.current.x += dir;
            draw();
            playSound('move');
        }
    }, [isPaused, isPlaying]);

    const rotate = useCallback(() => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        const piece = currentPieceRef.current;
        const prevRot = piece.rotation;
        piece.rotate();

        if (checkCollision(piece)) {
            // Wall Kicks
            if (!checkCollision(piece, -1, 0)) piece.x -= 1;
            else if (!checkCollision(piece, 1, 0)) piece.x += 1;
            else if (!checkCollision(piece, -2, 0)) piece.x -= 2; // Extra kick for I bar
            else if (!checkCollision(piece, 2, 0)) piece.x += 2;
            else {
                piece.rotation = prevRot;
                piece.shape = TETROMINOS[piece.type].shape[prevRot];
                return;
            }
        }
        draw();
        playSound('rotate');
    }, [isPaused, isPlaying]);

    const drop = useCallback(() => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        if (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
            draw();
        } else {
            lockPiece();
            playSound('drop');
            draw();
        }
    }, [isPaused, isPlaying]);

    const hardDrop = useCallback(() => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        while (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
        }
        lockPiece();
        playSound('drop');
        draw();
    }, [isPaused, isPlaying]);

    const startGameLoop = () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        const speed = LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
        gameLoopRef.current = setInterval(() => {
            drop();
        }, speed);
    };

    const stopGameLoop = () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const togglePause = () => {
        if (isGameOver) return;
        setIsPaused(!isPaused);
    };

    useEffect(() => {
        if (isPlaying && !isPaused) {
            startGameLoop();
            if (!isMuted && soundsRef.current.bgm) soundsRef.current.bgm.play().catch(() => { });
        } else {
            stopGameLoop();
            if (soundsRef.current.bgm) soundsRef.current.bgm.pause();
        }
    }, [isPlaying, isPaused, level]);


    // --- Gestures ---
    const handleTouchStart = (e: React.TouchEvent) => {
        if (isPaused || !isPlaying) return;
        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current || isPaused || !isPlaying) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const deltaTime = Date.now() - touchStartRef.current.time;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Tap Detection (Short time, small movement) -> Rotate
        if (deltaTime < 200 && absX < 10 && absY < 10) {
            rotate();
        }
        // Swipe Detection (Longer/Larger movement)
        else {
            if (absX > absY) {
                // Horizontal Swipe
                if (absX > 30) { // Threshold
                    move(deltaX > 0 ? 1 : -1);
                }
            } else {
                // Vertical Swipe
                if (absY > 30) {
                    if (deltaY > 0) {
                        // Down Swipe -> Hard Drop (User said "Fast Drop", commonly hard drop or fast soft drop. I'll use hard drop for clear feedback)
                        hardDrop();
                    } else {
                        // Up Swipe - Maybe rotate? User requested Tap for rotate. Ignore Up swipe to avoid accidental inputs.
                    }
                }
            }
        }
        touchStartRef.current = null;
    };


    // --- Rendering ---
    const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, colorCode: number) => {
        const color = COLORS[colorCode] || '#ffffff';
        const px = x * BLOCK_SIZE;
        const py = y * BLOCK_SIZE;

        // Clean Neon Fill
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        ctx.shadowBlur = 0;

        // Inner Light
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(px + 4, py + 4, BLOCK_SIZE / 3, BLOCK_SIZE / 3);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath(); ctx.moveTo(i * BLOCK_SIZE, 0); ctx.lineTo(i * BLOCK_SIZE, canvas.height); ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath(); ctx.moveTo(0, i * BLOCK_SIZE); ctx.lineTo(canvas.width, i * BLOCK_SIZE); ctx.stroke();
        }

        // Board
        boardRef.current.forEach((row: number[], y: number) => {
            row.forEach((color: number, x: number) => {
                if (color) drawBlock(ctx, x, y, color);
            });
        });

        // Ghost
        if (currentPieceRef.current) {
            const piece = currentPieceRef.current;
            let ghostY = piece.y;
            while (!checkCollision({ ...piece, y: ghostY + 1 } as Piece)) {
                ghostY++;
            }

            ctx.globalAlpha = 0.15;
            piece.shape.forEach((row: number[], r: number) => {
                row.forEach((val: number, c: number) => {
                    if (val) drawBlock(ctx, piece.x + c, ghostY + r, piece.color);
                });
            });
            ctx.globalAlpha = 1.0;

            // Current Piece
            piece.shape.forEach((row: number[], r: number) => {
                row.forEach((val: number, c: number) => {
                    if (val) drawBlock(ctx, piece.x + c, piece.y + r, piece.color);
                });
            });
        }
    };

    const drawNext = () => {
        const canvas = nextCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (nextPieceRef.current) {
            const piece = nextPieceRef.current;
            const size = 15; // Compact Size
            const offsetX = (canvas.width - piece.shape[0].length * size) / 2;
            const offsetY = (canvas.height - piece.shape.length * size) / 2;

            piece.shape.forEach((row: number[], r: number) => {
                row.forEach((val: number, c: number) => {
                    if (val) {
                        ctx.fillStyle = COLORS[piece.color];
                        ctx.shadowColor = COLORS[piece.color];
                        ctx.shadowBlur = 5;
                        ctx.fillRect(offsetX + c * size, offsetY + r * size, size - 1, size - 1);
                        ctx.shadowBlur = 0;
                    }
                });
            });
        }
    }


    const startGame = () => {
        boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        setScore(0);
        setLines(0);
        setLevel(1);
        setIsGameOver(false);
        setIsPaused(false);
        setIsPlaying(true);
        setShowStartScreen(false);

        nextPieceRef.current = getNextPiece();
        spawnPiece();
        // BGM handled by useEffect
    };

    // --- Controls Bindings ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || isPaused) return;
            switch (e.key) {
                case 'ArrowLeft': move(-1); break;
                case 'ArrowRight': move(1); break;
                case 'ArrowDown': drop(); break;
                case 'ArrowUp': rotate(); break;
                case ' ': hardDrop(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isPaused, move, rotate, drop, hardDrop]); // Dependencies included for safety


    // --- Render Loop ---
    useEffect(() => {
        let animId: number;
        const renderLoop = () => {
            draw();
            animId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        return () => cancelAnimationFrame(animId);
    }, []);


    return (
        <div className="relative w-full h-[100dvh] bg-[#0f0f1e] overflow-hidden flex flex-col font-sans text-white touch-none">

            {/* Top Bar: Header & Stats - Clean UI Layout */}
            <div className="w-full px-6 pt-6 pb-2 flex justify-between items-start z-20">
                {/* Left: Branding */}
                <div onClick={() => navigate('/')} className="cursor-pointer">
                    <h1 className="text-2xl font-black italic tracking-tighter text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                        FUN.UNCLE
                    </h1>
                </div>

                {/* Right UI: Stats Grid + Controls */}
                <div className="flex gap-4 items-start">
                    {/* Score & Next Piece (Compact) */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[#1a1a2e]/80 border border-[#b026ff]/30 px-3 py-1 rounded-lg">
                            <div className="text-[10px] text-gray-400">SCORE</div>
                            <div className="text-xl font-mono text-[#00f0ff]">{score.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Audio & Pause Controls */}
                        <div className="flex gap-2 justify-end">
                            <button onClick={toggleMute} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                                {isMuted ? <VolumeX size={20} color="#666" /> : <Volume2 size={20} color="#00f0ff" />}
                            </button>
                            <button onClick={togglePause} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                                {isPaused ? <Play size={20} color="#00f000" /> : <Pause size={20} color="#fff" />}
                            </button>
                        </div>
                        {/* Next Piece */}
                        <div className="bg-black/40 border border-white/10 rounded-lg w-[60px] h-[60px] flex items-center justify-center self-end">
                            <canvas ref={nextCanvasRef} width={60} height={60} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area - Centered and Responsive */}
            <div className="flex-1 flex items-center justify-center relative p-4"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    width={COLS * BLOCK_SIZE}
                    height={ROWS * BLOCK_SIZE}
                    className="bg-[#111025] shadow-[0_0_30px_rgba(0,240,255,0.1)] border border-[#00f0ff]/20 rounded-lg max-h-full w-auto h-auto object-contain"
                />

                {/* Combo Text Overlay */}
                <AnimatePresence>
                    {comboText && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 0 }}
                            animate={{ scale: 1.5, opacity: 1, y: -50 }}
                            exit={{ scale: 2, opacity: 0 }}
                            className="absolute z-30 font-black italic text-4xl drop-shadow-lg"
                            style={{ color: comboText.color, textShadow: `0 0 20px ${comboText.color}` }}
                        >
                            {comboText.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Paused Overlay */}
                {isPaused && !isGameOver && (
                    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-black italic text-white text-center">PAUSED</h2>
                            <div className="flex gap-4">
                                <button onClick={togglePause} className="px-8 py-3 bg-[#00f0ff] text-black font-bold rounded-full shadow-[0_0_15px_#00f0ff]">
                                    CONTINUE
                                </button>
                                <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 text-white font-bold rounded-full border border-white/20">
                                    QUIT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info Bar (Level) */}
            <div className="px-6 pb-6 flex justify-between text-xs text-gray-500 font-mono tracking-widest uppercase">
                <div>LVL {level}</div>
                <div>LINES {lines}</div>
                <div>FUN.UNCLE NEON</div>
            </div>


            {/* Start / Game Over Screen */}
            <AnimatePresence>
                {(showStartScreen || isGameOver) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f1e]/95 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-sm p-8 flex flex-col items-center text-center gap-6"
                        >
                            <h1 className="text-5xl font-black italic text-white mb-2 tracking-tighter" style={{ textShadow: '0 0 30px #00f0ff' }}>
                                {isGameOver ? "GAME OVER" : "NEON TETRIS"}
                            </h1>

                            <div className="flex flex-col gap-1 w-full bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="text-sm text-gray-400">HIGHSCORE</div>
                                <div className="text-3xl font-mono text-[#b026ff] font-bold">{Math.max(score, highScore)}</div>
                            </div>

                            {isGameOver && (
                                <div className="text-xl text-white font-bold">SCORE: <span className="text-[#00f0ff]">{score}</span></div>
                            )}

                            <button
                                onClick={startGame}
                                className="w-full py-4 mt-4 bg-gradient-to-r from-[#00f0ff] to-[#b026ff] rounded-2xl font-black text-xl text-white shadow-[0_0_30px_rgba(176,38,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isGameOver ? "RETRY" : "START GAME"}
                            </button>

                            {/* Gesture Guide */}
                            <div className="mt-8 text-xs text-gray-500 flex flex-col gap-2">
                                <div className="font-bold text-gray-400 mb-1">HOW TO PLAY (TOUCH)</div>
                                <div className="flex gap-4 justify-center">
                                    <span>👆 Tap: Rotate</span>
                                    <span>↔️ Swipe: Move</span>
                                    <span>⬇️ Down: Drop</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
