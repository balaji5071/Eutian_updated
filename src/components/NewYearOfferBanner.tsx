'use strict';

import React, { useState, useEffect } from 'react';
import { Timer, PartyPopper } from 'lucide-react';

const OfferBanner = () => {
    // Valentine's Day Special: Offer ends Feb 14, 2026 at 11:59 PM IST
    const targetDate = new Date('2026-02-14T23:59:59+05:30').getTime();

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
        <div className="w-full bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 text-pink-900 py-4 px-3 shadow-lg overflow-hidden relative border-b-2 border-pink-300">
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-pink-300/20 animate-pulse"></div>
            
            {/* Floating hearts decoration */}
            <div className="absolute left-0 top-0 bottom-0 w-20 opacity-30">
                <span className="absolute text-4xl animate-bounce" style={{ left: '10px', top: '10%' }}>💕</span>
                <span className="absolute text-3xl animate-bounce" style={{ left: '5px', top: '60%', animationDelay: '0.5s' }}>💖</span>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-20 opacity-30">
                <span className="absolute text-4xl animate-bounce" style={{ right: '10px', top: '20%', animationDelay: '0.3s' }}>💝</span>
                <span className="absolute text-3xl animate-bounce" style={{ right: '5px', top: '70%', animationDelay: '0.7s' }}>💗</span>
            </div>
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center relative z-10">
                <div className="flex items-center gap-2 font-bold text-base md:text-lg">
                    <span className="text-5xl animate-bounce">💝</span>
                    <span className="text-pink-700">💕 <span className="text-rose-600 font-extrabold text-xl">VALENTINE'S DAY SPECIAL:</span> SPREAD THE LOVE <span className="text-pink-600 font-black text-xl">30% OFF</span> ALL PACKAGES! 💖</span>
                </div>

                <div className="flex items-center gap-4 bg-gradient-to-r from-rose-200/80 to-pink-200/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-pink-400 shadow-lg shadow-pink-400/30">
                    <Timer className="h-5 w-5 text-rose-600 animate-pulse" />
                    <div className="flex gap-2 font-mono text-xl font-extrabold text-rose-700">
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.hours)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-rose-500">Hrs</span>
                        </div>
                        <span className="mt-[-2px] animate-pulse">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.minutes)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-rose-500">Min</span>
                        </div>
                        <span className="mt-[-2px] animate-pulse">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.seconds)}</span>
                            <span className="text-[10px] uppercase -mt-1 font-sans text-rose-500">Sec</span>
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
