import React from 'react';
import { Header } from '../components/Header';
import { BentoGrid } from '../components/BentoGrid';
import { CursorParticles } from '../components/CursorParticles';

export const Home: React.FC = () => {
    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            <CursorParticles />
            <div className="relative z-10">
                <Header />
                <BentoGrid />
            </div>
        </main>
    );
};
