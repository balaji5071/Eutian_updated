import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function WelcomeBoard() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already seen the welcome board this session
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome2026');
        if (!hasSeenWelcome) {
            // Small delay to allow page load before showing
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenWelcome2026', 'true');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Board */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative w-full max-w-lg bg-card border border-primary/50 shadow-[0_0_50px_rgba(255,215,0,0.2)] rounded-2xl p-8 text-center overflow-hidden"
                    >
                        {/* Decorative Ribbons/Confetti (CSS) */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-primary to-red-500"></div>

                        {/* Content */}
                        <div className="relative z-10 space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="text-6xl mb-4"
                            >
                                🎉 2026 🥂
                            </motion.div>

                            <h2 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary drop-shadow-sm">
                                Happy New Year!
                            </h2>

                            <p className="text-lg text-muted-foreground">
                                Welcome to the future. Let's build something amazing together in 2026.
                            </p>

                            <div className="pt-4">
                                <Button
                                    onClick={handleClose}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-primary/50 transition-all font-bold"
                                >
                                    Let's Celebrate! 🚀
                                </Button>
                            </div>
                        </div>

                        {/* Close button absolute */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Background Effects inside card */}
                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
