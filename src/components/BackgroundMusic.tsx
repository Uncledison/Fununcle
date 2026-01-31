import React, { useState, useEffect, useRef } from 'react';

interface BackgroundMusicProps {
    className?: string;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ className = "" }) => {
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
        <div className={`cursor-pointer transition-opacity duration-300 ${className}`}>
            <audio ref={audioRef} loop src="/bgm.mp3" />

            <button
                onClick={toggleMusic}
                className={`flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${!isPlaying ? 'opacity-40 grayscale' : 'opacity-100'}`}
                aria-label="Toggle Background Music"
            >
                <img
                    src="/assets/music_note.png"
                    alt="Music Toggle"
                    className="w-4 h-4 object-contain drop-shadow-sm"
                />
            </button>
        </div>
    );
};
