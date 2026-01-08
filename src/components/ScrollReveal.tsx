'use strict';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

const ScrollReveal = ({
    children,
    width = "100%",
    delay = 0.2,
    direction = "up"
}: ScrollRevealProps) => {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
            x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
        },
    };

    return (
        <div style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{
                    duration: 0.8,
                    delay: delay,
                    ease: [0.21, 0.47, 0.32, 0.98]
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
