import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CANDIES = ['🍬', '🍭', '🍫', '🍥', '🧁', '🍩'];

interface Candy {
    id: number;
    emoji: string;
    x: number;
    y: number;
    rotate: number;
    scale: number;
    duration: number;
    delay: number;
}

export function CandyDecoration() {
    const [candies, setCandies] = useState<Candy[]>([]);

    useEffect(() => {
        // Generate random candies only on client side to avoid hydration mismatch
        const newCandies = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            emoji: CANDIES[Math.floor(Math.random() * CANDIES.length)],
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            rotate: Math.random() * 360,
            scale: Math.random() * 0.5 + 0.5,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5,
        }));
        setCandies(newCandies);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {candies.map((candy) => (
                <motion.div
                    key={candy.id}
                    initial={{
                        opacity: 0,
                        x: `${candy.x}vw`,
                        y: `${candy.y}vh`,
                        rotate: candy.rotate,
                        scale: candy.scale
                    }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        y: [`${candy.y}vh`, `${candy.y - 20}vh`],
                        rotate: candy.rotate + 360,
                    }}
                    transition={{
                        duration: candy.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: candy.delay,
                    }}
                    className="absolute text-4xl select-none filter blur-[1px]"
                >
                    {candy.emoji}
                </motion.div>
            ))}
        </div>
    );
}
