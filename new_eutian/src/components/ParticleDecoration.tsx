import { useEffect, useState } from 'react';

export default function ParticleDecoration() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Simple pure-CSS/SVG shapes: Circles, Squiggles, Stars
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Random colorful circles */}
            <div className="absolute top-[10%] left-[5%] w-4 h-4 rounded-full bg-chart-1 opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute top-[20%] right-[10%] w-3 h-3 rounded-full bg-chart-2 opacity-60 animate-bounce" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[30%] left-[15%] w-6 h-6 rounded-full bg-chart-3 opacity-40 animate-pulse" />
            <div className="absolute top-[40%] right-[25%] w-2 h-2 rounded-full bg-chart-4 opacity-70" />

            {/* Squiggles (SVG) */}
            <svg className="absolute top-[15%] left-[20%] w-12 h-12 text-chart-5 opacity-50 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animationDuration: '10s' }}>
                <path d="M4 12c2.5-4 6.5-4 9 0s6.5 4 9 0" />
            </svg>
            <svg className="absolute top-[60%] right-[5%] w-10 h-10 text-chart-1 opacity-50 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l2 5h5l-4 4 2 5-5-3-5 3 2-5-4-4h5z" /> {/* Starish shape */}
            </svg>

            {/* Confetti bits */}
            <div className="absolute top-[5%] right-[30%] w-2 h-6 bg-chart-2 rotate-45 opacity-60" />
            <div className="absolute bottom-[20%] left-[8%] w-6 h-2 bg-chart-4 -rotate-12 opacity-60" />
        </div>
    );
}
