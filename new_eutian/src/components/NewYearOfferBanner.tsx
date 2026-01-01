'use strict';

import React, { useState, useEffect } from 'react';
import { Timer, PartyPopper } from 'lucide-react';

const NewYearOfferBanner = () => {
    // Target date: 96 hours from Jan 1st, 2026, 11:18:55 AM
    const targetDate = new Date('2026-01-05T11:18:55+05:30').getTime();

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
        <div className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black py-3 px-4 shadow-lg overflow-hidden relative group">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
                    <PartyPopper className="h-6 w-6 animate-bounce" />
                    <span>NEW YEAR OFFER: 30% FLAT DISCOUNT ON ALL PACKAGES!</span>
                </div>

                <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-black/20">
                    <Timer className="h-5 w-5" />
                    <div className="flex gap-1 font-mono text-xl font-bold">
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.hours)}</span>
                            <span className="text-[10px] uppercase -mt-1 opacity-70 font-sans">Hrs</span>
                        </div>
                        <span className="mt-[-2px]">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.minutes)}</span>
                            <span className="text-[10px] uppercase -mt-1 opacity-70 font-sans">Min</span>
                        </div>
                        <span className="mt-[-2px]">:</span>
                        <div className="flex flex-col items-center">
                            <span>{formatNumber(timeLeft.seconds)}</span>
                            <span className="text-[10px] uppercase -mt-1 opacity-70 font-sans">Sec</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sparkle decorative effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
                <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
            </div>
        </div>
    );
};

export default NewYearOfferBanner;
