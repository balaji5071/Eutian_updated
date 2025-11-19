import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function ServiceCard({ icon: Icon, title, description, onClick }: ServiceCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all duration-300 cursor-pointer" onClick={onClick} data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-xl" data-testid={`text-service-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</h3>
        <p className="text-muted-foreground leading-relaxed" data-testid={`text-service-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>{description}</p>
        <Button variant="ghost" size="sm" className="mt-auto" data-testid={`button-learn-more-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          Learn More →
        </Button>
      </div>
    </Card>
  );
}
