import Link from 'next/link';
import { Shield, Lock, Globe, FileWarning, RefreshCcw } from 'lucide-react';

const updatedDate = '23 November 2025';
const rolexGreen = '#00512c';

const collectedData = [
  'Name, email, phone number',
  'Business information',
  'Messages or inquiries',
  'Website usage data (analytics)',
];

const usageReasons = [
  'Provide and improve our services',
  'Respond to inquiries',
  'Communicate project updates',
  'Send invoices or payment links',
  'Improve website experience via analytics',
];

const protectionMeasures = [
  'Encrypted communication',
  'Secure storage',
  'Limited access',
  'Regular security audits',
];

const sharingList = [
  'Trusted third-party tools (e.g., hosting, analytics, payment providers)',
  'Legal authorities if required by law',
];

const rightsList = [
  'Request access to your stored data',
  'Ask for corrections',
  'Request deletion (unless required for legal purposes)',
];

export default function PrivacyContent() {
  return (
    <div className="flex flex-col">
      <section
        className="py-20 text-white"
        style={{ backgroundColor: rolexGreen }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm bg-white/10 inline-block px-4 py-1 rounded-full mb-4" data-testid="text-privacy-updated">
            Last Updated: {updatedDate}
          </p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4" data-testid="text-privacy-title">
            EUTIAN — Privacy Policy
          </h1>
          <p className="text-lg opacity-90">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Shield className="h-6 w-6" color={rolexGreen} />
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We only collect information that helps us deliver effective services. We may gather the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {collectedData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">We do not collect unnecessary personal data.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Shield className="h-6 w-6" color={rolexGreen} />
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground">Your data is used to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {usageReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">We never sell your personal information.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Globe className="h-6 w-6" color={rolexGreen} />
              3. Cookies & Tracking
            </h2>
            <p className="text-muted-foreground">We may use cookies to support analytics, enhance the user experience, and improve website performance. You can disable cookies anytime via your browser settings.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Lock className="h-6 w-6" color={rolexGreen} />
              4. Data Protection
            </h2>
            <p className="text-muted-foreground">We take strong steps to safeguard your information:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {protectionMeasures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">However, no system is 100% secure.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <FileWarning className="h-6 w-6" color={rolexGreen} />
              5. Sharing of Information
            </h2>
            <p className="text-muted-foreground">We only share data with the following when necessary:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {sharingList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">We never sell or rent your information.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Shield className="h-6 w-6" color={rolexGreen} />
              6. Your Rights
            </h2>
            <p className="text-muted-foreground">You may exercise the following rights at any time:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {rightsList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Globe className="h-6 w-6" color={rolexGreen} />
              7. Third-Party Links
            </h2>
            <p className="text-muted-foreground">Our site may link to external websites. Eutian is not responsible for the content or privacy practices of those sites.</p>
          </article>

          <article className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <RefreshCcw className="h-6 w-6" color={rolexGreen} />
              8. Updates to This Policy
            </h2>
            <p className="text-muted-foreground">We may update this Privacy Policy periodically. Updates will appear on this page with a new “Last Updated” date.</p>
          </article>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#f0f7f2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="font-heading text-3xl font-bold" style={{ color: rolexGreen }}>
            Need to talk about your data?
          </h2>
          <p className="text-muted-foreground">Reach out any time with questions about privacy or data handling.</p>
          <Link href="/contact" className="inline-flex">
            <span
              className="px-6 py-3 rounded-md font-medium text-white"
              style={{ backgroundColor: rolexGreen }}
              data-testid="button-privacy-contact"
            >
              Contact Eutian
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
