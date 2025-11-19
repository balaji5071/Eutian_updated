import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PrototypeCardProps {
  title: string;
  image: string;
  category: string;
  techStack: string[];
  onClick?: () => void;
}

export default function PrototypeCard({ title, image, category, techStack, onClick }: PrototypeCardProps) {
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
        <Badge variant="secondary" className="mb-2" data-testid={`badge-category-${category.toLowerCase()}`}>
          {category}
        </Badge>
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
