import { Card } from '@/components/ui/card';
import FounderCard from '@/components/FounderCard';
import { Target, Eye, Globe } from 'lucide-react';
import founder1 from '@assets/generated_images/Founder_profile_photo_1_96bc376f.png';
import founder2 from '@assets/generated_images/Founder_profile_photo_1_96bc376f.png';
import founder3 from '@assets/generated_images/srikar.png';
import founder4 from '@assets/generated_images/Sai.png';

export default function About() {
  const founders = [
    {
      name: 'Balaji',
      role: 'Co-Founder & CEO',
      bio: 'Full-stack developer with 8 years of experience building scalable web applications. Passionate about delivering quality solutions on time.',
      image: founder1.src,
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Jnanesh',
      role: 'Co-Founder & CTO',
      bio: 'Expert in modern web technologies and cloud architecture. Specializes in building high-performance SaaS platforms.',
      image: founder2.src,
      linkedin: 'https://linkedin.com',
    },  
    {  
      name: 'Srikar',
      role: 'Co-Founder & Lead Developer',
      bio: 'Frontend specialist with a passion for creating beautiful, user-friendly interfaces. 6 years in the industry.',
      image: founder3.src,
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Sai Kumar',
      role: 'Co-Founder & Design Lead',
      bio: 'UI/UX designer focused on creating intuitive experiences. Combines aesthetics with functionality.',
      image: founder4.src,
      linkedin: 'https://linkedin.com',
    },
  ];

  const timeline = [
    { year: '2020', event: 'Company Founded', description: 'Started with a mission to make quality web development affordable' },
    { year: '2021', event: '100+ Projects', description: 'Reached milestone of 100 completed projects' },
    { year: '2022', event: 'Student Program', description: 'Launched special capstone project program for students' },
    { year: '2023', event: 'Global Expansion', description: 'Expanded services to international markets' },
    { year: '2024', event: '500+ Clients', description: 'Serving clients across 20+ countries' },
  ];

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-6" data-testid="text-about-title">
            About Eutian
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Building the Intelligent Future — one project at a time
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-2xl mb-4" data-testid="text-mission-heading">
                    Our Mission
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To democratize access to high-quality web development by delivering production-ready solutions at affordable prices with lightning-fast turnaround times.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-2xl mb-4" data-testid="text-vision-heading">
                    Our Vision
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the go-to platform for fast, affordable, and high-quality web development services globally, empowering businesses and students to bring their ideas to life.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-founders-heading">
              Meet Our Founders
            </h2>
            <p className="text-muted-foreground text-lg">
              The team behind Eutian's success
            </p>
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
              Our Journey
            </h2>
            <p className="text-muted-foreground text-lg">
              Key milestones in our growth
            </p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Globe className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="text-global-heading">
              Global Presence
            </h2>
            <p className="text-xl opacity-90 mb-6">
              Serving clients across 20+ countries
            </p>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <p className="text-4xl font-heading font-bold mb-2" data-testid="text-stat-projects">500+</p>
                <p className="text-sm opacity-90">Projects Completed</p>
              </div>
              <div>
                <p className="text-4xl font-heading font-bold mb-2" data-testid="text-stat-clients">300+</p>
                <p className="text-sm opacity-90">Happy Clients</p>
              </div>
              <div>
                <p className="text-4xl font-heading font-bold mb-2" data-testid="text-stat-countries">20+</p>
                <p className="text-sm opacity-90">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
