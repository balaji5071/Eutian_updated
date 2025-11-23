import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRegion } from '@/lib/region-context';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { SiWhatsapp } from 'react-icons/si';

const planOptions = ['Express', 'Standard', 'Premium', 'Custom'] as const;

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  whatsapp: z.string().min(7, 'Enter a valid WhatsApp number'),
  websiteType: z.enum(['Landing Page', 'E-Commerce', 'SaaS Dashboard', 'Portfolio', 'Blog', 'Custom']),
  plan: z.enum(planOptions),
  region: z.enum(['India', 'Global']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const { region, phone, whatsapp, whatsappDisplay } = useRegion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      websiteType: 'Landing Page',
      plan: 'Custom',
      region: region,
      message: '',
    },
  });

  // Map prototype category to websiteType enum
  const isValidPlan = (value: string): value is ContactFormValues['plan'] => planOptions.includes(value as ContactFormValues['plan']);

  const mapCategoryToWebsiteType = (cat: string): ContactFormValues['websiteType'] => {
    switch (cat) {
      case 'SaaS':
        return 'SaaS Dashboard';
      case 'E-Commerce':
        return 'E-Commerce';
      case 'Landing Page':
        return 'Landing Page';
      default:
        return 'Custom';
    }
  };

  const mapPlanToWebsiteType = (plan: ContactFormValues['plan']): ContactFormValues['websiteType'] => {
    switch (plan) {
      case 'Express':
        return 'Landing Page';
      case 'Standard':
        return 'E-Commerce';
      case 'Premium':
        return 'SaaS Dashboard';
      default:
        return 'Custom';
    }
  };

  // Auto-fill from query params (prototype, category, desc)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const planDetails = params.get('planDetails');
    if (planParam && isValidPlan(planParam)) {
      form.setValue('plan', planParam);
      form.setValue('websiteType', mapPlanToWebsiteType(planParam));
      const message = `Interested in the ${planParam} plan${planDetails ? ` (${planDetails})` : ''}. Please share next steps.`;
      form.setValue('message', message);
      return;
    }
    const proto = params.get('prototype');
    const category = params.get('category');
    const desc = params.get('desc');
    if (proto || category || desc) {
      if (category) {
        form.setValue('websiteType', mapCategoryToWebsiteType(category));
      }
      const baseMessage = form.getValues('message');
      if (!baseMessage) {
        const composed = `Interested in a similar project: ${proto || ''}${desc ? `. Description: ${desc}` : ''}`.trim();
        // Ensure minimum length for validation; fall back if too short
        form.setValue('message', composed.length >= 10 ? composed : `${composed} Please contact me.`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to submit');
      }

      form.reset();
      setShowSuccess(true);
      toast({
        title: 'Message sent!',
        description: 'We\'ll get back to you within 24 hours.'
      });
    } catch (e: any) {
      toast({
        title: 'Submission failed',
        description: e?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Message Sent ✅</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you! We received your inquiry and will respond within 24 hours. You can submit another message or close this dialog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4" data-testid="text-contact-title">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have a project in mind? Let's discuss how we can help bring your ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <h2 className="font-heading font-bold text-2xl mb-6" data-testid="text-form-heading">
                Send Us a Message
              </h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                      control={form.control}
                                      name="phone"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Phone Number</FormLabel>
                                          <FormControl>
                                            <Input placeholder="e.g. +91 6302371238" {...field} data-testid="input-phone" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="whatsapp"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>WhatsApp Number</FormLabel>
                                          <FormControl>
                                            <Input placeholder="digits only for WhatsApp links" {...field} data-testid="input-whatsapp" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Plan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-plan">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {planOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-website-type">
                              <SelectValue placeholder="Select a website type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Landing Page">Landing Page</SelectItem>
                            <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                            <SelectItem value="SaaS Dashboard">SaaS Dashboard</SelectItem>
                            <SelectItem value="Portfolio">Portfolio</SelectItem>
                            <SelectItem value="Blog">Blog</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-region">
                              <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="India" data-testid="option-india">India</SelectItem>
                            <SelectItem value="Global" data-testid="option-global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your project..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit">
                    {isSubmitting ? 'Sending...' : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>

            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="font-heading font-bold text-2xl mb-6" data-testid="text-contact-info-heading">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a href="mailto:hello@eutian.com" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-email">
                        hello@eutian.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-phone">
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <SiWhatsapp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">WhatsApp</h3>
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-whatsapp"
                      >
                        {whatsappDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office Hours</h3>
                      <p className="text-muted-foreground" data-testid="text-office-hours">
                        24/7
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-muted/30">
                <h3 className="font-heading font-bold text-xl mb-4">Quick Response</h3>
                <p className="text-muted-foreground mb-4">
                  We typically respond to all inquiries within 24 hours. For urgent matters, feel free to reach out via WhatsApp.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" asChild data-testid="button-email">
                    <a href="mailto:hello@eutian.com">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild data-testid="button-whatsapp">
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <SiWhatsapp className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
