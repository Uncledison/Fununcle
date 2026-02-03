import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';

export const InteractiveMascot: React.FC = () => {
    const [isIdle, setIsIdle] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [idleData, setIdleData] = useState<any>(null);
    const [activeData, setActiveData] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Load Audio
        audioRef.current = new Audio('/assets/sounds/pig.mp3');

        // Fetch Lottie JSONs
        const fetchAnimations = async () => {
            try {
                const [idleRes, activeRes] = await Promise.all([
                    fetch('/assets/lottie/pig_idle.json'),
                    fetch('/assets/lottie/pig_active.json')
                ]);

                if (idleRes.ok && activeRes.ok) {
                    const idleJson = await idleRes.json();
                    const activeJson = await activeRes.json();
                    setIdleData(idleJson);
                    setActiveData(activeJson);
                }
            } catch (error) {
                console.error('Failed to load mascot animations:', error);
            }
        };

        fetchAnimations();
    }, []);

    const handleClick = () => {
        if (isPlaying || !activeData) return;

        setIsPlaying(true);
        setIsIdle(false);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }

        // Active animation duration is approx 2-3 seconds, revert after completion
        // Using a safe timeout to revert state
        setTimeout(() => {
            setIsIdle(true);
            setIsPlaying(false);
        }, 1500); // 1 active animation loop duration approximately
    };

    if (!idleData || !activeData) return null;

    return (
        <div
            className="absolute top-[-30px] right-2 md:right-0 w-[80px] md:w-[120px] cursor-pointer z-50 hover:scale-105 transition-transform"
            onClick={handleClick}
            style={{
                transform: 'translateY(-50%)',
            }}
        >
            <Lottie
                animationData={isIdle ? idleData : activeData}
                loop={isIdle}
                autoplay={true}
            />
        </div>
    );
};
