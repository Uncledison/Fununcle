import React, { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';

export const BackgroundMusic: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Attempt autoplay on mount
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.5; // Reasonable default volume
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented by browser:", error);
                    setIsPlaying(false); // Update state to reflect reality
                });
            }
        }
    }, []);

    const toggleMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed top-5 right-5 z-[100] cursor-pointer transition-opacity duration-300">
            <audio ref={audioRef} loop src="/bgm.mp3" />

            <button
                onClick={toggleMusic}
                className={`p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:scale-110 ${!isPlaying ? 'opacity-50 grayscale' : 'opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}
                aria-label="Toggle Background Music"
            >
                <Music size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
};
