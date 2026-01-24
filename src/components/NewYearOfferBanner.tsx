'use strict';

import React, { useState, useEffect } from 'react';
import { Timer, PartyPopper } from 'lucide-react';

const OfferBanner = () => {
    // Special Offer: Offer ends Jan 20, 2026 at 11:59 PM IST
    const targetDate = new Date('2026-01-20T23:59:59+05:30').getTime();

    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    if (new Date().getTime() > targetDate) return null;

    return (
        <div className="w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 text-white py-3 px-3 shadow-2xl overflow-hidden relative border-b border-indigo-800/50">
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center relative z-10">
                <div className="flex items-center gap-2 font-bold text-base md:text-lg">
                    <PartyPopper className="h-5 w-5 text-amber-400 animate-bounce" />
                    <span className="text-gray-100">🎉 <span className="text-amber-400 font-extrabold">SPECIAL OFFER:</span> LIMITED TIME <span className="text-emerald-400">30% OFF</span> ALL PACKAGES! 🎉</span>
                </div>

                <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                    <Timer className="h-5 w-5 text-indigo-400" />
                    <div className="flex gap-2 font-mono text-xl font-extrabold text-indigo-300">
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.hours)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-indigo-400/80">Hrs</span>
                        </div>
                        <span className="mt-[-2px]">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.minutes)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-indigo-400/80">Min</span>
                        </div>
                        <span className="mt-[-2px]">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.seconds)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-indigo-400/80">Sec</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kite decorative effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-indigo-400 rounded-sm rotate-45 animate-ping"></div>
                <div className="absolute top-1/3 left-3/4 w-2 h-2 bg-purple-400 rounded-sm rotate-45 animate-ping delay-300"></div>
                <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-indigo-400 rounded-sm rotate-45 animate-ping delay-700"></div>
            </div>
        </div>
    );
};

export default OfferBanner;
