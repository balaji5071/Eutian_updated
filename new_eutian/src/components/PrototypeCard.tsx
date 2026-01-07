import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PrototypeCardProps {
  title: string;
  image: string;
  category: string;
  techStack: string[];
  websiteUrl?: string;
  onClick?: () => void;
}

export default function PrototypeCard({ title, image, category, techStack, websiteUrl, onClick }: PrototypeCardProps) {
  return (
    <Card
      className="overflow-hidden hover-elevate transition-all duration-300 cursor-pointer"
      onClick={onClick}
      data-testid={`card-prototype-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="secondary" size="sm" className="h-6 text-xs" onClick={(e) => e.stopPropagation()}>
                Visit Site
              </Button>
            </a>
          )}
        </div>
        <h3 className="font-heading font-semibold text-lg mb-3" data-testid={`text-prototype-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          {techStack.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-tech-${tech.toLowerCase()}`}>
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
