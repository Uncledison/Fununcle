import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';

export const PigMascot: React.FC = () => {
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

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent header click (page reload)

        if (isPlaying || !activeData) return;

        setIsPlaying(true);
        setIsIdle(false);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }

        setTimeout(() => {
            setIsIdle(true);
            setIsPlaying(false);
        }, 1500);
    };

    if (!idleData || !activeData) return null;

    return (
        <div
            className="w-[50px] md:w-[70px] cursor-pointer hover:scale-110 transition-transform relative z-50 ml-2"
            onClick={handleClick}
            style={{ marginTop: '-10px' }} // Slight adjustment to align with text
        >
            <Lottie
                animationData={isIdle ? idleData : activeData}
                loop={isIdle}
                autoplay={true}
            />
        </div>
    );
};
