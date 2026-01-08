import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SankrantiSplash() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Step 0: Show kite animation (3s)
    const timer1 = setTimeout(() => setStep(1), 3000);
    // Step 1: Show quote (4s)
    const timer2 = setTimeout(() => setStep(2), 7000);
    // Step 2: Fade out (1s)
    const timer3 = setTimeout(() => setShow(false), 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);     
    };
  }, []);

  const quotes = [
    "Let your dreams soar high like kites in the Sankranti sky",
    "New beginnings, endless possibilities",
    "Celebrate traditions, embrace the future"
  ];

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-50 flex items-center justify-center overflow-hidden"
      >
        {/* Animated sun rays */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-orange-200/30 to-transparent origin-top"
              style={{
                transform: `rotate(${i * 30}deg)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Floating kites */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
            const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
            const goingUp = i < 6; // 6 out of 8 go upwards
            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * screenWidth,
                  y: goingUp ? screenHeight + 100 : -100,
                  rotate: goingUp ? -45 : 135,
                }}
                animate={{
                  y: goingUp ? -100 : screenHeight + 100,
                  x: Math.random() * screenWidth,
                  rotate: goingUp ? 45 : 225,
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "linear",
                }}
              >
              <svg width="40" height="50" viewBox="0 0 40 50" className="drop-shadow-lg">
                <polygon
                  points="20,0 40,20 20,25 0,20"
                  fill={['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#FF8E53', '#A29BFE', '#FD79A8', '#74B9FF'][i % 8]}
                  opacity="0.9"
                  stroke="white"
                  strokeWidth="1.5"
                />
                {/* Diamond pattern */}
                <circle cx="20" cy="12" r="3" fill="white" opacity="0.8" />
                <circle cx="12" cy="15" r="2" fill="white" opacity="0.6" />
                <circle cx="28" cy="15" r="2" fill="white" opacity="0.6" />
                <line x1="20" y1="25" x2="20" y2="50" stroke="#333" strokeWidth="1.5" opacity="0.7" />
                {/* Ribbons */}
                {[...Array(3)].map((_, j) => (
                  <motion.path
                    key={j}
                    d={`M 20 ${30 + j * 5} Q ${15 + j * 2} ${35 + j * 5} 20 ${40 + j * 5}`}
                    stroke={['#FF6B6B', '#FFD93D', '#4ECDC4'][j]}
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.9"
                    animate={{
                      d: [
                        `M 20 ${30 + j * 5} Q ${15 + j * 2} ${35 + j * 5} 20 ${40 + j * 5}`,
                        `M 20 ${30 + j * 5} Q ${25 - j * 2} ${35 + j * 5} 20 ${40 + j * 5}`,
                        `M 20 ${30 + j * 5} Q ${15 + j * 2} ${35 + j * 5} 20 ${40 + j * 5}`,
                      ]
                    }}
                    transition={{
                      duration: 0.5 + j * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </svg>
            </motion.div>
            );
          })}
        </div>

        {/* Central sun */}
        <motion.div
          className="absolute top-20 right-20"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 3, repeat: Infinity },
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-2xl shadow-orange-300/40" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 opacity-80" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="logo"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ type: "spring", duration: 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-2xl">
                    <polygon
                      points="60,0 120,60 60,75 0,60"
                      fill="#F97316"
                      stroke="#EA580C"
                      strokeWidth="4"
                    />
                    <polygon
                      points="60,0 120,60 60,75 0,60"
                      fill="url(#kiteGradient)"
                      opacity="0.9"
                    />
                    <line x1="60" y1="75" x2="60" y2="140" stroke="#78350F" strokeWidth="4" />
                    
                    {/* Decorative patterns */}
                    <circle cx="60" cy="37" r="10" fill="#FEF3C7" opacity="0.95" />
                    <circle cx="35" cy="45" r="6" fill="#FEF3C7" opacity="0.85" />
                    <circle cx="85" cy="45" r="6" fill="#FEF3C7" opacity="0.85" />
                    <path d="M 40 25 L 50 35 L 40 45" stroke="#FEF3C7" strokeWidth="3" fill="none" opacity="0.8" />
                    <path d="M 80 25 L 70 35 L 80 45" stroke="#FEF3C7" strokeWidth="3" fill="none" opacity="0.8" />
                    
                    <defs>
                      <linearGradient id="kiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="50%" stopColor="#FB923C" />
                        <stop offset="100%" stopColor="#FDBA74" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-7xl font-extrabold text-orange-600 mt-8 drop-shadow-2xl tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Happy Sankranti
                </motion.h1>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="quote"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <motion.p
                  className="text-4xl md:text-5xl font-bold text-orange-700 leading-relaxed drop-shadow-lg tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(249,115,22,0.3)',
                      '0 0 30px rgba(249,115,22,0.5)',
                      '0 0 20px rgba(249,115,22,0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {quotes[Math.floor(Math.random() * quotes.length)]}
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full mx-auto max-w-md"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-2xl text-orange-600 font-semibold tracking-wider"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  From the Eutian Team
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-100/50 to-transparent" />
        
        {/* Sparkle effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
