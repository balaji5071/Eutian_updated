import Link from 'next/link';
import { Mail, Phone, Linkedin, Instagram, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Services
            </h3>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-websites">Websites</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-saas">SaaS Platforms</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-chatbots">AI Chatbots</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-seo">SEO Services</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-capstone">Student Capstone</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Company
            </h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/prototypes" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-prototypes">Prototypes</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-pricing">Pricing</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-contact">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block" data-testid="link-footer-terms">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Connect
            </h3>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/eutian"
                target="_blank"
                rel="noreferrer"
                className="glass-dark p-3 rounded-full text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300 border border-white/10"
                data-testid="link-social-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/eutian.in"
                target="_blank"
                rel="noreferrer"
                className="glass-dark p-3 rounded-full text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300 border border-white/10"
                data-testid="link-social-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group">
                <Mail className="h-4 w-4 mt-0.5 group-hover:scale-110 transition-transform" />
                <span data-testid="text-footer-email">hello@eutian.com</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group">
                <Phone className="h-4 w-4 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col gap-1">
                  <span data-testid="text-footer-phone">+91 6302371238</span>
                  <span>+91 9515760775</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5" />
                <span data-testid="text-footer-hours">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left" data-testid="text-copyright">
              &copy; {currentYear} <span className="font-semibold text-primary">Eutian</span>. All rights reserved. Building the Intelligent Future.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Made with</span>
              <span className="text-primary animate-pulse">❤️</span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
