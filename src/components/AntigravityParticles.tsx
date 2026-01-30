import React, { useEffect, useRef } from 'react';

// Utility: Pre-calculate colors for performance
const COLORS = [
    '#EA4335', // Red
    '#4285F4', // Blue
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#A142F4', // Purple
    '#F28B82', // Light Red
    '#8AB4F8', // Light Blue
];

export const AntigravityParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        // Configuration
        const PARTICLE_COUNT = 800; // Total dots in sphere
        const SPHERE_RADIUS = Math.min(width, height) * 0.35; // Size of globe
        const ROTATION_SPEED_BASE = 0.002;

        // State
        let particles: Particle3D[] = [];
        let rotationX = 0;
        let rotationY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        class Particle3D {
            x: number;
            y: number;
            z: number;
            color: string;
            size: number;
            pulsePhase: number;

            // Original spherical coordinates
            theta: number;
            phi: number;
            radius: number;

            constructor(index: number, total: number) {
                // Fibonacci Sphere Distribution (Evenly spaced points on sphere)
                const phi = Math.acos(1 - 2 * (index + 0.5) / total);
                const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);

                this.radius = SPHERE_RADIUS;
                this.theta = theta;
                this.phi = phi;

                this.x = this.radius * Math.sin(phi) * Math.cos(theta);
                this.y = this.radius * Math.sin(phi) * Math.sin(theta);
                this.z = this.radius * Math.cos(phi);

                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.size = Math.random() * 2 + 1.5; // Base thickness
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            // Project 3D point to 2D
            project(rotX: number, rotY: number, perspective: number) {
                // 1. Rotate Y (Horizontal Spin)
                let x1 = this.x * Math.cos(rotY) - this.z * Math.sin(rotY);
                let z1 = this.z * Math.cos(rotY) + this.x * Math.sin(rotY);

                // 2. Rotate X (Vertical Tilt)
                let y1 = this.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = z1 * Math.cos(rotX) + this.y * Math.sin(rotX);

                // 3. Perspective Projection
                // Simple camera z-distance
                const cameraZ = 1000;
                const scale = cameraZ / (cameraZ - z2); // z2 is depth relative to center

                const screenX = x1 * scale + width / 2;
                const screenY = y1 * scale + height / 2;

                return { x: screenX, y: screenY, scale, z: z2 };
            }
        }

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle3D(i, PARTICLE_COUNT));
            }
        };

        const render = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            // Smooth Rotation Control
            rotationX += (targetRotationX - rotationX) * 0.05;
            rotationY += (targetRotationY - rotationY) * 0.05;

            // Continual Base Rotation
            targetRotationY += ROTATION_SPEED_BASE;

            // Sort by depth (painters algorithm) so front particles cover back ones
            const projected = particles.map(p => {
                // Pulse Animation
                const pulse = Math.sin(time * 0.002 + p.pulsePhase) * 0.3 + 1; // 0.7 to 1.3 scale
                const point = p.project(rotationX, rotationY, 1000);
                return { ...p, point, pulse };
            });

            projected.sort((a, b) => a.point.z - b.point.z); // Draw back to front

            projected.forEach(p => {
                const { x, y, scale } = p.point;
                const alpha = Math.max(0.1, (scale - 0.5) * 1.5); // Fade distant particles

                // Capsule Dimensions
                // Length aligns with sphere surface tangent (roughly horizontal/vertical mix)
                // Let's just make them capsules oriented by rotation or fixed.
                // Actually, oriented towards center or along flow looks best.
                // Let's align them horizontally-ish but tilted by position for a "flow" look.
                const angle = Math.atan2(y - height / 2, x - width / 2) + Math.PI / 2;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);

                const w = p.size * scale * p.pulse;
                const h = p.size * scale * p.pulse * 2.5; // Elongated capsule (oval)

                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                ctx.beginPath();
                ctx.roundRect(-w / 2, -h / 2, w, h, w / 2);
                ctx.fill();

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        const handleResize = () => init();

        const handleMouseMove = (e: MouseEvent) => {
            // Interactive Rotation: Map mouse X/Y to rotation targets
            // But gently, don't override the base spin completely
            const x = (e.clientX / width - 0.5) * 2; // -1 to 1
            const y = (e.clientY / height - 0.5) * 2;

            // Influence the "tilt" (X-axis) and add to "spin" (Y-axis)
            targetRotationX = y * 0.5;
            // We adding to Y rotation speed or setting absolute?
            // Let's just influence tilt for now, Y spins forever.
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        render(0);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-80"
        />
    );
};
