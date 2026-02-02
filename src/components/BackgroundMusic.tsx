import React, { useState, useEffect, useRef } from 'react';

interface BackgroundMusicProps {
    className?: string;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.5; // Default volume

        // Define handler externally for proper cleanup referencing
        const enableAudio = () => {
            audio.play()
                .then(() => {
                    setIsPlaying(true);
                    cleanupListeners();
                })
                .catch(err => console.error("Interaction play failed:", err));
        };

        const cleanupListeners = () => {
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        };

        // 1. Attempt immediate autoplay
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented by browser:", error);
                setIsPlaying(false);

                // 2. Fallback: Add interaction listeners
                document.addEventListener('click', enableAudio);
                document.addEventListener('touchstart', enableAudio);
            });
        }

        // Cleanup function
        return () => {
            cleanupListeners();
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
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
            <audio ref={audioRef} loop src="/bgm.mp3" autoPlay />

            <button
                onClick={toggleMusic}
                className={`flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${!isPlaying ? 'opacity-40 grayscale' : 'opacity-100'}`}
                aria-label="Toggle Background Music"
            >
                <img
                    src="/assets/music_note.png"
                    alt="Music Toggle"
                    className="w-5 h-5 object-contain drop-shadow-sm"
                />
            </button>
        </div>
    );
};
