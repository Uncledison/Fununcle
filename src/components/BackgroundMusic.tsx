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
                className={`p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110 ${!isPlaying ? 'opacity-50 grayscale' : 'opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}
                aria-label="Toggle Background Music"
            >
                <img
                    src="/assets/music_note.png"
                    alt="Music Toggle"
                    className="w-5 h-5 object-contain invert opacity-90"
                />
            </button>
        </div>
    );
};
