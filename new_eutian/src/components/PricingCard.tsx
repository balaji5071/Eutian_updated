import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRegion } from '@/lib/region-context';

interface PricingCardProps {
  name: string;
  price: number;
  priceGlobal: number;
  delivery: string;
  features: string[];
  maintenance: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export default function PricingCard({
  name,
  price,
  priceGlobal,
  delivery,
  features,
  maintenance,
  highlighted = false,
  onClick
}: PricingCardProps) {
  const { region, currencySymbol } = useRegion();
  const displayPrice = region === 'India' ? price : priceGlobal;

  return (
    <Card
      className={`p-6 relative hover-elevate transition-all duration-300 ${
        highlighted ? 'border-primary border-2' : ''
      }`}
      data-testid={`card-pricing-${name.toLowerCase()}`}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" data-testid="badge-popular">
          Most Popular
        </Badge>
      )}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-heading font-bold text-2xl mb-2" data-testid={`text-plan-name-${name.toLowerCase()}`}>{name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-heading" data-testid={`text-price-${name.toLowerCase()}`}>
              {currencySymbol}{displayPrice.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2" data-testid={`text-delivery-${name.toLowerCase()}`}>Delivery: {delivery}</p>
        </div>

        <ul className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2" data-testid={`text-feature-${name.toLowerCase()}-${index}`}>
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-4" data-testid={`text-maintenance-${name.toLowerCase()}`}>
            Maintenance: {maintenance}
          </p>
          <Button
            className="w-full"
            variant={highlighted ? 'default' : 'outline'}
            onClick={onClick}
            data-testid={`button-choose-${name.toLowerCase()}`}
          >
            Choose {name}
          </Button>
        </div>
      </div>
    </Card>
  );
}
