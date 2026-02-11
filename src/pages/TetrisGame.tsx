import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Play } from 'lucide-react';
import { useFavicon } from '../hooks/useFavicon';

// --- Constants & Types ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

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

    // Game State Refs (Mutable, No Re-render)
    const boardRef = useRef<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    const currentPieceRef = useRef<Piece | null>(null);
    const nextPieceRef = useRef<Piece | null>(null);
    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pieceBagRef = useRef<string[]>([]);

    // UI State (Triggers Re-render)
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [highScore, setHighScore] = useState(0);

    // Audio Refs
    const soundsRef = useRef<any>({});

    useEffect(() => {
        const savedHigh = localStorage.getItem('tetrisHighScore');
        if (savedHigh) setHighScore(parseInt(savedHigh));

        // Init Audio
        soundsRef.current = {
            move: new Audio('/tetris/audio/flip.wav'),
            rotate: new Audio('/tetris/audio/beep.wav'),
            drop: new Audio('/tetris/audio/drop.wav'),
            clear: new Audio('/tetris/audio/success.mp3'),
            levelUp: new Audio('/tetris/audio/level-up.wav'),
            gameStart: new Audio('/tetris/audio/beep.wav'),
            gameOver: new Audio('/tetris/audio/whoosh.wav'), // Reusing whoosh for game over/special
            bgm: new Audio('/tetris/audio/bgm01.mp3')
        };
        soundsRef.current.bgm.loop = true;
        soundsRef.current.bgm.volume = 0.3;

        Object.values(soundsRef.current).forEach((audio: any) => {
            audio.volume = 0.3;
        });

        return () => {
            stopGameLoop();
            if (soundsRef.current.bgm) {
                soundsRef.current.bgm.pause();
                soundsRef.current.bgm.currentTime = 0;
            }
        };
    }, []);

    // --- Core Game Logic ---

    const playSound = (name: string) => {
        try {
            if (soundsRef.current[name]) {
                soundsRef.current[name].currentTime = 0;
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
            if (boardRef.current[r].every(c => c !== 0)) {
                boardRef.current.splice(r, 1);
                boardRef.current.unshift(Array(COLS).fill(0));
                linesCleared++;
                r++; // Check same row index again
            }
        }

        if (linesCleared > 0) {
            playSound('clear');
            setLines(prev => {
                const newLines = prev + linesCleared;
                setLevel(Math.floor(newLines / 10) + 1);
                return newLines;
            });
            setScore(prev => prev + [0, 100, 300, 500, 800][linesCleared] * level);

            // Visual Effects (Simple Shake)
            if (navigator.vibrate) navigator.vibrate(50 * linesCleared);
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
        soundsRef.current.bgm.pause();
        playSound('gameOver');

        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('tetrisHighScore', score.toString());
        }
    };

    const move = (dir: number) => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        if (!checkCollision(currentPieceRef.current, dir, 0)) {
            currentPieceRef.current.x += dir;
            draw();
            playSound('move');
        }
    };

    const rotate = () => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        const piece = currentPieceRef.current;
        const prevRot = piece.rotation;
        piece.rotate();

        if (checkCollision(piece)) {
            // Wall Kicks (Simple)
            if (!checkCollision(piece, -1, 0)) piece.x -= 1;
            else if (!checkCollision(piece, 1, 0)) piece.x += 1;
            else {
                piece.rotation = prevRot;
                piece.shape = TETROMINOS[piece.type].shape[prevRot];
                return;
            }
        }
        draw();
        playSound('rotate');
    };

    const drop = () => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        if (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
            draw();
        } else {
            lockPiece();
            playSound('drop');
            draw();
        }
    };

    const hardDrop = () => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        while (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
        }
        lockPiece();
        playSound('drop');
        draw();
    };

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

    useEffect(() => {
        if (isPlaying && !isPaused) startGameLoop();
        else stopGameLoop();
    }, [isPlaying, isPaused, level]);


    // --- Rendering ---
    const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, colorCode: number) => {
        const color = COLORS[colorCode] || '#ffffff';
        const px = x * BLOCK_SIZE;
        const py = y * BLOCK_SIZE;

        // Clear
        // ctx.clearRect(px, py, BLOCK_SIZE, BLOCK_SIZE); // Not needed if we redraw background

        // Neon Glow Style 💎
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

        // Inner Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 0;
        ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, (BLOCK_SIZE - 4) / 2);

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

        ctx.shadowBlur = 0; // Reset
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#111025'; // Deep Neon BG
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid (Optional)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath(); ctx.moveTo(i * BLOCK_SIZE, 0); ctx.lineTo(i * BLOCK_SIZE, canvas.height); ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath(); ctx.moveTo(0, i * BLOCK_SIZE); ctx.lineTo(canvas.width, i * BLOCK_SIZE); ctx.stroke();
        }

        // Draw Board
        boardRef.current.forEach((row: number[], y: number) => {
            row.forEach((color: number, x: number) => {
                if (color) drawBlock(ctx, x, y, color);
            });
        });

        // Draw Ghost
        if (currentPieceRef.current) {
            const piece = currentPieceRef.current;
            let ghostY = piece.y;
            while (!checkCollision({ ...piece, y: ghostY + 1 } as Piece)) {
                ghostY++;
            }

            ctx.globalAlpha = 0.2;
            piece.shape.forEach((row: number[], r: number) => {
                row.forEach((val: number, c: number) => {
                    if (val) drawBlock(ctx, piece.x + c, ghostY + r, piece.color);
                });
            });
            ctx.globalAlpha = 1.0;

            // Draw Current Piece
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
            const size = 20; // Smaller block size for preview
            const offsetX = (canvas.width - piece.shape[0].length * size) / 2;
            const offsetY = (canvas.height - piece.shape.length * size) / 2;

            piece.shape.forEach((row: number[], r: number) => {
                row.forEach((val: number, c: number) => {
                    if (val) {
                        const color = COLORS[piece.color];
                        ctx.fillStyle = color;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 10;
                        ctx.fillRect(offsetX + c * size, offsetY + r * size, size - 2, size - 2);
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

        soundsRef.current.bgm.currentTime = 0;
        soundsRef.current.bgm.play().catch(() => { });
    };

    // --- Controls ---
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
    }, [isPlaying, isPaused, currentPieceRef.current]);
    // Added currentPieceRef.current to dependency to ensure closure has latest ref (?) 
    // Actually ref is always latest, but callback needs to be fresh if we used state. Ref is fine.


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
        <div className="relative w-full h-[100dvh] bg-[#0f0f1e] overflow-hidden flex flex-col items-center justify-center font-sans text-white touch-none">

            {/* Header */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
                    <ArrowLeft size={24} color="#00f0ff" />
                </button>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <span className="text-3xl font-black italic tracking-tighter" style={{ textShadow: '0 0 10px #00f0ff' }}>
                        <span className="text-[#00f0ff]">FUN</span>
                        <span className="text-white">.UNCLE</span>
                    </span>
                    <span className="text-[10px] text-[#b026ff] tracking-widest font-bold">NEON TETRIS</span>
                </motion.div>
            </div>

            {/* Score & HUD */}
            <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-[#b026ff]/30 shadow-[0_0_15px_rgba(176,38,255,0.2)]">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Score</div>
                    <div className="text-2xl font-mono font-bold text-[#00f0ff]">{score.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                        <div className="text-[9px] text-gray-500">LEVEL</div>
                        <div className="text-lg font-mono font-bold">{level}</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                        <div className="text-[9px] text-gray-500">LINES</div>
                        <div className="text-lg font-mono font-bold">{lines}</div>
                    </div>
                </div>

                {/* Next Piece PREVIEW */}
                <div className="mt-2 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 w-[80px] h-[80px] flex items-center justify-center">
                    <canvas ref={nextCanvasRef} width={80} height={80} />
                </div>
            </div>

            {/* Main Canvas */}
            <canvas
                ref={canvasRef}
                width={COLS * BLOCK_SIZE}
                height={ROWS * BLOCK_SIZE}
                className="bg-[#111025] shadow-[0_0_50px_rgba(0,240,255,0.15)] border-2 border-[#00f0ff]/20 rounded-lg max-h-[80vh] w-auto h-auto object-contain"
            />

            {/* Controls (Mobile) */}
            <div className="absolute bottom-8 w-full px-8 flex justify-between items-end max-w-md z-20 pointer-events-auto">
                <div className="flex gap-4">
                    <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur active:bg-[#00f0ff]/20 active:border-[#00f0ff] transition-all flex items-center justify-center"
                        onPointerDown={() => move(-1)}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur active:bg-[#00f0ff]/20 active:border-[#00f0ff] transition-all flex items-center justify-center transform rotate-180"
                        onPointerDown={() => move(1)}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur active:bg-[#00f0ff]/20 active:border-[#00f0ff] transition-all flex items-center justify-center transform -rotate-90"
                        onPointerDown={() => rotate()}
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <button className="w-20 h-20 rounded-full bg-[#b026ff]/20 border border-[#b026ff] backdrop-blur active:bg-[#b026ff]/40 shadow-[0_0_20px_rgba(176,38,255,0.3)] flex items-center justify-center"
                    onPointerDown={() => hardDrop()}
                >
                    <span className="font-black text-sm">DROP</span>
                </button>
            </div>


            {/* Overlays */}
            <AnimatePresence>
                {(showStartScreen || isGameOver) && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#1a1a2e]/90 border border-[#00f0ff]/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col items-center gap-6 max-w-xs w-full"
                        >
                            <div className="text-center">
                                <h1 className="text-4xl font-black italic text-white mb-2" style={{ textShadow: '0 0 20px #b026ff' }}>
                                    {isGameOver ? "GAME OVER" : "NEON TETRIS"}
                                </h1>
                                {isGameOver ? (
                                    <div className="text-xl text-[#00f0ff]">SCORE: {score}</div>
                                ) : (
                                    <div className="text-sm text-gray-400">HIGHSCORE: <span className="text-[#00f0ff]">{highScore}</span></div>
                                )}
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#b026ff] rounded-xl font-bold text-lg text-white shadow-lg shadow-[#b026ff]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isGameOver ? <RefreshCw size={20} /> : <Play size={20} />}
                                {isGameOver ? "RETRY" : "START GAME"}
                            </button>

                            {isGameOver && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-gray-400 hover:text-white text-sm underline"
                                >
                                    Go Home
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
