import Link from 'next/link';
import { ShieldCheck, Scale, RefreshCcw, FileText } from 'lucide-react';

const updatedDate = '23 November 2025';
const rolexGreen = '#00512c';

const servicesProvided = [
  'Web development services',
  'AI-powered software solutions',
  'Deployment and hosting assistance',
  'Technology consulting',
];

const userResponsibilities = [
  'Provide accurate, timely information',
  'Refrain from misusing, hacking, or abusing Eutian systems',
  'Avoid using Eutian services for illegal purposes',
  'Respect intellectual property rights at all times',
];

const paymentPolicies = [
  'All pricing is communicated clearly before any project begins',
  'Payments must be completed according to the agreed milestone or schedule',
  'Refunds are only issued for work not yet started or in special cases approved by Eutian',
];

const liabilityLimitations = [
  'Loss of data',
  'Downtime caused by third-party services',
  'Damages resulting from client misuse',
  'Security breaches caused by client-side issues',
];

const terminationReasons = [
  'Violation of these Terms',
  'Failed or overdue payments',
  'Detection of fraudulent, abusive, or malicious activity',
];

export default function TermsContent() {
  return (
    <div className="flex flex-col">
      <section
        className="py-20 text-white"
        style={{ backgroundColor: rolexGreen }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm bg-white/10 inline-block px-4 py-1 rounded-full mb-4" data-testid="text-terms-updated">
            Last Updated: {updatedDate}
          </p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4" data-testid="text-terms-title">
            EUTIAN — Terms & Conditions
          </h1>
          <p className="text-lg opacity-90">
            By accessing or using our website, products, or services, you agree to the Terms & Conditions outlined below.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" color={rolexGreen} />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By using Eutian’s website or services, you agree to comply with and be legally bound by these Terms. If you do not agree, you must discontinue use immediately.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <FileText className="h-6 w-6" color={rolexGreen} />
              2. Services Provided
            </h2>
            <p className="text-muted-foreground">Eutian offers the following services (subject to change or expansion):</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {servicesProvided.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" color={rolexGreen} />
              3. User Responsibilities
            </h2>
            <p className="text-muted-foreground">Clients and users agree to the following responsibilities:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {userResponsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Scale className="h-6 w-6" color={rolexGreen} />
              4. Payments & Billing
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {paymentPolicies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" color={rolexGreen} />
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, designs, code, and materials created by Eutian remain Eutian’s intellectual property unless otherwise agreed in writing. Clients receive the rights to the final delivered project after full payment is received.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" color={rolexGreen} />
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">Eutian is not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {liabilityLimitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Eutian’s total liability will not exceed the amount paid for the service.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" color={rolexGreen} />
              7. Termination
            </h2>
            <p className="text-muted-foreground">We may suspend or terminate services if any of the following occurs:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {terminationReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <RefreshCcw className="h-6 w-6" color={rolexGreen} />
              8. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Eutian may update these Terms at any time. Updates will be posted on this page with a new “Last Updated” date. Continued use of our services after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </article>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#f0f7f2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="font-heading text-3xl font-bold" style={{ color: rolexGreen }}>
            Questions about these Terms?
          </h2>
          <p className="text-muted-foreground">
            We’re here to help clarify anything before you start a project.
          </p>
          <Link href="/contact" className="inline-flex">
            <span
              className="px-6 py-3 rounded-md font-medium text-white"
              style={{ backgroundColor: rolexGreen }}
              data-testid="button-terms-contact"
            >
              Contact the Eutian team
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
