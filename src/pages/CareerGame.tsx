import React from 'react';

export const CareerGame: React.FC = () => {
    return (
        <div className="w-full h-screen">
            <iframe
                src="https://ai-careercompass.vercel.app/"
                className="w-full h-full border-0"
                title="Career Compass"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
        </div>
    );
};
