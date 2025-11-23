import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/PricingCard';
import RegionSelector from '@/components/RegionSelector';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function Pricing() {
	const maintenanceCoverage = [
		{ plan: 'Express', duration: '6 months', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support'] },
		{ plan: 'Standard', duration: '6 months', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support', 'Content updates'] },
		{ plan: 'Premium', duration: '1 year', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support', 'Content updates', 'Security patches', 'Priority support'] },
		{ plan: 'Student', duration: 'None', includes: ['Full handover', 'Documentation', 'Walkthrough video'] },
	];

	return (
		<div className="flex flex-col">
			<section className="py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4" data-testid="text-pricing-title">
							Pricing Plans
						</h1>
						<p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
							Choose the plan that fits your project needs. All plans include production-ready code and responsive design.
						</p>
						<div className="flex justify-center">
							<RegionSelector />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						<PricingCard
							name="Express"
							price={5999}
							priceGlobal={79}
							delivery="24-72 hours"
							features={['3 pages', 'Basic SEO optimization', 'Responsive design', 'Contact form', 'Fast delivery guarantee', 'Mobile-friendly']}
							maintenance="6 months"
						/>
						<PricingCard
							name="Standard"
							price={14999}
							priceGlobal={199}
							delivery="3-5 days"
							features={['Up to 8 pages', 'AI Chatbot integration', 'Full SEO optimization', 'CMS integration', 'Priority support', 'Analytics setup']}
							maintenance="6 months"
							highlighted
						/>
						<PricingCard
							name="Premium"
							price={29999}
							priceGlobal={399}
							delivery="5-7 days"
							features={['SaaS landing + dashboard', 'Custom features', 'Advanced optimization', 'API integrations', 'User authentication', '1 year maintenance']}
							maintenance="1 year"
						/>
					</div>

					<Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-12">
						<div className="flex flex-col md:flex-row items-center justify-between gap-6">
							<div className="flex-1">
								<h2 className="font-heading font-bold text-3xl mb-3" data-testid="text-capstone-heading">
									Student Capstone — Impress Your Professors
								</h2>
								<p className="text-muted-foreground text-lg mb-4">
									We build complete capstone project websites in 7 days with clean code, documentation, and a walkthrough video. No maintenance included – full handover.
								</p>
								<ul className="space-y-2">
									<li className="flex items-center gap-2">
										<Check className="h-5 w-5 text-primary" />
										<span>Clean, well-documented code</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-5 w-5 text-primary" />
										<span>Comprehensive project report</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-5 w-5 text-primary" />
										<span>Professional walkthrough video</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-5 w-5 text-primary" />
										<span>Presentation slides included</span>
									</li>
								</ul>
							</div>
							<div className="text-center md:text-right">
								<p className="text-sm text-muted-foreground mb-2">Delivery: 7 days</p>
								<p className="text-4xl font-heading font-bold text-primary mb-4" data-testid="text-capstone-price">
									₹3,499
								</p>
								<Link href="/contact">
									<Button size="lg" data-testid="button-capstone-cta">
										Get Started
									</Button>
								</Link>
							</div>
						</div>
					</Card>

					<div>
						<h2 className="font-heading font-bold text-3xl mb-8 text-center" data-testid="text-maintenance-heading">
							Maintenance Coverage
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{maintenanceCoverage.map((item) => (
								<Card key={item.plan} className="p-6">
									<h3 className="font-heading font-bold text-xl mb-2" data-testid={`text-plan-${item.plan.toLowerCase()}`}>
										{item.plan}
									</h3>
									<p className="text-sm text-muted-foreground mb-4" data-testid={`text-duration-${item.plan.toLowerCase()}`}>
										{item.duration}
									</p>
									<ul className="space-y-2">
										{item.includes.map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-sm">
												<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</Card>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-primary text-primary-foreground">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6" data-testid="text-cta-heading">
						Have Questions About Pricing?
					</h2>
					<p className="text-xl mb-8 opacity-90">
						Contact us for a custom quote tailored to your specific requirements.
					</p>
					<Link href="/contact">
						<Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-contact">
							Contact Us
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
