import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Laptop, Gauge, MessageSquare, Search, GraduationCap, ArrowRight } from 'lucide-react';
import { useRegion } from '@/lib/region-context';
import servicesImage from '@assets/generated_images/Services_background_pattern_dd2fb331.png';

export default function Services() {
  const { currencySymbol } = useRegion();

  const services = [
    {
      icon: Laptop,
      title: 'Website Development',
      description: 'Fast, scalable website development for businesses of all sizes. We build production-ready websites using modern frameworks like React, Next.js, and Vue.js. Our websites are responsive, SEO-optimized, and built for performance.',
      features: ['Responsive design', 'SEO optimization', 'Fast loading times', 'Modern tech stack', 'Cross-browser compatibility'],
      techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
      priceRange: '5,999 - 29,999',
      priceRangeGlobal: '79 - 399',
    },
    {
      icon: Gauge,
      title: 'SaaS Landing Pages & Dashboards',
      description: 'Beautiful, conversion-optimized landing pages and functional dashboards for your SaaS product. We create user-friendly interfaces that engage users and drive conversions with seamless UX/UI design.',
      features: ['Conversion optimization', 'Dashboard UI/UX', 'User authentication', 'Analytics integration', 'Payment integration'],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Chart.js'],
      priceRange: '14,999 - 29,999',
      priceRangeGlobal: '199 - 399',
    },
    {
      icon: MessageSquare,
      title: 'AI Chatbot Integration',
      description: 'Enhance customer engagement with intelligent AI chatbot integrations. We implement conversational UI using cutting-edge AI models to provide 24/7 customer support and improve user experience.',
      features: ['Natural language processing', 'Custom training', 'Multi-platform support', 'Analytics dashboard', '24/7 availability'],
      techStack: ['OpenAI', 'LangChain', 'WebSocket', 'React', 'Express'],
      priceRange: '14,999+',
      priceRangeGlobal: '199+',
    },
    {
      icon: Search,
      title: 'Technical & Content SEO',
      description: 'Comprehensive SEO services to boost your online visibility and organic traffic. We optimize technical aspects, create quality content, and build authoritative backlinks to improve your search rankings.',
      features: ['Keyword research', 'On-page optimization', 'Technical SEO audit', 'Content strategy', 'Link building'],
      techStack: ['Google Analytics', 'Search Console', 'Ahrefs', 'Screaming Frog'],
      priceRange: '9,999+',
      priceRangeGlobal: '129+',
    },
    {
      icon: GraduationCap,
      title: 'Student Capstone Projects',
      description: 'Complete capstone project websites delivered in 7 days with clean code, comprehensive documentation, and a professional walkthrough video. Perfect for impressing professors and securing top grades.',
      features: ['Clean, documented code', 'Project report', 'Walkthrough video', 'Presentation slides', 'Full handover'],
      techStack: ['Custom to requirements', 'Modern frameworks', 'Best practices'],
      priceRange: '3,499',
      priceRangeGlobal: '45',
    },
  ];

  return (
    <div className="flex flex-col">
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 110, 58, 0.9), rgba(10, 110, 58, 0.9)), url(${servicesImage.src})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-6" data-testid="text-services-hero-title">
            Our Services
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Comprehensive web development solutions tailored to your business needs
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="font-heading font-bold text-3xl" data-testid={`text-service-title-${index}`}>
                        {service.title}
                      </h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-testid={`text-service-description-${index}`}>
                      {service.description}
                    </p>
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2" data-testid={`text-feature-${index}-${fIndex}`}>
                            <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Tech Stack:</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.techStack.map((tech, tIndex) => (
                          <Badge key={tIndex} variant="secondary" data-testid={`badge-tech-${index}-${tIndex}`}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                        <p className="text-2xl font-heading font-bold text-primary" data-testid={`text-price-${index}`}>
                          {currencySymbol}
                          {currencySymbol === '₹' ? service.priceRange : service.priceRangeGlobal}
                        </p>
                      </div>
                    </div>
                    <Link href="/contact">
                      <Button size="lg" data-testid={`button-request-quote-${index}`}>
                        Request a Quote
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1">
                    <Card className="p-8 bg-muted/30">
                      <Icon className="h-32 w-32 text-primary/20 mx-auto" />
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-6" data-testid="text-cta-heading">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let's discuss your project and find the perfect solution for your needs.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-contact">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
