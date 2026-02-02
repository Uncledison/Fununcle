import React from 'react';
import { motion } from 'framer-motion';
import comingSoonBanner from '../assets/coming_soon_banner.png';
import humanEvolutionBanner from '../assets/human_evolution_banner.png';
import careerBanner from '../assets/career_banner.png';
import circleBanner from '/banner.png';
import { Lock } from 'lucide-react'; // Restored import

import { Link } from 'react-router-dom';

const BentoCard = ({
    children,
    className,
    delay = 0,
    href,
    whileHover
}: {
    children: React.ReactNode,
    className?: string,
    delay?: number,
    href?: string,
    whileHover?: any
}) => {
    // const navigate = useNavigate(); // Removed unused hook

    // Default styles for the inner content container (unless overridden by className)
    // We append className to the OUTER container for Grid positioning, 
    // but some styles (like rounded-3xl) might be intended for the visual card.
    // For this refactor, we'll apply the structural/interactive classes to the outer div
    // and let the inner div manage content internal padding/etc if needed.

    // Actually, simply merging them onto the motion.div is safest for this 'Neal.fun' use case
    // where we often want to override everything with !bg-transparent.

    // Base classes that are always present
    const baseClasses = `transition-all duration-300 w-full h-full relative z-10`;

    // Content default visual styles (white card, shadow) - only apply if we aren't overriding basics
    // But since className is passed, and we used ! classes, we can just append className.
    const defaultVisuals = "bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl";

    // Combine everything. Note: If className has !bg-transparent, it will override defaultVisuals if widely applied.
    // However, to be safe and match the current behavior where we want "No Styles" for banners, 
    // let's apply the defaultVisuals conditionally or just stick them in the class string.

    const combinedClassName = `${defaultVisuals} ${baseClasses} cursor-pointer ${className || ''}`;

    const motionProps = {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.5, delay },
        whileHover: whileHover,
    };

    // 1. Internal Link (starts with /)
    if (href && href.startsWith('/')) {
        return (
            <Link
                to={href}
                className={`block ${className || ''} relative z-10`}
            >
                <motion.div
                    {...motionProps}
                    // We strip the grid classes from here since they are on the Link
                    className={`${defaultVisuals} w-full h-full`}
                >
                    {children}
                </motion.div>
            </Link>
        );
    }

    // 2. External Link
    if (href) {
        return (
            <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...motionProps}
                className={`block ${combinedClassName}`}
            >
                {children}
            </motion.a>
        );
    }

    // 3. Static Card
    return (
        <motion.div
            {...motionProps}
            className={`${defaultVisuals} ${baseClasses} ${className || ''}`}
        >
            {children}
        </motion.div>
    );
};

export const BentoGrid: React.FC = () => {
    return (
        <div className="relative z-10 w-full min-h-screen px-4 pb-20 pt-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Career Compass (Internal via iframe) */}
                <BentoCard
                    href="/career"
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={careerBanner}
                            alt="Career Compass"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 2. Human Evolution (Internal Game) */}
                <BentoCard
                    href="/history"
                    delay={0.1}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={humanEvolutionBanner}
                            alt="Human Evolution"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 3. Perfect Circle (New Game) */}
                <BentoCard
                    href="/circle"
                    delay={0.2}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={circleBanner}
                            alt="Perfect Circle"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </BentoCard>

                {/* 3. Coming Soon (Image Banner) */}
                <BentoCard
                    delay={0.2}
                    className="md:col-span-1 md:row-span-1 relative group !p-0 !bg-transparent !shadow-none overflow-hidden rounded-3xl aspect-video"
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                >
                    <div className="w-full h-full relative">
                        <img
                            src={comingSoonBanner}
                            alt="Coming Soon"
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        />
                        {/* Coming Soon Badge (Optional - added for consistency if image text isn't enough, but image says coming soon so minimal is better. Let's keep a small clean Lock icon generally) */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                                <Lock size={12} /> Closed
                            </span>
                        </div>
                    </div>
                </BentoCard>

            </div>

            <div className="text-center mt-20 text-gray-400 text-sm font-medium border-t border-gray-100 pt-8">
                © 2026 fun.uncledison.com
            </div>
        </div>
    );
};
