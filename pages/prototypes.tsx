import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import PrototypeCard from '@/components/PrototypeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Prototypes() {
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedPrototype, setSelectedPrototype] = useState<any>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const categories = ['All', 'SaaS', 'E-Commerce', 'Landing Page', 'AI/ML'];

	const { data: dbPrototypes } = useQuery({
		queryKey: ['prototypes-public'],
		queryFn: async () => {
			const r = await fetch('/api/prototypes');
			const j = await r.json();
			if (!j.ok) throw new Error(j.error || 'Failed to fetch prototypes');
			return j.items as any[];
		},
		staleTime: 60_000,
	});

	// Convert old prototypes with 'image' or 'images' field to new 'media' format
	const prototypes = useMemo(() => {
		return (dbPrototypes ?? []).map(p => {
			// If already has media array, use it
			if (p.media && Array.isArray(p.media) && p.media.length > 0) {
				return p;
			}
			
			// Convert old 'images' array to media
			if (p.images && Array.isArray(p.images) && p.images.length > 0) {
				return {
					...p,
					media: p.images.map((url: string, idx: number) => ({ 
						type: 'image', 
						url, 
						order: idx 
					}))
				};
			}
			
			// Convert old single 'image' to media array
			if (p.image && typeof p.image === 'string') {
				return {
					...p,
					media: [{ type: 'image', url: p.image, order: 0 }]
				};
			}
			
			// No image/media data - return with empty media array
			return { ...p, media: [] };
		});
	}, [dbPrototypes]);

	const filteredPrototypes = useMemo(
		() => (selectedCategory === 'All' ? prototypes : prototypes.filter((p) => p.category === selectedCategory)),
		[selectedCategory, prototypes]
	);

	const handlePrevImage = () => {
		if (selectedPrototype && selectedPrototype.media) {
			setCurrentImageIndex((prev) => 
				prev === 0 ? selectedPrototype.media.length - 1 : prev - 1
			);
		}
	};

	const handleNextImage = () => {
		if (selectedPrototype && selectedPrototype.media) {
			setCurrentImageIndex((prev) => 
				prev === selectedPrototype.media.length - 1 ? 0 : prev + 1
			);
		}
	};

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
									onClick={() => {
										setSelectedPrototype(prototype);
										setCurrentImageIndex(0);
									}} 
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
								<DialogDescription className="sr-only">
									Prototype details including media, description, tech stack and features
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-6">
								{/* Image/Video Carousel */}
								<div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
									{selectedPrototype.media && selectedPrototype.media.length > 0 ? (
										<>
											{selectedPrototype.media[currentImageIndex].type === 'image' ? (
												<img
													src={selectedPrototype.media[currentImageIndex].url}
													alt={`${selectedPrototype.title} - Media ${currentImageIndex + 1}`}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full bg-black flex items-center justify-center">
													{selectedPrototype.media[currentImageIndex].url.includes('youtube.com') || 
													 selectedPrototype.media[currentImageIndex].url.includes('youtu.be') ? (
														<iframe
															src={selectedPrototype.media[currentImageIndex].url.replace('watch?v=', 'embed/')}
															className="w-full h-full"
															allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
															allowFullScreen
														/>
													) : (
														<video
															src={selectedPrototype.media[currentImageIndex].url}
															controls
															preload="metadata"
															className="w-full h-full"
															playsInline
														>
															<source src={selectedPrototype.media[currentImageIndex].url} type="video/mp4" />
															Your browser does not support the video tag.
														</video>
													)}
												</div>
											)}
											
											{/* Navigation Arrows - only show if multiple media items */}
											{selectedPrototype.media.length > 1 && (
												<>
													<button
														onClick={handlePrevImage}
														className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
														aria-label="Previous media"
													>
														<ChevronLeft className="h-6 w-6" />
													</button>
													<button
														onClick={handleNextImage}
														className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
														aria-label="Next media"
													>
														<ChevronRight className="h-6 w-6" />
													</button>
													
													{/* Media Counter */}
													<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full z-10">
														{currentImageIndex + 1} / {selectedPrototype.media.length}
													</div>
												</>
											)}
										</>
									) : (
										<div className="w-full h-full flex items-center justify-center text-muted-foreground">
											No media available
										</div>
									)}
								</div>

								{/* Thumbnail Navigation - only show if multiple media items */}
								{selectedPrototype.media && selectedPrototype.media.length > 1 && (
									<div className="flex gap-2 overflow-x-auto pb-2">
										{selectedPrototype.media.map((item: any, idx: number) => (
											<button
												key={idx}
												onClick={() => setCurrentImageIndex(idx)}
												className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
													idx === currentImageIndex 
														? 'border-primary scale-105' 
														: 'border-transparent hover:border-primary/50'
												}`}
											>
												{item.type === 'image' ? (
													<img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
												) : (
													<div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
														<span className="text-2xl">🎥</span>
													</div>
												)}
											</button>
										))}
									</div>
								)}
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
										href={`/contact?prototype=${encodeURIComponent(selectedPrototype.title)}&category=${encodeURIComponent(selectedPrototype.category)}&desc=${encodeURIComponent(selectedPrototype.description.slice(0, 160))}`}
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
