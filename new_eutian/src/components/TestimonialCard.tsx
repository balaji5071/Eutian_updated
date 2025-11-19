import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TestimonialCardProps {
  quote: string;
  name: string;
  company: string;
  avatar?: string;
}

export default function TestimonialCard({ quote, name, company, avatar }: TestimonialCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="p-6 hover-elevate transition-all duration-300" data-testid={`card-testimonial-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground italic leading-relaxed" data-testid={`text-quote-${name.toLowerCase().replace(/\s+/g, '-')}`}>
          "{quote}"
        </p>
        <div className="flex items-center gap-3 mt-auto">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold" data-testid={`text-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>{name}</p>
            <p className="text-sm text-muted-foreground" data-testid={`text-company-${name.toLowerCase().replace(/\s+/g, '-')}`}>{company}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
