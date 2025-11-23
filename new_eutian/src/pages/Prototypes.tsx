import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import PrototypeCard from '@/components/PrototypeCard';

export default function Prototypes() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrototype, setSelectedPrototype] = useState<any>(null);

  const categories = ['All', 'SaaS', 'E-Commerce', 'Landing Page', 'AI/ML'];

  const { data: dbPrototypes } = useQuery({
    queryKey: ['prototypes-public'],
    queryFn: async () => {
      const r = await fetch('/api/prototypes');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to fetch prototypes');
      // Map to the same shape as card expects
      return (j.items as any[]).map(p => ({
        title: p.title,
        image: p.image,
        category: p.category,
        description: p.description,
        techStack: p.techStack || [],
        features: p.features || [],
      }));
    },
    staleTime: 60_000,
  });

  const prototypes = dbPrototypes ?? [];

  const filteredPrototypes = useMemo(() => (
    selectedCategory === 'All' ? prototypes : prototypes.filter(p => p.category === selectedCategory)
  ), [selectedCategory, prototypes]);

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4" data-testid="text-prototypes-title">
              Our Prototypes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our portfolio of successful projects and see what we can build for you
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-filter-${category.toLowerCase().replace(/\//g, '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrototypes.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground" data-testid="text-prototypes-empty">
                No prototypes available yet. Check back soon.
              </div>
            ) : (
              filteredPrototypes.map((prototype, index) => (
                <PrototypeCard
                  key={index}
                  {...prototype}
                  onClick={() => setSelectedPrototype(prototype)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedPrototype} onOpenChange={() => setSelectedPrototype(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPrototype && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl" data-testid="text-modal-title">
                  {selectedPrototype.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                  <img
                    src={selectedPrototype.image}
                    alt={selectedPrototype.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground" data-testid="text-modal-description">
                    {selectedPrototype.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrototype.techStack.map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPrototype.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4 pt-4">
                  <Link
                    href={`/contact?prototype=${encodeURIComponent(selectedPrototype.title)}&category=${encodeURIComponent(selectedPrototype.category)}&desc=${encodeURIComponent(selectedPrototype.description.slice(0,160))}`}
                    onClick={() => setSelectedPrototype(null)}
                    data-testid="link-modal-contact"
                    className="flex-1"
                  >
                    <Button className="w-full" data-testid="button-modal-contact">
                      Contact Us for Similar Project
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
