'use client';

import { useState, useEffect } from 'react';

export default function ValentinesDaySplash() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messages = [
    "💖 Spread Love, Build Dreams - Your Perfect Website Awaits! 💖",
    "✨ This Valentine's, Fall in Love with Stunning Web Design! ✨",
    "💝 We're Passionately Crafting Digital Magic Just for You! 💝",
    "🌹 Love at First Click - Amazing Websites, Amazing You! 🌹"
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShow(false), 1000);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 20%, #FFD6E0 40%, #FFC0CB 60%, #FFB6C1 80%, #FFF0F5 100%)',
        animation: 'gradientShift 6s ease infinite',
      }}
    >
      {/* Animated hearts with varied emotions */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-hearts"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            fontSize: `${20 + Math.random() * 30}px`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        >
          {['💕', '💖', '💗', '💝', '💘', '❤️', '💓'][Math.floor(Math.random() * 7)]}
        </div>
      ))}

      {/* Center message with enhanced animations */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-8 animate-bounce-gentle">
            <span className="text-8xl sm:text-9xl drop-shadow-2xl animate-pulse-heart">💝</span>
            <span className="text-6xl sm:text-7xl drop-shadow-xl animate-float-gentle ml-4">✨</span>
          </div>
          <h1 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl mb-8 tracking-tight animate-slide-up" style={{
            background: 'linear-gradient(135deg, #FF1493, #FF69B4, #FFB6C1, #FFC0CB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 4px 8px rgba(255, 20, 147, 0.4))',
            animation: 'colorShift 4s ease infinite',
          }}>
            💕 Happy Valentine's Day! 💕
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-700 mb-4 animate-fade-in-up" style={{
            textShadow: '0 2px 8px rgba(255, 105, 180, 0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}>
            {messages[Math.floor(Math.random() * messages.length)]}
          </p>
          <div className="flex justify-center gap-4 mt-8 animate-fade-in-up-delay">
            <span className="text-5xl animate-bounce-slow">💖</span>
            <span className="text-5xl animate-bounce-medium">💗</span>
            <span className="text-5xl animate-bounce-fast">💓</span>
          </div>
        </div>
      </div>

      {/* Floating particles with glow effect */}
      {[...Array(40)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${6 + Math.random() * 12}px`,
            height: `${6 + Math.random() * 12}px`,
            background: `radial-gradient(circle, rgba(255, 182, 193, 0.6), rgba(255, 192, 203, 0.3))`,
            boxShadow: '0 0 20px rgba(255, 105, 180, 0.5)',
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
          }}
        />
      ))}

      {/* Sparkle effects */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-3xl animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        >
          ✨
        </div>
      ))}

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes colorShift {
          0%, 100% {
            filter: drop-shadow(0 4px 8px rgba(255, 20, 147, 0.4)) brightness(1);
          }
          50% {
            filter: drop-shadow(0 6px 12px rgba(255, 105, 180, 0.6)) brightness(1.2);
          }
        }

        @keyframes float-hearts {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes pulse-heart {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(1.05);
          }
          75% {
            transform: scale(1.2);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(20deg);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(60px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up-delay {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce-medium {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25px);
          }
        }

        @keyframes bounce-fast {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.3);
            opacity: 0.9;
          }
          50% {
            transform: translate(${Math.random() * 80 - 40}px, ${Math.random() * 80 - 40}px) scale(1.1);
            opacity: 0.7;
          }
          75% {
            transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.4);
            opacity: 0.8;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
          }
        }

        .animate-float-hearts {
          animation: float-hearts linear infinite;
        }

        .animate-pulse-heart {
          animation: pulse-heart 1.5s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1.2s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up-delay 1.5s ease-out forwards;
          animation-delay: 1s;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
          animation-delay: 0s;
        }

        .animate-bounce-medium {
          animation: bounce-medium 2s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        .animate-bounce-fast {
          animation: bounce-fast 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        .animate-float-particle {
          animation: float-particle ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
