import React, { useRef } from 'react';
// CSS import is handled in _app.tsx

interface ProfileCardProps {
    name: string;
    title: string;
    avatarUrl: string;
    className?: string;
    spotlightColor?: string;
    // Previously used props, kept optional for compatibility if needed, though mostly unused now
    enableTilt?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    name,
    title,
    avatarUrl,
    className = '',
    spotlightColor = 'rgba(255, 255, 255, 0.25)',
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`card-spotlight ${className} flex flex-col items-center justify-between overflow-hidden rounded-3xl`}
        >
            <div className="z-10 mt-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-1 tracking-wide">{name}</h3>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>

            <div className="relative w-full h-64 mt-4 z-10 flex items-end justify-center">
                <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-auto object-contain max-w-full drop-shadow-2xl transition-transform duration-300 hover:scale-105 rounded-2xl"
                    loading="lazy"
                />
                {/* Gradient fade at bottom if desired, or let it sit on the border */}
            </div>
        </div>
    );
};

export default ProfileCard;
