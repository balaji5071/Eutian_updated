import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaItem } from '@/shared/schema';

interface PrototypeCardProps {
  title: string;
  media: MediaItem[]; // Changed to support both images and videos
  category: string;
  techStack: string[];
  onClick?: () => void;
}

export default function PrototypeCard({ title, media, category, techStack, onClick }: PrototypeCardProps) {
  // Use first media item as the card thumbnail (prefer image over video)
  const firstImage = media?.find(m => m.type === 'image');
  const thumbnailUrl = firstImage?.url || (media && media.length > 0 ? media[0].url : '/placeholder.png');
  const thumbnailType = firstImage ? 'image' : (media && media.length > 0 ? media[0].type : 'image');
  
  return (
    <Card
      className="overflow-hidden hover-elevate transition-all duration-300 cursor-pointer"
      onClick={onClick}
      data-testid={`card-prototype-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {thumbnailType === 'image' ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <div className="text-6xl">🎥</div>
          </div>
        )}
        {media && media.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {media.length} media items
          </div>
        )}
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
