import React, { useEffect, useState, useRef } from 'react';
import mascot from '../assets/uncle_z_mascot.png';

export const InteractiveMascot: React.FC = () => {
    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/assets/sounds/boing-01.mp3');

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            // Get the mascot's position on screen
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate angle and distance
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX);

            // Limit the movement distance (radius) so pupils stay in eyes
            const maxRadius = 3;
            const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2) / 20, maxRadius);

            setPupilPos({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleClick = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    return (
        <div ref={containerRef} className="relative w-12 h-12 flex items-center justify-center cursor-pointer" onClick={handleClick}>
            {/* Base Image (Head/Hair/Glasses frames) */}
            <img src={mascot} alt="Uncle Edison" className="w-full h-full object-cover" />

            {/* Left Eye Container (Simulating thick glasses with border) */}
            <div className="absolute top-[22px] left-[11px] w-[13px] h-[13px] bg-white rounded-full border-[2.5px] border-black flex items-center justify-center overflow-hidden">
                {/* Pupil */}
                <div
                    className="w-[5px] h-[5px] bg-black rounded-full"
                    style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                />
            </div>

            {/* Right Eye Container */}
            <div className="absolute top-[22px] right-[11px] w-[13px] h-[13px] bg-white rounded-full border-[2.5px] border-black flex items-center justify-center overflow-hidden">
                {/* Pupil */}
                <div
                    className="w-[5px] h-[5px] bg-black rounded-full"
                    style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                />
            </div>
        </div>
    );
};
