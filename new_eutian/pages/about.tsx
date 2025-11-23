import { Card as UiCard } from '@/components/ui/card';
import FounderCard from '@/components/FounderCard';
import { Target, Eye, Globe } from 'lucide-react';
import founder1 from '@assets/generated_images/Founder_profile_photo_1_96bc376f.png';
import founder2 from '@assets/generated_images/Founder_profile_photo_3_89eaa0d1.png';
import founder3 from '@assets/generated_images/srikar.png';
import founder4 from '@assets/generated_images/Sai.png';

export default function About() {
	const founders = [
		{
			name: 'Balaji',
			role: 'Founder & Chief Executive Officer (CEO)',
			bio: 'Sets company vision and strategy, leads external partnerships, and ensures Eutian stays aligned with its mission to build intelligent digital solutions.',
			image: founder1.src,
			linkedin: 'https://linkedin.com',
			ownership: '25%',
		},
		{
			name: 'Srikar',
			role: 'Co-Founder & Chief Operating Officer (COO)',
			bio: 'Manages day-to-day operations, project execution, and cross-team coordination to ensure timely delivery and quality standards.',
			image: founder3.src,
			linkedin: 'https://linkedin.com',
			ownership: '25%',
		},
		{
			name: 'Jnanesh',
			role: 'Co-Founder & Chief Financial & Media Officer (CFMO)',
			bio: 'Oversees financial health (budgeting, accounting) and leads media & brand strategy to shape Eutian’s public image and communications.',
			image: founder2.src,
			linkedin: 'https://linkedin.com',
			ownership: '25%',
		},
		{
			name: 'Sai Kumar',
			role: 'Co-Founder & Chief Marketing Officer (CMO)',
			bio: 'Leads marketing, growth, and client acquisition—designing campaigns and partnerships to increase visibility and bring on new customers.',
			image: founder4.src,
			linkedin: 'https://linkedin.com',
			ownership: '25%',
		},
	];

	const timeline = [
		{
			year: '2025',
			event: 'Eutian Founded',
			description: 'A group of four students came together with one vision — to build fast, affordable, production-ready websites.',
		},
		{
			year: '2025',
			event: 'First Projects',
			description: 'Delivered our first client projects and refined our workflow.',
		},
		{
			year: '2025',
			event: 'Pilot Capstone Program',
			description: 'Started helping students with real project websites and documentation.',
		},
		{
			year: '2025',
			event: 'Early Growth',
			description: 'Focusing on building trust, quality, and strong foundations.',
		},
	];

	return (
		<div className="flex flex-col">
			<section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-sm bg-primary/20 inline-block px-4 py-1 rounded-full mb-4">
						🚀 We just started our journey
					</p>
					<h1 className="font-heading font-bold text-4xl sm:text-5xl mb-6" data-testid="text-about-title">
						About Eutian
					</h1>
					<p className="text-xl opacity-90 max-w-3xl mx-auto">
						A brand-new startup building the Intelligent Future — one project at a time.
					</p>
				</div>
			</section>

			<section className="py-20 bg-background">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
						<UiCard className="p-8">
							<div className="flex items-start gap-4">
								<div className="p-3 bg-primary/10 rounded-lg">
									<Target className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h2 className="font-heading font-bold text-2xl mb-4" data-testid="text-mission-heading">
										Our Mission
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										To help students, startups, and small businesses bring their ideas online quickly with affordable, production-ready solutions.
									</p>
								</div>
							</div>
						</UiCard>

						<UiCard className="p-8">
							<div className="flex items-start gap-4">
								<div className="p-3 bg-primary/10 rounded-lg">
									<Eye className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h2 className="font-heading font-bold text-2xl mb-4" data-testid="text-vision-heading">
										Our Vision
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										To grow into a trusted development partner for early-stage innovators — helping them ship faster, smarter, and better.
									</p>
								</div>
							</div>
						</UiCard>
					</div>
				</div>
			</section>

			<section className="py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-founders-heading">
							Meet Our Founders
						</h2>
						<p className="text-muted-foreground text-lg">Four people. One vision. A new beginning.</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{founders.map((founder, index) => (
							<FounderCard key={index} {...founder} />
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-background">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-timeline-heading">
							Our Journey Begins
						</h2>
						<p className="text-muted-foreground text-lg">Every big company starts small — this is our first step.</p>
					</div>
					<div className="space-y-8">
						{timeline.map((item, index) => (
							<div key={index} className="flex gap-6 items-start" data-testid={`timeline-item-${index}`}>
								<div className="flex-shrink-0 w-24">
									<div className="font-heading font-bold text-2xl text-primary" data-testid={`text-year-${index}`}>
										{item.year}
									</div>
								</div>
								<div className="flex-1 pb-8 border-l-2 border-primary/20 pl-6 relative">
									<div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
									<h3 className="font-heading font-semibold text-xl mb-2" data-testid={`text-event-${index}`}>
										{item.event}
									</h3>
									<p className="text-muted-foreground" data-testid={`text-event-description-${index}`}>
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-primary text-primary-foreground">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<Globe className="h-16 w-16 mx-auto mb-6 opacity-90" />
					<h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">A Global Vision — Early Steps</h2>
					<p className="text-xl opacity-90 mb-6 max-w-xl mx-auto">
						We are just getting started. Our focus now is learning, building trust, and delivering quality.
					</p>
					<div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
						<div>
							<p className="text-3xl font-heading font-bold">Starting</p>
							<p className="text-sm opacity-90">First Clients</p>
						</div>
						<div>
							<p className="text-3xl font-heading font-bold">2025</p>
							<p className="text-sm opacity-90">Year Founded</p>
						</div>
						<div>
							<p className="text-3xl font-heading font-bold">Growing</p>
							<p className="text-sm opacity-90">Step by Step</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
