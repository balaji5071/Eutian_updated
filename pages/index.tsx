import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ServiceCard from '@/components/ServiceCard';
import PricingCard from '@/components/PricingCard';
import TestimonialCard from '@/components/TestimonialCard';
import RegionSelector from '@/components/RegionSelector';
import SankrantiSplash from '@/components/SankrantiSplash';
import { Laptop, Gauge, MessageSquare, Search, GraduationCap, Check, Zap, DollarSign, Clock } from 'lucide-react';
import heroImage from '@assets/generated_images/background.png';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { useRegion } from '@/lib/region-context';

export default function Home() {
  const services = [
    {
      icon: Laptop,
      title: 'Website Development',
      description: 'Fast, scalable, and production-ready websites built with modern technologies.',
    },
    {
      icon: Gauge,
      title: 'SaaS Platforms',
      description: 'Landing pages and dashboards for your SaaS product with seamless UX.',
    },
    {
      icon: MessageSquare,
      title: 'AI Chatbots',
      description: 'Conversational UI integrations that enhance customer engagement.',
    },
    {
      icon: Search,
      title: 'Technical SEO',
      description: 'Comprehensive SEO services to boost your online visibility.',
    },
    {
      icon: GraduationCap,
      title: 'Student Capstone',
      description: 'Complete capstone project websites with code, docs, and presentation.',
    },
  ];

  const testimonials = [
    {
      quote: 'Eutian delivered our SaaS landing page in just 3 days. The quality was exceptional and the price was unbeatable.',
      name: 'Sarah Johnson',
      company: 'TechStart Inc.',
    },
    {
      quote: 'They built our AI chatbot integration in 48 hours. Professional, fast, and exactly what we needed.',
      name: 'Michael Chen',
      company: 'InnovateLabs',
    },
    {
      quote: 'The student capstone service was perfect. Got my project done with full documentation and a walkthrough video!',
      name: 'Priya Sharma',
      company: 'IIT Delhi',
    },
  ];

  const DISCOUNT = parseFloat(process.env.NEXT_PUBLIC_DISCOUNT_MULTIPLIER || '0.7'); // Configurable via .env
  const applyDiscount = (price: number) => Math.floor(price * DISCOUNT);
  const { region, currencySymbol } = useRegion();

  const buildPlanHref = (plan: string, priceInr: number, priceGlobal: number, delivery: string, maintenance: string) => {
    const displayPrice = region === 'India' ? priceInr : priceGlobal;
    const formattedPrice = `${currencySymbol}${displayPrice.toLocaleString()}`;
    const detail = `${formattedPrice} • Delivery ${delivery} • Maintenance ${maintenance}`;
    const params = new URLSearchParams({ plan, planDetails: detail });
    return `/contact?${params.toString()}`;
  };

  return (
    <>
      <SankrantiSplash />
      <div className="flex flex-col bg-mesh">
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full glass border border-white/10 text-primary text-sm font-bold tracking-widest uppercase"
          >
            Digital Excellence Redefined
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl text-white mb-8 tracking-tighter leading-[1.1]"
            data-testid="text-hero-headline"
          >
            We build <span className="text-primary italic">production-ready</span> <br /> websites — <span className="text-glow">fast</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            data-testid="text-hero-subheadline"
          >
            From landing pages to SaaS dashboards and AI chatbots. Delivered in 24 hours — max 7 days — at up to 50% less than market price.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/contact">
              <Button size="lg" className="text-lg px-10 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105" data-testid="button-hero-quote">
                Get a Custom Quote
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 h-14 rounded-full glass border-white/20 text-white hover:bg-white/10 transition-all hover:scale-105"
                data-testid="button-hero-capstone"
              >
                View Pricing
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass rounded-[3rem] p-12 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              <ScrollReveal delay={0.1}>
                <div data-testid="text-trust-projects" className="py-8 md:py-0">
                  <p className="text-6xl font-heading font-black text-primary mb-2">60+</p>
                  <p className="text-lg text-white/60 tracking-widest uppercase font-bold">Projects Delivered</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div data-testid="text-trust-turnaround" className="py-8 md:py-0">
                  <p className="text-6xl font-heading font-black text-white mb-2">24h-7d</p>
                  <p className="text-lg text-white/60 tracking-widest uppercase font-bold">Turnaround</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div data-testid="text-trust-savings" className="py-8 md:py-0">
                  <p className="text-6xl font-heading font-black text-accent mb-2">50%</p>
                  <p className="text-lg text-white/60 tracking-widest uppercase font-bold">Cost Savings</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="font-heading font-black text-4xl sm:text-6xl mb-6 text-white" data-testid="text-services-heading">
                Our Services
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6 shadow-[0_0_15px_hsla(var(--primary),0.5)]" />
              <p className="text-white/60 text-xl max-w-2xl mx-auto font-light">
                Comprehensive web development solutions tailored to your needs
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <ServiceCard {...service} />
              </ScrollReveal>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
            {services.slice(3).map((service, index) => (
              <ScrollReveal key={index + 3} delay={index * 0.1}>
                <ServiceCard {...service} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link href="/services">
              <Button variant="ghost" size="lg" className="rounded-full border border-white/10 hover:bg-white/5 text-white text-lg px-12 h-14" data-testid="button-view-all-services">
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="font-heading font-black text-4xl sm:text-6xl mb-6 text-white" data-testid="text-pricing-heading">
                Transparent Pricing
              </h2>
              <div className="w-24 h-1.5 bg-accent mx-auto rounded-full mb-6 shadow-[0_0_15px_hsla(var(--accent),0.5)]" />
              <p className="text-white/60 text-xl mb-12 font-light">
                Premium quality, student-friendly rates
              </p>
              <div className="flex justify-center mb-16">
                <RegionSelector />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <PricingCard
              name="Express"
              price={applyDiscount(5999)}
              originalPrice={5999}
              priceGlobal={applyDiscount(79)}
              originalPriceGlobal={79}
              delivery="24-72 hours"
              features={['3 pages', 'Basic SEO', 'Responsive design', 'Contact form', 'Fast delivery']}
              maintenance="6 months"
              ctaHref={buildPlanHref('Express', applyDiscount(5999), applyDiscount(79), '24-72 hours', '6 months')}
            />
            <PricingCard
              name="Standard"
              price={applyDiscount(14999)}
              originalPrice={14999}
              priceGlobal={applyDiscount(199)}
              originalPriceGlobal={199}
              delivery="3-5 days"
              features={['Up to 8 pages', 'AI Chatbot integration', 'Full SEO optimization', 'CMS integration', 'Priority support']}
              maintenance="6 months"
              highlighted
              ctaHref={buildPlanHref('Standard', applyDiscount(14999), applyDiscount(199), '3-5 days', '6 months')}
            />
            <PricingCard
              name="Premium"
              price={applyDiscount(29999)}
              originalPrice={29999}
              priceGlobal={applyDiscount(399)}
              originalPriceGlobal={399}
              delivery="5-7 days"
              features={['SaaS landing + dashboard', 'Custom features', 'Advanced optimization', 'API integrations', '1 year maintenance']}
              maintenance="1 year"
              ctaHref={buildPlanHref('Premium', applyDiscount(29999), applyDiscount(399), '5-7 days', '1 year')}
            />
          </div>

          <ScrollReveal>
            <Card className="p-10 glass border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex-1">
                  <h3 className="font-heading font-black text-3xl sm:text-4xl mb-4 text-white" data-testid="text-capstone-heading">
                    Student Capstone — <span className="text-primary italic">Success Guaranteed</span>
                  </h3>
                  <p className="text-white/60 text-lg font-light leading-relaxed mb-4">
                    Complete capstone project in 7 days with clean code, documentation, and walkthrough video. No maintenance — full handover.
                  </p>
                  <p className="text-accent text-base font-semibold italic">
                    "Enjoy your holidays, celebrate with family — leave the project worries to us!" 🎓
                  </p>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="flex flex-col items-center md:items-end mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-5xl font-heading font-black text-accent drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" data-testid="text-capstone-price">
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
                    <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-10 h-14 transition-transform hover:scale-105" data-testid="button-capstone-cta">Book Now</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <ScrollReveal direction="right">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-block px-4 py-1.5 mb-6 rounded-full glass border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase"
                >
                  Our Advantage
                </motion.div>
                <h2 className="font-heading font-black text-4xl sm:text-6xl mb-12 text-white leading-tight" data-testid="text-features-heading">
                  Why Leading Startups <br /><span className="text-primary italic">Choose Eutian</span>
                </h2>
                <div className="space-y-10">
                  <div className="flex items-start gap-6 group">
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <Zap className="h-8 w-8 text-primary shadow-glow" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-white">Lightning Fast Delivery</h3>
                      <p className="text-white/50 text-lg font-light">
                        Get your project delivered in 24 hours to 7 days. No long wait times.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 group-hover:bg-accent/20 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                      <DollarSign className="h-8 w-8 text-accent shadow-glow" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-white">50% Cost Savings</h3>
                      <p className="text-white/50 text-lg font-light">
                        Premium quality at up to 50% less than market rates. Affordable excellence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      <Check className="h-8 w-8 text-blue-500 shadow-glow" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-white">Production-Ready Code</h3>
                      <p className="text-white/50 text-lg font-light">
                        Scalable, maintainable, and tested code that's ready to deploy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.3}>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src={heroImage.src}
                  alt="Team working"
                  className="rounded-[2rem] shadow-2xl border border-white/10 relative z-10 transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="font-heading font-black text-4xl sm:text-6xl mb-6 text-white" data-testid="text-testimonials-heading">
                Client Success Stories
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6 shadow-[0_0_15px_hsla(var(--primary),0.5)]" />
              <p className="text-white/60 text-xl font-light">
                Trusted by high-growth startups and students worldwide
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <TestimonialCard {...testimonial} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-[3rem] overflow-hidden bg-primary p-20 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <h2 className="font-heading font-black text-4xl sm:text-6xl text-primary-foreground mb-8 relative z-10" data-testid="text-cta-heading">
              Ready to Scale Your <br /> Digital Presence?
            </h2>
            <p className="text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-light relative z-10">
              Get started today and see your ideas come to life in days, not months.
            </p>
            <Link href="/contact" className="relative z-10 flex justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-xl px-12 h-16 rounded-full font-black shadow-2xl transition-all hover:scale-105 active:scale-95 mx-auto"
                data-testid="button-cta-contact"
              >
                Let&apos;s Build Together
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
      </div>
    </>
  );
}
