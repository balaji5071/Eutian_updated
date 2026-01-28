import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}


export default function ServiceCard({ icon: Icon, title, description, onClick }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="h-full group cursor-pointer"
      data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="h-full p-8 glass rounded-[2rem] border border-white/5 group-hover:border-primary/30 transition-all duration-500 relative overflow-hidden flex flex-col items-start gap-6">
        {/* Glow behind icon */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 blur-[48px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 relative z-10">
          <Icon className="h-8 w-8 text-white group-hover:text-primary transition-colors duration-500" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <h3 className="font-heading font-bold text-2xl text-white group-hover:text-primary transition-colors duration-500" data-testid={`text-service-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </h3>
          <p className="text-white/50 leading-relaxed font-light text-base" data-testid={`text-service-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {description}
          </p>
        </div>

        <div className="mt-auto pt-4 relative z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            Learn More
            <span className="text-lg">→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

