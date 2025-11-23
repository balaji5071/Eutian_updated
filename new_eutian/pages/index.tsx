import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ServiceCard from '@/components/ServiceCard';
import PricingCard from '@/components/PricingCard';
import TestimonialCard from '@/components/TestimonialCard';
import RegionSelector from '@/components/RegionSelector';
import { Laptop, Gauge, MessageSquare, Search, GraduationCap, Check, Zap, DollarSign, Clock } from 'lucide-react';
import heroImage from '@assets/generated_images/background.png';

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

  return (
    <div className="flex flex-col">
      <section
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(3, 39, 19, 0.7), rgba(3, 39, 19, 0.7)), url(${heroImage.src})`,
        }}
      > 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1
            className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
            data-testid="text-hero-headline"
          >
            We build production-ready websites — fast, scalable, and affordable.
          </h1>
          <p
            className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            data-testid="text-hero-subheadline"
          >
            From landing pages to SaaS dashboards and AI chatbots. Delivered in 24 hours — max 7 days — at up to 50% less than market price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact">
              <Button size="lg" className="text-lg px-8" data-testid="button-hero-quote">
                Get a Quote
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-hero-capstone"
              >
                View Capstone Offer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-around items-center gap-8 text-center">
            <div data-testid="text-trust-projects">
              <p className="text-3xl font-heading font-bold">500+</p>
              <p className="text-sm opacity-90">Projects Delivered</p>
            </div>
            <div data-testid="text-trust-turnaround">
              <p className="text-3xl font-heading font-bold">24hr-7day</p>
              <p className="text-sm opacity-90">Turnaround</p>
            </div>
            <div data-testid="text-trust-savings">
              <p className="text-3xl font-heading font-bold">50%</p>
              <p className="text-sm opacity-90">Cost Savings</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-services-heading">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive web development solutions tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
            {services.slice(3).map((service, index) => (
              <ServiceCard key={index + 3} {...service} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" size="lg" data-testid="button-view-all-services">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-pricing-heading">
              Pricing Plans
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Choose the plan that fits your project needs
            </p>
            <div className="flex justify-center">
              <RegionSelector />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <PricingCard
              name="Express"
              price={5999}
              priceGlobal={79}
              delivery="24-72 hours"
              features={['3 pages', 'Basic SEO', 'Responsive design', 'Contact form', 'Fast delivery']}
              maintenance="6 months"
            />
            <PricingCard
              name="Standard"
              price={14999}
              priceGlobal={199}
              delivery="3-5 days"
              features={['Up to 8 pages', 'AI Chatbot integration', 'Full SEO optimization', 'CMS integration', 'Priority support']}
              maintenance="6 months"
              highlighted
            />
            <PricingCard
              name="Premium"
              price={29999}
              priceGlobal={399}
              delivery="5-7 days"
              features={['SaaS landing + dashboard', 'Custom features', 'Advanced optimization', 'API integrations', '1 year maintenance']}
              maintenance="1 year"
            />
          </div>
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-2xl mb-2" data-testid="text-capstone-heading">
                  Student Capstone — Impress Your Professors
                </h3>
                <p className="text-muted-foreground">
                  Complete capstone project in 7 days with clean code, documentation, and walkthrough video. No maintenance — full handover.
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-heading font-bold text-primary mb-2" data-testid="text-capstone-price">
                  ₹3,499
                </p>
                <Link href="/contact">
                  <Button data-testid="button-capstone-cta">Get Started</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6" data-testid="text-features-heading">
                Why Choose Eutian?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xl mb-2">Lightning Fast Delivery</h3>
                    <p className="text-muted-foreground">
                      Get your project delivered in 24 hours to 7 days. No long wait times.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xl mb-2">50% Cost Savings</h3>
                    <p className="text-muted-foreground">
                      Premium quality at up to 50% less than market rates. Affordable excellence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xl mb-2">Production-Ready Code</h3>
                    <p className="text-muted-foreground">
                      Scalable, maintainable, and tested code that's ready to deploy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage.src}
                alt="Team working"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-testimonials-heading">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Trusted by startups and students worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6" data-testid="text-cta-heading">
            Ready to Build Your Project?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get started today and see your ideas come to life in days, not months.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              data-testid="button-cta-contact"
            >
              Contact Us Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
