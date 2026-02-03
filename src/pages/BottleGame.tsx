import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Share2 } from 'lucide-react';
import { useFavicon } from '../hooks/useFavicon';

// --- Constants ---
const GRAVITY = -25;
const FLOOR_Y = -4;
const BOTTLE_HEIGHT = 4.0;
// 10 Bright/Vivid colors for kids (Water Color + Dark Text Color)
const COMBO_COLORS = [
    { water: 0x2196F3, text: '#0D47A1' }, // 0-2: Blue
    { water: 0x18FFFF, text: '#006064' }, // 3-5: Cyan Accent
    { water: 0x76FF03, text: '#33691E' }, // 6-8: Lime Green
    { water: 0xFFEA00, text: '#E65100' }, // 9-11: Yellow (Text: Dark Orange)
    { water: 0xFF9100, text: '#BF360C' }, // 12-14: Orange
    { water: 0xFF4081, text: '#880E4F' }, // 15-17: Pink
    { water: 0xF50057, text: '#880E4F' }, // 18-20: Hot Pink
    { water: 0xD500F9, text: '#4A148C' }, // 21-23: Violet
    { water: 0x651FFF, text: '#311B92' }, // 24-26: Purple
    { water: 0x3D5AFE, text: '#1A237E' }  // 27-29: Indigo
];

const getComboColor = (combo: number) => {
    const index = Math.min(COMBO_COLORS.length - 1, Math.floor(combo / 3));
    return COMBO_COLORS[index];
};

// --- Types ---
interface GameState {
    isGameActive: boolean;
    timeLeft: number;
    score: number;
    tryCount: number;
    comboCount: number;
    isFeverMode: boolean;
    isFlying: boolean;
    canThrow: boolean;
    showIntro: boolean;
    showEnd: boolean;
}

interface CtrlState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
}

