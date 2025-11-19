import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin } from 'lucide-react';

interface FounderCardProps {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
}

export default function FounderCard({ name, role, bio, image, linkedin }: FounderCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="p-6 hover-elevate transition-all duration-300" data-testid={`card-founder-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-heading font-semibold text-xl mb-1" data-testid={`text-founder-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>{name}</h3>
          <p className="text-sm text-primary font-medium mb-3" data-testid={`text-founder-role-${name.toLowerCase().replace(/\s+/g, '-')}`}>{role}</p>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-founder-bio-${name.toLowerCase().replace(/\s+/g, '-')}`}>{bio}</p>
        </div>
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid={`link-linkedin-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
      </div>
    </Card>
  );
}
