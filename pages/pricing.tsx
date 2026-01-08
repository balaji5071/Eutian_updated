import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PricingCard from '@/components/PricingCard';
import RegionSelector from '@/components/RegionSelector';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useRegion } from '@/lib/region-context';
import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';

export default function Pricing() {
	const { region, currencySymbol } = useRegion();

	const buildPlanHref = (plan: string, priceInr: number, priceGlobal: number, delivery: string, maintenance: string) => {
		const displayPrice = region === 'India' ? priceInr : priceGlobal;
		const formattedPrice = `${currencySymbol}${displayPrice.toLocaleString()}`;
		const detail = `${formattedPrice} • Delivery ${delivery} • Maintenance ${maintenance}`;
		const params = new URLSearchParams({ plan, planDetails: detail });
		return `/contact?${params.toString()}`;
	};

	const maintenanceCoverage = [
		{ plan: 'Express', duration: '6 months', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support'] },
		{ plan: 'Standard', duration: '6 months', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support', 'Content updates'] },
		{ plan: 'Premium', duration: '1 year', includes: ['Bug fixes', 'Minor UI updates', 'Deployment support', 'Content updates', 'Security patches', 'Priority support'] },
		{ plan: 'Student', duration: 'None', includes: ['Full handover', 'Documentation', 'Walkthrough video'] },
	];

	const DISCOUNT = parseFloat(process.env.NEXT_PUBLIC_DISCOUNT_MULTIPLIER || '0.7'); // Configurable via .env
	const applyDiscount = (price: number) => Math.floor(price * DISCOUNT);

	return (
		<div className="flex flex-col bg-mesh min-h-screen">
			<section className="py-32 relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<ScrollReveal>
						<div className="text-center mb-20">
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.8 }}
								className="inline-block px-4 py-1.5 mb-6 rounded-full glass border border-white/10 text-primary text-sm font-bold tracking-widest uppercase"
							>
								Investment Plans
							</motion.div>
							<h1 className="font-heading font-black text-5xl sm:text-7xl text-white mb-6 tracking-tighter" data-testid="text-pricing-title">
								Transparent <span className="text-primary italic">Pricing</span>
							</h1>
							<p className="text-xl text-white/60 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
								Choose the plan that fits your project needs. All plans include production-ready code and responsive design.
							</p>
							<div className="flex justify-center">
								<RegionSelector />
							</div>
						</div>
					</ScrollReveal>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
						<ScrollReveal delay={0.1}>
							<PricingCard
								name="Express"
								price={applyDiscount(5999)}
								originalPrice={5999}
								priceGlobal={applyDiscount(79)}
								originalPriceGlobal={79}
								delivery="24-72 hours"
								features={['3 pages', 'Basic SEO optimization', 'Responsive design', 'Contact form', 'Fast delivery guarantee', 'Mobile-friendly']}
								maintenance="6 months"
								ctaHref={buildPlanHref('Express', applyDiscount(5999), applyDiscount(79), '24-72 hours', '6 months')}
							/>
						</ScrollReveal>
						<ScrollReveal delay={0.2}>
							<PricingCard
								name="Standard"
								price={applyDiscount(14999)}
								originalPrice={14999}
								priceGlobal={applyDiscount(199)}
								originalPriceGlobal={199}
								delivery="3-5 days"
								features={['Up to 8 pages', 'AI Chatbot integration', 'Full SEO optimization', 'CMS integration', 'Priority support', 'Analytics setup']}
								maintenance="6 months"
								highlighted
								ctaHref={buildPlanHref('Standard', applyDiscount(14999), applyDiscount(199), '3-5 days', '6 months')}
							/>
						</ScrollReveal>
						<ScrollReveal delay={0.3}>
							<PricingCard
								name="Premium"
								price={applyDiscount(29999)}
								originalPrice={29999}
								priceGlobal={applyDiscount(399)}
								originalPriceGlobal={399}
								delivery="5-7 days"
								features={['SaaS landing + dashboard', 'Custom features', 'Advanced optimization', 'API integrations', 'User authentication', '1 year maintenance']}
								maintenance="1 year"
								ctaHref={buildPlanHref('Premium', applyDiscount(29999), applyDiscount(399), '5-7 days', '1 year')}
							/>
						</ScrollReveal>
					</div>

					<ScrollReveal>
						<Card className="p-10 glass border-white/10 relative overflow-hidden group mb-32">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
							<div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
								<div className="flex-1">
									<h2 className="font-heading font-black text-4xl sm:text-5xl mb-4 text-white" data-testid="text-capstone-heading">
										Student Capstone — <span className="text-primary italic">Success Guaranteed</span>
									</h2>
									<p className="text-white/60 text-lg font-light leading-relaxed mb-4">
										We build complete capstone project websites in 7 days with clean code, documentation, and a walkthrough video. No maintenance included – full handover.
									</p>
									<p className="text-accent text-base font-semibold italic">
										"Enjoy your holidays, celebrate with family — leave the project worries to us!" 🎓
									</p>
									<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
										{[
											'Clean, well-documented code',
											'Comprehensive project report',
											'Professional walkthrough video',
											'Presentation slides included'
										].map((item) => (
											<li key={item} className="flex items-center gap-3 text-white/70">
												<Check className="h-5 w-5 text-primary shrink-0" />
												<span className="text-sm font-medium">{item}</span>
											</li>
										))}
									</ul>
								</div>
								<div className="text-center md:text-right shrink-0">
									<div className="flex flex-col items-center md:items-end mb-8">
										<p className="text-sm text-white/40 tracking-widest uppercase font-bold mb-2">Delivery: 7 days</p>
										<div className="flex items-center gap-3 mb-2">
											<p className="text-5xl font-heading font-black text-accent drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" data-testid="text-capstone-price">
												₹1,299
											</p>
											<Badge className="bg-accent text-accent-foreground font-black px-3 py-1 text-xs">
												STUDENT SPECIAL
											</Badge>
										</div>
										<p className="text-xl text-white/40 line-through">
											₹1,856
										</p>
									</div>
									<Link href="/contact">
										<Button className="rounded-full bg-white text-black hover:bg-white/90 font-black px-12 h-16 text-lg transition-transform hover:scale-105 shadow-2xl" size="lg" data-testid="button-capstone-cta">
											Book Project
										</Button>
									</Link>
								</div>
							</div>
						</Card>
					</ScrollReveal>

					<ScrollReveal>
						<div className="mb-32">
							<h2 className="font-heading font-black text-4xl sm:text-5xl mb-16 text-center text-white" data-testid="text-maintenance-heading">
								Maintenance Coverage
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
								{maintenanceCoverage.map((item, index) => (
									<ScrollReveal key={item.plan} delay={index * 0.1}>
										<Card className="p-8 glass border-white/10 hover:border-primary/30 transition-all duration-500 h-full flex flex-col">
											<h3 className="font-heading font-black text-2xl mb-2 text-white" data-testid={`text-plan-${item.plan.toLowerCase()}`}>
												{item.plan}
											</h3>
											<p className="text-sm text-white/40 mb-8 font-bold tracking-widest uppercase" data-testid={`text-duration-${item.plan.toLowerCase()}`}>
												{item.duration}
											</p>
											<ul className="space-y-4 flex-1">
												{item.includes.map((feature) => (
													<li key={feature} className="flex items-start gap-3 text-sm text-white/60">
														<Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
														<span className="font-light">{feature}</span>
													</li>
												))}
											</ul>
										</Card>
									</ScrollReveal>
								))}
							</div>
						</div>
					</ScrollReveal>
				</div>
			</section>

			<section className="py-32 container mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollReveal>
					<div className="relative rounded-[3rem] overflow-hidden bg-primary p-20 text-center">
						<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

						<h2 className="font-heading font-black text-4xl sm:text-6xl text-primary-foreground mb-8 relative z-10" data-testid="text-cta-heading">
							Still Have Questions?
						</h2>
						<p className="text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-light relative z-10">
							Contact us for a custom quote tailored to your specific requirements.
						</p>
						<Link href="/contact" className="relative z-10 flex justify-center">
							<Button
								size="lg"
								variant="secondary"
								className="text-xl px-12 h-16 rounded-full font-black shadow-2xl transition-all hover:scale-105 active:scale-95 mx-auto"
								data-testid="button-cta-contact"
							>
								Get in Touch
							</Button>
						</Link>
					</div>
				</ScrollReveal>
			</section>
		</div>
	);
}
