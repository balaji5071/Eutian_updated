import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa';
import founderBalaji from '@assets/generated_images/balaji.png';
import founderSrikar from '@assets/generated_images/srikar.png';

interface Founder {
  name: string;
  role: string;
  bio: string;
  image: any;
  linkedin: string;
  imagePosition?: string;
}

const founders: Founder[] = [
  {
    name: 'Balaji',
    role: 'Founder & CEO',
    bio: 'The mastermind behind Eutian with 1.5+ years of experience in the tech field. Balaji leads system architecture, product vision, and technical strategy to build high-performance digital solutions.',
    image: founderBalaji,
    linkedin: 'https://linkedin.com',
    imagePosition: 'object-top',
  },
  {
    name: 'Srikar',
    role: 'Co-Founder & COO',
    bio: 'Oversees operations, project execution, and client delivery. Srikar excels at turning strategy into reality by managing workflows, timelines, and cross-team coordination to ensure every project ships to perfection.',
    image: founderSrikar,
    linkedin: 'https://linkedin.com',
    imagePosition: 'object-center',
  },
];

export default function FoundersSection() {
  return (
    <section className="py-20 bg-background" data-testid="section-founders">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
            The Team
          </p>
          <h2
            className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4"
            data-testid="text-founders-heading"
          >
            The People Behind Eutian
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            We started with one shared belief: great software comes from people who genuinely care. Here's who we are.
          </p>
        </div>

        {/* Founders Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="h-full"
            >
              <div
                className="h-full bg-card/60 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-primary/5 group"
                data-testid={`founder-card-${founder.name.toLowerCase()}`}
              >
                {/* Circular Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 rounded-full p-1 border-2 border-primary/30 group-hover:border-primary transition-colors duration-300 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      sizes="(max-width: 768px) 112px, 128px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      priority={true}
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="font-heading font-bold text-2xl text-foreground mb-1">
                  {founder.name}
                </h3>
                <p className="text-sm font-semibold text-primary mb-4">
                  {founder.role}
                </p>

                {/* Bio */}
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 flex-1">
                  {founder.bio}
                </p>

                {/* LinkedIn Link */}
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200 mt-auto"
                  aria-label={`${founder.name} LinkedIn`}
                >
                  <FaLinkedin className="w-4 h-4 text-[#0a66c2]" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
