
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Pause } from 'lucide-react';
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
    3: '#ff00ff', // Pink (was Purple)
    4: '#00f000', // Green
    5: '#f00000', // Red
    6: '#0000f0', // Blue
    7: '#f0a000'  // Orange
};



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

// Particle Class for Visual Effects
class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
    maxLife: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2; // Fast explosion
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.maxLife = 40;
        this.life = this.maxLife;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life--;
        this.size *= 0.95; // Shrink
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
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
    const particlesRef = useRef<Particle[]>([]);

    // Time Attack State
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('advanced');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [highScore, setHighScore] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Animation Effects state
    const [comboText, setComboText] = useState<{ text: string, color: string } | null>(null);
    const [shake, setShake] = useState(0);

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

    // --- Particle Effects ---
    const createExplosion = (lines: number[]) => {
        lines.forEach(row => {
            for (let col = 0; col < COLS; col++) {
                // Create particles for each block in cleared line
                const color = COLORS[Math.floor(Math.random() * 7) + 1]; // Random neon color
                for (let i = 0; i < 5; i++) {
                    particlesRef.current.push(new Particle(col * BLOCK_SIZE + BLOCK_SIZE / 2, row * BLOCK_SIZE + BLOCK_SIZE / 2, color));
                }
            }
        });
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
        let linesIndices: number[] = [];
        for (let r = ROWS - 1; r >= 0; r--) {
            if (boardRef.current[r].every((c: number) => c !== 0)) {
                linesIndices.push(r);
                boardRef.current.splice(r, 1);
                boardRef.current.unshift(Array(COLS).fill(0));
                linesCleared++;
                r++;
            }
        }

        if (linesCleared > 0) {
            playSound('clear');

            // Trigger Visual Effects
            createExplosion(linesIndices);
            setShake(linesCleared * 5); // Shake screen
            setTimeout(() => setShake(0), 500);

            if (navigator.vibrate) navigator.vibrate(50 * linesCleared);

            // Score Logic (Dynamic Multiplier based on speed/time left)
            let speedMultiplier = 1;
            if (difficulty === 'advanced') {
                speedMultiplier = timeLeft < 15 ? 4 : timeLeft < 30 ? 3 : timeLeft < 45 ? 2 : 1;
            } else if (difficulty === 'intermediate') {
                speedMultiplier = timeLeft < 30 ? 3 : timeLeft < 60 ? 2 : 1;
            } else {
                speedMultiplier = timeLeft < 30 ? 2 : 1;
            }

            const points = [0, 100, 300, 500, 800][linesCleared] * speedMultiplier;
            setScore(prev => prev + points);

            if (linesCleared >= 2) {
                let text = linesCleared === 4 ? "TETRIS!" : linesCleared === 3 ? "TRIPLE!" : "DOUBLE!";
                let color = linesCleared === 4 ? "#ff00ff" : linesCleared === 3 ? "#00f0ff" : "#f0f000";
                setComboText({ text, color });
                setTimeout(() => setComboText(null), 1500);
            }
        }

        spawnPiece();
    };

    const spawnPiece = () => {
        currentPieceRef.current = nextPieceRef.current;
        nextPieceRef.current = getNextPiece();
        // Update Next Preview Immediately
        drawNext();

        if (checkCollision(currentPieceRef.current!)) {
            gameOver();
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
            // Removed draw() call, handled by game loop for smoother rendering
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
        playSound('rotate');
    }, [isPaused, isPlaying]);

    const drop = useCallback(() => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        if (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
        } else {
            lockPiece();
            playSound('drop');
        }
    }, [isPaused, isPlaying, timeLeft]); // Add timeLeft dependency for correct closure capture if needed, though mostly using Refs

    const hardDrop = useCallback(() => {
        if (!currentPieceRef.current || isPaused || !isPlaying) return;
        while (!checkCollision(currentPieceRef.current, 0, 1)) {
            currentPieceRef.current.y += 1;
        }
        lockPiece();
        playSound('drop');
    }, [isPaused, isPlaying]);

    // --- Dynamic Speed Loop based on Time Left & Difficulty ---
    const startGameLoop = () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);

        let speed = 800; // Default

        if (difficulty === 'advanced') {
            // 60s Total: Fast paced
            if (timeLeft < 15) speed = 150;      // Hyper
            else if (timeLeft < 30) speed = 300; // Super Fast
            else if (timeLeft < 45) speed = 500; // Fast
            else speed = 800;                    // Normal
        } else if (difficulty === 'intermediate') {
            // 180s Total: Balanced
            if (timeLeft < 30) speed = 300;      // Super Fast
            else if (timeLeft < 60) speed = 500; // Fast
            else speed = 800;                    // Normal
        } else {
            // 300s Total: Relaxed start
            if (timeLeft < 30) speed = 300;      // Super Fast
            else if (timeLeft < 60) speed = 500; // Fast
            else if (timeLeft < 120) speed = 800;// Normal
            else speed = 1000;                   // Slow start
        }

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

    // --- Timer Logic ---
    useEffect(() => {
        let timerId: ReturnType<typeof setInterval>;
        if (isPlaying && !isPaused && !isGameOver) {
            timerId = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        gameOver();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [isPlaying, isPaused, isGameOver]);

    // Re-adjust speed when time changes (every 15s threshold ideally to avoid constant resets, but simple restart is fine)
    // Re-adjust speed when time changes (every 15s threshold ideally to avoid constant resets, but simple restart is fine)
    useEffect(() => {
        if (isPlaying && !isPaused) {
            startGameLoop();
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [timeLeft, isPlaying, isPaused, difficulty]);


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

        // Tap Detection -> Rotate
        if (deltaTime < 200 && absX < 10 && absY < 10) {
            rotate();
        }
        // Swipe Detection
        else {
            if (absX > absY) {
                if (absX > 30) {
                    move(deltaX > 0 ? 1 : -1);
                }
            } else {
                if (absY > 30) {
                    if (deltaY > 0) {
                        hardDrop();
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

        // Render Particles
        particlesRef.current.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        // Remove dead particles
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);
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


    const handleShare = () => {
        const kakao = (window as any).Kakao;
        if (kakao) {
            if (!kakao.isInitialized()) {
                kakao.init('8e68190d1ba932955a557fbf0ae0b659');
            }
            const difficultyText = difficulty === 'beginner' ? '초급' : difficulty === 'intermediate' ? '중급' : '고급';
            kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `[Fun.Uncle] 네온 테트리스 도전!`,
                    description: `등급(${difficultyText}) 최종점수 : ${score.toLocaleString()}\n나 이길 수 있어?`,
                    imageUrl: 'https://fun.uncledison.com/assets/tetris_square_thumb.png', // Updated to square thumbnail
                    link: {
                        mobileWebUrl: 'https://fun.uncledison.com/tetris',
                        webUrl: 'https://fun.uncledison.com/tetris',
                    },
                },
                buttons: [
                    {
                        title: '나도 도전하기',
                        link: {
                            mobileWebUrl: 'https://fun.uncledison.com/tetris',
                            webUrl: 'https://fun.uncledison.com/tetris',
                        },
                    },
                ],
            });
        }
    };

    const startGame = () => {
        boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        setScore(0);
        // Set Time based on Difficulty
        if (difficulty === 'beginner') setTimeLeft(300); // 5 min
        else if (difficulty === 'intermediate') setTimeLeft(180); // 3 min
        else setTimeLeft(60); // 1 min (Advanced)
        setIsGameOver(false);
        setIsPaused(false);
        setIsPlaying(true);
        setShowStartScreen(false);

        nextPieceRef.current = getNextPiece();
        spawnPiece();
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
    }, [isPlaying, isPaused, move, rotate, drop, hardDrop]);


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
        <div className="relative w-full h-screen bg-[#0f0f1e] overflow-hidden flex flex-col font-sans text-white touch-none">

            {/* Container for Centered Content to Match Board Width */}
            <div className="w-full max-w-[320px] mx-auto z-20 flex flex-col items-center">

                {/* Header: Branding & Controls (Compact & Centered) */}
                <div className="w-full px-2 pt-2 pb-1 flex justify-between items-center shrink-0">
                    {/* Left: Branding (Home Link) */}
                    <div onClick={() => navigate('/')} className="cursor-pointer">
                        <h1 className="text-xl font-black italic tracking-tighter text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                            FUN.UNCLE
                        </h1>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex gap-2">
                        <button onClick={toggleMute} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                            {isMuted ? <VolumeX size={18} color="#666" /> : <Volume2 size={18} color="#00f0ff" />}
                        </button>
                        <button onClick={togglePause} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                            {isPaused ? <Play size={18} color="#00f000" /> : <Pause size={18} color="#fff" />}
                        </button>
                    </div>
                </div>

                {/* Stats Bar: Time | Next | Score (Slim, Transparent, Aligned) */}
                <div className="w-full grid grid-cols-3 gap-2 items-center shrink-0 mb-1">
                    {/* Time */}
                    <div className={`flex flex-col items-center justify-center border rounded-lg py-1 ${timeLeft < 10 ? 'border-red-500 animate-pulse bg-red-900/10' : 'border-white/20'}`}>
                        <div className={`text-[9px] font-bold tracking-widest ${timeLeft < 10 ? 'text-red-500' : 'text-[#ff00ff]'}`}>TIME</div>
                        <div className={`text-lg font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-[#ff00ff]'}`}>{timeLeft}s</div>
                    </div>

                    {/* Next Piece (Wider) */}
                    <div className="flex items-center justify-center">
                        <div className="border border-white/20 rounded-lg w-full h-[40px] flex items-center justify-center">
                            <canvas ref={nextCanvasRef} width={60} height={40} />
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center justify-center border border-white/20 rounded-lg py-1">
                        <div className="text-[9px] text-gray-400 font-bold tracking-widest">SCORE</div>
                        <div className="text-lg font-mono font-bold text-white/90">{score.toLocaleString()}</div>
                    </div>
                </div>

            </div>

            {/* Main Game Area (Reduced Height) */}
            <div className="flex-1 w-full flex items-start justify-center relative p-2 overflow-hidden"
                style={{ transform: `translate(${Math.random() * shake - shake / 2}px, ${Math.random() * shake - shake / 2}px)` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Canvas - Limit Max Height further for Chrome URL bar */}
                <canvas
                    ref={canvasRef}
                    width={COLS * BLOCK_SIZE}
                    height={ROWS * BLOCK_SIZE}
                    className="bg-[#111025] shadow-[0_0_30px_rgba(0,240,255,0.1)] border border-[#00f0ff]/20 rounded-lg h-full w-auto object-contain max-h-[70vh]"
                />

                {/* Combo Text Overlay (Flashy!) */}
                <AnimatePresence>
                    {comboText && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 0, rotate: -10 }}
                            animate={{ scale: 1.5, opacity: 1, y: -100, rotate: 0 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="absolute z-30 font-black italic text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] whitespace-nowrap"
                            style={{
                                color: comboText.color,
                                textShadow: `0 0 20px ${comboText.color}, 0 0 40px ${comboText.color}`
                            }}
                        >
                            {comboText.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Paused Overlay */}
                {isPaused && !isGameOver && (
                    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col gap-6 items-center">
                            <h2 className="text-4xl font-black italic text-white tracking-widest drop-shadow-[0_0_10px_#fff]">PAUSED</h2>
                            <div className="flex gap-4">
                                <button onClick={togglePause} className="px-8 py-3 bg-[#00f0ff] text-black font-bold rounded-full shadow-[0_0_15px_#00f0ff] hover:scale-105 transition-transform">
                                    RESUME
                                </button>
                                <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                                    QUIT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                            className="w-full max-w-sm p-8 flex flex-col items-center text-center gap-8"
                        >
                            <h1 className="text-8xl font-black italic text-white mb-6 tracking-tighter drop-shadow-[0_0_25px_rgba(0,240,255,0.8)]">
                                {isGameOver ? "GAME OVER" : "NEON TETRIS"}
                            </h1>

                            {/* Difficulty Selector (Only on Start Screen) */}
                            {!isGameOver && (
                                <div className="flex gap-3 justify-center w-full mb-8">
                                    <button
                                        onClick={() => setDifficulty('beginner')}
                                        className={`px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 ${difficulty === 'beginner' ? 'bg-[#00f0ff] text-black shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                    >
                                        초급
                                    </button>
                                    <button
                                        onClick={() => setDifficulty('intermediate')}
                                        className={`px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 ${difficulty === 'intermediate' ? 'bg-[#f0f000] text-black shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                    >
                                        중급
                                    </button>
                                    <button
                                        onClick={() => setDifficulty('advanced')}
                                        className={`px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 ${difficulty === 'advanced' ? 'bg-[#f00000] text-white shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                    >
                                        고급
                                    </button>
                                </div>
                            )}

                            {isGameOver && (
                                <div className="flex flex-col items-center mb-8">
                                    <div className="text-6xl text-white font-black italic drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-2">
                                        {score.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                                        최고점수 : {Math.max(score, highScore).toLocaleString()}
                                    </div>
                                </div>
                            )}

                            {/* Minimal High Score (Start Screen Only) */}
                            {!isGameOver && (
                                <div className="text-xs text-gray-500 font-medium tracking-widest uppercase mb-8">
                                    최고점수 : {Math.max(score, highScore).toLocaleString()}
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-6 w-full">
                                {/* Main Action Button (Slim & Pill) */}
                                <button
                                    onClick={startGame}
                                    className="px-12 py-3 bg-[#00f0ff] hover:opacity-80 rounded-full font-bold text-xl text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                                >
                                    {isGameOver ? "다시" : "시작"}
                                </button>

                                {/* Sub Actions (Start Screen - None / Game Over - Icons) */}
                                {isGameOver && (
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white shadow-lg transition-all active:scale-95 flex items-center justify-center"
                                            aria-label="홈으로"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-4 bg-[#FEE500] hover:bg-[#E6CF00] rounded-full text-[#191919] shadow-lg transition-all active:scale-95 flex items-center justify-center"
                                            aria-label="공유"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.9 1.88 5.45 4.68 7.01L5.5 21.5l4.25-2.55C10.47 19.3 11.22 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
