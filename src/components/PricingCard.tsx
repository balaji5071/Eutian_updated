import Link from 'next/link';
import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRegion } from '@/lib/region-context';
import { motion } from 'framer-motion';

interface PricingCardProps {
  name: string;
  price: number;
  priceGlobal: number;
  delivery: string;
  features: string[];
  maintenance: string;
  highlighted?: boolean;
  onClick?: () => void;
  ctaHref?: string;
  originalPrice?: number;
  originalPriceGlobal?: number;
}

export default function PricingCard({
  name,
  price,
  priceGlobal,
  delivery,
  features,
  maintenance,
  highlighted = false,
  onClick,
  ctaHref,
  originalPrice,
  originalPriceGlobal
}: PricingCardProps) {
  const { region, currencySymbol } = useRegion();
  const displayPrice = region === 'India' ? price : priceGlobal;
  const displayOriginalPrice = region === 'India' ? originalPrice : originalPriceGlobal;

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      style={{
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`p-8 rounded-[2rem] relative transition-all duration-300 glass border border-white/10 ${highlighted ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(16,185,129,0.2)]' : ''
          }`}
        data-testid={`card-pricing-${name.toLowerCase()}`}
      >
        {highlighted && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-black px-4 py-1.5 shadow-xl" data-testid="badge-popular">
            RECOMMENDED
          </Badge>
        )}
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-heading font-black text-3xl mb-4 text-white" data-testid={`text-plan-name-${name.toLowerCase()}`}>{name}</h3>
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-5xl font-black font-heading text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" data-testid={`text-price-${name.toLowerCase()}`}>
                {currencySymbol}{displayPrice.toLocaleString()}
              </span>
              {displayOriginalPrice && (
                <div className="flex flex-col">
                  <span className="text-sm text-white/40 line-through">
                    {currencySymbol}{displayOriginalPrice.toLocaleString()}
                  </span>
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] py-0 h-4 px-2">
                    30% OFF
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-sm text-white/50 mt-4 font-medium tracking-wide" data-testid={`text-delivery-${name.toLowerCase()}`}>DELIVERY: {delivery}</p>
          </div>

          <ul className="space-y-4 flex-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3" data-testid={`text-feature-${name.toLowerCase()}-${index}`}>
                <div className="mt-1 p-0.5 rounded-full bg-primary/20">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-white/70 font-light">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="pt-6 border-t border-white/5">
            <p className="text-sm text-white/50 mb-6 flex items-center gap-2" data-testid={`text-maintenance-${name.toLowerCase()}`}>
              <Clock className="h-4 w-4 text-primary/60" />
              Maintenance: {maintenance}
            </p>
            <Button
              className={`w-full h-14 rounded-full font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95 ${highlighted
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              onClick={ctaHref ? undefined : onClick}
              asChild={Boolean(ctaHref)}
              data-testid={`button-choose-${name.toLowerCase()}`}
            >
              {ctaHref ? (
                <Link href={ctaHref}>Get Started with {name}</Link>
              ) : (
                <>Get Started with {name}</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