export const BottleGame: React.FC = () => {
    useFavicon('/favicon_bottle.ico');
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const bottleGroupRef = useRef<THREE.Group | null>(null);
    const waterMeshRef = useRef<THREE.Mesh | null>(null);
    const waterCapMeshRef = useRef<THREE.Mesh | null>(null);  // Water surface cap
    const globalPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0));

    // Physics state refs
    const positionRef = useRef(new THREE.Vector3(0, 0, 0));
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
    const rotationVelocityRef = useRef(0);

    // Camera control refs
    const camThetaRef = useRef(0);
    const camPhiRef = useRef(Math.PI / 2.5);
    const camRadiusRef = useRef(18);
    const targetRadiusRef = useRef(18);
    const ctrlStateRef = useRef<CtrlState>({ left: false, right: false, up: false, down: false });

    // Pointer tracking refs
    const startYRef = useRef(0);
    const startTimeRef = useRef(0);

    // Audio context ref
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Confetti particles ref
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
    }>>([]);

    // Animation frame ref
    const animationFrameRef = useRef<number>(0);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Game state
    const [gameState, setGameState] = useState<GameState>({
        isGameActive: false,
        timeLeft: 60,
        score: 0,
        tryCount: 0,
        comboCount: 0,
        isFeverMode: false,
        isFlying: false,
        canThrow: false,
        showIntro: true,
        showEnd: false,
    });

    // Refs that mirror state for use in animation loop
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // --- Audio System ---
    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    const playSound = useCallback((type: 'throw' | 'success' | 'fail') => {
        const audioCtx = getAudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const isFever = gameStateRef.current.isFeverMode;

        if (type === 'throw') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            osc.start();
            osc.stop(now + 0.3);
        } else if (type === 'success') {
            const baseFreq = isFever ? 600 : 523;
            [baseFreq, baseFreq * 1.2, baseFreq * 1.5].forEach((f, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.frequency.value = f;
                g.gain.setValueAtTime(0.1, now + i * 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                o.start(now + i * 0.05);
                o.stop(now + 0.4);
            });
        } else if (type === 'fail') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.1, now);
            osc.start();
            osc.stop(now + 0.2);
        }
    }, [getAudioContext]);

    // --- Haptics ---
    const triggerHaptics = useCallback(() => {
        const isFever = gameStateRef.current.isFeverMode;
        if (navigator.vibrate) {
            navigator.vibrate(isFever ? [50, 30, 50] : 40);
        }
        const intensity = isFever ? 12 : 6;
        document.body.style.transform = `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`;
        setTimeout(() => {
            document.body.style.transform = 'translate(0,0)';
        }, 50);
    }, []);

    // --- Confetti ---
    const fireConfetti = useCallback(() => {
        const cvs = confettiCanvasRef.current;
        if (!cvs) return;

        cvs.width = window.innerWidth;
        cvs.height = window.innerHeight;

        const combo = gameStateRef.current.comboCount;
        const isFever = gameStateRef.current.isFeverMode;
        const amount = 40 + (combo * 10);

        for (let i = 0; i < amount; i++) {
            particlesRef.current.push({
                x: cvs.width / 2,
                y: cvs.height / 2,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 1) * 25,
                life: 1,
                color: isFever
                    ? `hsl(45, 100%, ${50 + Math.random() * 50}%)`
                    : `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    }, []);

    const updateConfetti = useCallback(() => {
        const cvs = confettiCanvasRef.current;
        if (!cvs) return;

        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.6;
            p.life -= 0.02;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, 7);
            ctx.fill();
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);
        if (particlesRef.current.length > 0) {
            requestAnimationFrame(updateConfetti);
        }
    }, []);

    // --- Three.js Setup ---
    const createBottle = useCallback(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const bottleGroup = new THREE.Group();
        bottleGroupRef.current = bottleGroup;

        const points = [
            new THREE.Vector2(0, 0), new THREE.Vector2(0.8, 0), new THREE.Vector2(0.8, 0.5),
            new THREE.Vector2(0.65, 1.2), new THREE.Vector2(0.85, 2.2), new THREE.Vector2(0.8, 2.8),
            new THREE.Vector2(0.35, 3.2), new THREE.Vector2(0.35, 3.8), new THREE.Vector2(0.3, 3.8)
        ];

        // Water
        const waterPoints = points.map(p => new THREE.Vector2(p.x * 0.92, p.y));
        const waterGeo = new THREE.LatheGeometry(waterPoints, 64);
        waterGeo.translate(0, -BOTTLE_HEIGHT / 2, 0);
        const waterMesh = new THREE.Mesh(waterGeo, new THREE.MeshPhongMaterial({
            color: 0x2196F3,
            shininess: 100,
            opacity: 0.85,
            transparent: true,
            clippingPlanes: [globalPlaneRef.current]
        }));
        waterMeshRef.current = waterMesh;
        bottleGroup.add(waterMesh);

        // Stencil material - writes to stencil buffer where back of water is visible
        const stencilMat = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false,
            side: THREE.BackSide,
            clippingPlanes: [globalPlaneRef.current],
            stencilWrite: true,
            stencilRef: 1,
            stencilFunc: THREE.AlwaysStencilFunc,
            stencilZPass: THREE.ReplaceStencilOp
        });
        bottleGroup.add(new THREE.Mesh(waterGeo, stencilMat));

        // Water surface cap - uses stencil to only render inside bottle
        // Large plane that gets clipped by stencil buffer to bottle silhouette
        const waterCapMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),  // Large plane like original HTML
            new THREE.MeshBasicMaterial({
                color: 0x2196F3,
                opacity: 0.85,
                transparent: true,
                side: THREE.DoubleSide,
                stencilWrite: true,
                stencilFunc: THREE.EqualStencilFunc,  // Only render where stencil = 1
                stencilRef: 1
            })
        );
        waterCapMesh.rotation.x = -Math.PI / 2;  // Lay flat horizontally
        waterCapMesh.renderOrder = 1;  // Render after stencil is written
        waterCapMeshRef.current = waterCapMesh;
        scene.add(waterCapMesh);

        // Bottle body
        const bottleGeo = new THREE.LatheGeometry(points, 64);
        bottleGeo.translate(0, -BOTTLE_HEIGHT / 2, 0);
        const bMesh = new THREE.Mesh(bottleGeo, new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            depthWrite: false
        }));
        bMesh.castShadow = true;
        bMesh.renderOrder = 2;
        bottleGroup.add(bMesh);

        // Cap
        const capGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 32);
        capGeo.translate(0, 2.0, 0);
        bottleGroup.add(new THREE.Mesh(capGeo, new THREE.MeshPhysicalMaterial({ color: 0x007AFF })));

        scene.add(bottleGroup);
    }, []);

    const resetBottle = useCallback(() => {
        positionRef.current.set(0, FLOOR_Y + BOTTLE_HEIGHT / 2, 0);
        velocityRef.current.set(0, 0, 0);
        rotationVelocityRef.current = 0;

        if (bottleGroupRef.current) {
            bottleGroupRef.current.position.copy(positionRef.current);
            bottleGroupRef.current.rotation.set(0, 0, 0);
        }

        targetRadiusRef.current = 18;

        const colorConfig = getComboColor(gameStateRef.current.comboCount);

        if (waterMeshRef.current && waterMeshRef.current.material instanceof THREE.MeshPhongMaterial) {
            waterMeshRef.current.material.color.setHex(colorConfig.water);
        }
        if (waterCapMeshRef.current && waterCapMeshRef.current.material instanceof THREE.MeshBasicMaterial) {
            waterCapMeshRef.current.material.color.setHex(colorConfig.water);
        }

        setGameState(prev => ({
            ...prev,
            isFlying: false,
            canThrow: prev.isGameActive
        }));
    }, []);

    const updateCameraPosition = useCallback(() => {
        const camera = cameraRef.current;
        if (!camera) return;

        camPhiRef.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, camPhiRef.current));

        // Keep lookAt fixed at origin like original HTML - no camera following during flight
        const lookAtPos = new THREE.Vector3(0, 0, 0);

        camera.position.set(
            lookAtPos.x + camRadiusRef.current * Math.sin(camPhiRef.current) * Math.sin(camThetaRef.current),
            lookAtPos.y + camRadiusRef.current * Math.cos(camPhiRef.current),
            lookAtPos.z + camRadiusRef.current * Math.sin(camPhiRef.current) * Math.cos(camThetaRef.current)
        );
        camera.lookAt(lookAtPos);
    }, []);

    const checkLanding = useCallback(() => {
        const bottleGroup = bottleGroupRef.current;
        if (!bottleGroup) return;

        let norm = Math.abs(bottleGroup.rotation.x % (Math.PI * 2));
        if (norm > Math.PI) norm = (Math.PI * 2) - norm;

        if (norm < 0.55) {
            // Success
            const newCombo = gameStateRef.current.comboCount + 1;
            const newFever = newCombo >= 3;
            const points = newFever ? 2 : 1;

            setGameState(prev => ({
                ...prev,
                comboCount: newCombo,
                isFeverMode: newFever,
                score: prev.score + points,
                isFlying: false
            }));

            // Update water color immediately based on new combo
            const newColorConfig = getComboColor(newCombo);
            if (waterMeshRef.current && waterMeshRef.current.material instanceof THREE.MeshPhongMaterial) {
                waterMeshRef.current.material.color.setHex(newColorConfig.water);
            }
            if (waterCapMeshRef.current && waterCapMeshRef.current.material instanceof THREE.MeshBasicMaterial) {
                waterCapMeshRef.current.material.color.setHex(newColorConfig.water);
            }

            playSound('success');
            triggerHaptics();
            fireConfetti();
            updateConfetti();

            bottleGroup.rotation.x = 0;
            positionRef.current.y = FLOOR_Y + 2.0;
        } else {
            // Fail
            setGameState(prev => ({
                ...prev,
                comboCount: 0,
                isFeverMode: false,
                isFlying: false
            }));

            playSound('fail');
            bottleGroup.rotation.x = -Math.PI / 2;
            positionRef.current.y = FLOOR_Y + 0.8;
        }

        setTimeout(resetBottle, 1000);
    }, [playSound, triggerHaptics, fireConfetti, updateConfetti, resetBottle]);

    const animate = useCallback(() => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const bottleGroup = bottleGroupRef.current;

        if (!renderer || !scene || !camera || !bottleGroup) return;

        const state = gameStateRef.current;

        // Camera controls - only when not flying
        if (!state.isFlying && state.isGameActive) {
            const ctrl = ctrlStateRef.current;
            if (ctrl.left) camThetaRef.current += 0.03;
            if (ctrl.right) camThetaRef.current -= 0.03;
            if (ctrl.up) camPhiRef.current -= 0.03;
            if (ctrl.down) camPhiRef.current += 0.03;
            updateCameraPosition();
        }

        // Physics
        if (state.isFlying) {
            velocityRef.current.y += GRAVITY * 0.016;
            positionRef.current.addScaledVector(velocityRef.current, 0.016);
            bottleGroup.rotation.x -= rotationVelocityRef.current * 0.016;

            const extent = (2.0 * Math.abs(Math.cos(bottleGroup.rotation.x))) +
                (0.8 * Math.abs(Math.sin(bottleGroup.rotation.x)));

            if (velocityRef.current.y < 0 && (positionRef.current.y - extent <= FLOOR_Y)) {
                checkLanding();
            }
            // Camera stays fixed during flight - no updateCameraPosition() call here
        }

        bottleGroup.position.copy(positionRef.current);

        // Water level clipping
        const waterLevel = positionRef.current.y - THREE.MathUtils.lerp(1.2, 0.0, Math.abs(Math.sin(bottleGroup.rotation.x)));
        globalPlaneRef.current.constant = waterLevel;

        // Update water cap position to follow water level (stays horizontal, stencil clips it)
        if (waterCapMeshRef.current) {
            waterCapMeshRef.current.position.set(positionRef.current.x, waterLevel, positionRef.current.z);
            // Keep horizontal - stencil buffer clips to bottle shape
        }

        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [updateCameraPosition, checkLanding]);

    // --- Initialize Three.js ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xD1D1D6, 0.02);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 150);
        cameraRef.current = camera;

        // Renderer - stencil: true is required for water surface to work correctly
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            stencil: true,  // Enable stencil buffer for water cap clipping
            preserveDrawingBuffer: true // Required for html2canvas to capture WebGL content
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xE5E5EA);  // Gray background like original
        renderer.shadowMap.enabled = true;
        renderer.localClippingEnabled = true;
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5, 12, 8);
        sun.castShadow = true;
        scene.add(sun);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.ShadowMaterial({ opacity: 0.15 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        floor.receiveShadow = true;
        scene.add(floor);

        // Create bottle
        createBottle();
        resetBottle();
        updateCameraPosition();

        // Start animation
        animate();

        // Handle resize
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [createBottle, resetBottle, updateCameraPosition, animate]);

    // --- Game Controls ---
    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            showIntro: false,
            isGameActive: true,
            canThrow: true,
            timeLeft: 60,
            score: 0,
            tryCount: 0,
            comboCount: 0,
            isFeverMode: false
        }));

        const start = performance.now();
        timerIntervalRef.current = setInterval(() => {
            const elapsed = (performance.now() - start) / 1000;
            const remaining = Math.max(0, 60 - elapsed);

            setGameState(prev => ({
                ...prev,
                timeLeft: remaining
            }));

            if (remaining <= 0) {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setGameState(prev => ({
                    ...prev,
                    isGameActive: false,
                    showEnd: true,
                    canThrow: false
                }));
            }
        }, 50);
    }, []);

    // Flag to track if a valid throw was started (not on a control button)
    const isValidThrowStartRef = useRef(false);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!gameStateRef.current.canThrow) return;
        if ((e.target as HTMLElement).closest('.ctrl-btn')) {
            isValidThrowStartRef.current = false;
            return;
        }

        isValidThrowStartRef.current = true;
        startYRef.current = e.clientY;
        startTimeRef.current = performance.now();
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!gameStateRef.current.canThrow) return;
        if ((e.target as HTMLElement).closest('.ctrl-btn')) return;
        if (!isValidThrowStartRef.current) return;

        isValidThrowStartRef.current = false;

        const deltaY = startYRef.current - e.clientY;
        const deltaT = performance.now() - startTimeRef.current;

        if (deltaY > 50 && deltaT > 50) {
            setGameState(prev => ({
                ...prev,
                tryCount: prev.tryCount + 1,
                isFlying: true,
                canThrow: false
            }));

            const speed = deltaY / deltaT;
            velocityRef.current.y = Math.min(Math.max(speed * 8, 12), 26);
            velocityRef.current.z = -3;
            rotationVelocityRef.current = Math.min(Math.max(speed * 0.45, 6), 22) + (Math.random() * 2);

            playSound('throw');
        }
    }, [playSound]);

    // --- Control Buttons ---
    const bindCtrl = useCallback((key: keyof CtrlState, down: boolean) => {
        ctrlStateRef.current[key] = down;
    }, []);

    const restartGame = useCallback(() => {
        setGameState({
            isGameActive: false,
            timeLeft: 60,
            score: 0,
            tryCount: 0,
            comboCount: 0,
            isFeverMode: false,
            isFlying: false,
            canThrow: false,
            showIntro: true,
            showEnd: false,
        });
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        resetBottle();
    }, [resetBottle]);

    const shareResult = useCallback(() => {
        const rate = gameState.tryCount === 0 ? 0 : Math.round((gameState.score / gameState.tryCount) * 100);

        // 1. Try Kakao SDK first
        const kakao = (window as any).Kakao;
        if (kakao) {
            try {
                if (!kakao.isInitialized()) {
                    kakao.init('8e68190d1ba932955a557fbf0ae0b659');
                }
                kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: '[Fun.Uncle] 물병 세우기 도전!',
                        description: `최종 점수: ${gameState.score}점\n성공률: ${rate}%\n너도 도전해봐!!`,
                        imageUrl: 'https://fun.uncledison.com/assets/bottle_share_square.png',
                        link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href,
                        },
                    },
                    buttons: [
                        {
                            title: '나도 도전하기',
                            link: {
                                mobileWebUrl: window.location.href,
                                webUrl: window.location.href,
                            },
                        },
                    ],
                });
                return;
            } catch (err) {
                console.error('Kakao share failed, falling back', err);
            }
        }

        // 2. Fallback to navigator.share for other browsers/platforms
        const text = `[Fun.Uncle] 물병 세우기 도전!\n최종 점수: ${gameState.score}점\n성공률: ${rate}%\n너도 도전해봐!!\n${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: '물병 세우기 챌린지',
                text: text,
                url: window.location.href
            }).catch(() => {
                // Share cancelled
            });
        } else {
            // 3. Last resort
            alert('결과가 클립보드에 복사되었습니다!');
            navigator.clipboard.writeText(text);
        }
    }, [gameState.score, gameState.tryCount]);





    // --- Rank Calculation ---
    const getResult = useCallback(() => {
        const rate = gameState.tryCount === 0 ? 0 : Math.round((gameState.score / gameState.tryCount) * 100);

        if (rate === 0) return { rank: "😅", msg: "아쉽지만 한 번 더 도전해봐요!" };
        if (rate > 30) return { rank: "👑", msg: "신의 손이네! 정말 완벽해요!" };
        if (rate > 15) return { rank: "✨", msg: "대단해! 보통 실력이 아닌걸요?" };
        return { rank: "👍", msg: "멋진 실력이에요!" };
    }, [gameState.score, gameState.tryCount]);

    const result = getResult();
    const successRate = gameState.tryCount === 0 ? 0 : Math.round((gameState.score / gameState.tryCount) * 100);

    return (
        <div
            className="relative w-full h-[100dvh] overflow-hidden select-none"
            style={{
                background: 'radial-gradient(circle at center, #F5F5F7 0%, #D1D1D6 100%)',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
                touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            {/* Three.js Canvas Container */}
            <div ref={containerRef} className="absolute inset-0" />

            {/* Confetti Canvas */}
            <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-10" />

            {/* Game UI */}
            <AnimatePresence>
                {gameState.isGameActive && !gameState.showIntro && !gameState.showEnd && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-8 left-0 w-full px-6 flex justify-between items-center z-50 pointer-events-none"
                    >
                        <motion.div
                            className="text-3xl font-bold cursor-pointer pointer-events-auto"
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => navigate('/')}
                        >
                            <span style={{ color: '#007AFF' }}>Fun</span>
                            <span style={{ color: '#007AFF' }}>.</span>
                            <span style={{ color: '#1C1C1E' }}>Uncle</span>
                        </motion.div>
                        <div
                            className={`text-xl font-extrabold tabular-nums ${gameState.timeLeft <= 10 ? 'animate-pulse' : ''}`}
                            style={{ color: gameState.timeLeft <= 10 ? '#FF3B30' : '#1C1C1E' }}
                        >
                            ⏱️ {gameState.timeLeft.toFixed(2)}
                        </div>
                        <div className="text-xl font-extrabold text-gray-800">
                            🏆 {gameState.score}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Combo Display */}
            <AnimatePresence>
                {gameState.comboCount >= 2 && gameState.isGameActive && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        exit={{ scale: 0 }}
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-50 w-full px-4"
                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                    >
                        <div
                            className="text-5xl md:text-6xl font-bold whitespace-nowrap"
                            style={{
                                color: '#' + getComboColor(gameState.comboCount).water.toString(16).padStart(6, '0'),
                                WebkitTextStroke: '1.5px black',
                                paintOrder: 'stroke fill',
                                textShadow: '3px 3px 0px rgba(0,0,0,0.3)'
                            }}
                        >
                            {gameState.comboCount} COMBO
                        </div>
                        {gameState.isFeverMode && (
                            <div className="text-xl md:text-2xl mt-[-10px] whitespace-nowrap"
                                style={{
                                    color: '#' + getComboColor(gameState.comboCount).water.toString(16).padStart(6, '0'),
                                    WebkitTextStroke: '1px black',
                                    paintOrder: 'stroke fill',
                                    textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                                }}>
                                FEVER x2!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Buttons */}
            {gameState.isGameActive && (
                <>
                    <motion.div
                        className="ctrl-btn absolute left-4 top-1/2 -translate-y-1/2 text-5xl cursor-pointer z-20"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        onPointerDown={(e) => { e.stopPropagation(); bindCtrl('left', true); }}
                        onPointerUp={(e) => { e.stopPropagation(); bindCtrl('left', false); }}
                        onPointerLeave={() => bindCtrl('left', false)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        ‹
                    </motion.div>
                    <motion.div
                        className="ctrl-btn absolute right-4 top-1/2 -translate-y-1/2 text-5xl cursor-pointer z-20"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        onPointerDown={(e) => { e.stopPropagation(); bindCtrl('right', true); }}
                        onPointerUp={(e) => { e.stopPropagation(); bindCtrl('right', false); }}
                        onPointerLeave={() => bindCtrl('right', false)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    >
                        ›
                    </motion.div>
                    <motion.div
                        className="ctrl-btn absolute top-20 left-1/2 -translate-x-1/2 text-5xl cursor-pointer rotate-90 z-20"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        onPointerDown={(e) => { e.stopPropagation(); bindCtrl('up', true); }}
                        onPointerUp={(e) => { e.stopPropagation(); bindCtrl('up', false); }}
                        onPointerLeave={() => bindCtrl('up', false)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    >
                        ‹
                    </motion.div>
                    <motion.div
                        className="ctrl-btn absolute bottom-12 left-1/2 -translate-x-1/2 text-5xl cursor-pointer rotate-90 z-20"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        onPointerDown={(e) => { e.stopPropagation(); bindCtrl('down', true); }}
                        onPointerUp={(e) => { e.stopPropagation(); bindCtrl('down', false); }}
                        onPointerLeave={() => bindCtrl('down', false)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    >
                        ›
                    </motion.div>
                </>
            )}

            {/* Swipe Tutorial Overlay */}
            <AnimatePresence>
                {gameState.isGameActive && !gameState.showIntro && !gameState.showEnd && gameState.timeLeft > 56 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-[60] flex flex-col items-center justify-center translate-y-20"
                    >
                        {/* Hand Swipe Animation */}
                        <motion.div
                            className="text-7xl mb-6 filter drop-shadow-lg"
                            initial={{ y: 50, opacity: 0, scale: 1 }}
                            animate={{
                                y: -150,
                                opacity: [0, 1, 0, 0]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        >
                            👆
                        </motion.div>

                        <div className="text-white font-black text-2xl bg-black/40 px-6 py-3 rounded-full backdrop-blur-sm animate-bounce">
                            위로 밀어 물병을 던지세요!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Intro Screen */}
            <AnimatePresence>
                {gameState.showIntro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-[1000]"
                        style={{
                            backdropFilter: 'blur(25px)',
                            WebkitBackdropFilter: 'blur(25px)',
                            background: 'rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <h1
                            className="text-6xl md:text-7xl font-normal m-0"
                            style={{
                                fontFamily: "'Black Han Sans', sans-serif",
                                color: '#007AFF',
                                letterSpacing: '-1px',
                                textShadow: '2px 2px 0 rgba(0,122,255,0.2)'
                            }}
                        >
                            물병 세우기
                        </h1>
                        <p className="text-xl md:text-2xl mt-4 flex items-center justify-center">
                            <span className="mr-1">⏱️</span>
                            <span style={{ color: '#000080', fontWeight: 'bold' }}>1분</span><span style={{ color: '#8E8E93' }}>에 몇개?</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="mt-8 px-12 py-4 rounded-full text-white text-xl font-semibold cursor-pointer border-none"
                            style={{ background: '#007AFF' }}
                        >
                            시작하기
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-8 py-3 rounded-full text-gray-600 text-lg font-medium cursor-pointer bg-white/50 border border-gray-200 flex items-center gap-2"
                        >
                            <Home size={20} /> 홈으로
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Capture Preview Modal */}
            {/* Share Button (Bottom Right) */}


            {/* End Screen */}
            <AnimatePresence>
                {gameState.showEnd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-[1000]"
                        style={{
                            backdropFilter: 'blur(25px)',
                            WebkitBackdropFilter: 'blur(25px)',
                            background: 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        <div className="text-8xl">{result.rank}</div>
                        <p className="text-2xl font-bold text-gray-800 mt-2 mb-8">{result.msg}</p>
                        <div className="text-xl font-semibold text-gray-600 mb-8">
                            시도: {gameState.tryCount} | 성공률: {successRate}%
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={shareResult}
                                className="px-12 py-4 rounded-full text-white text-xl font-semibold cursor-pointer border-none flex items-center gap-2"
                                style={{ background: '#007AFF' }}
                            >
                                <Share2 size={20} /> 공유
                            </button>
                            <button
                                onClick={restartGame}
                                className="px-12 py-4 rounded-full text-white text-xl font-semibold cursor-pointer border-none flex items-center gap-2"
                                style={{ background: '#6e6e73' }}
                            >
                                <RefreshCw size={20} /> 다시
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-8 py-3 rounded-full text-gray-600 text-lg font-medium cursor-pointer bg-white/50 border border-gray-200 flex items-center gap-2"
                        >
                            <Home size={20} /> 홈으로
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
