import PricingCard from '../PricingCard';
import { RegionProvider } from '@/lib/region-context';

export default function PricingCardExample() {
  return (
    <RegionProvider>
      <div className="p-8">
        <PricingCard
          name="Express"
          price={5999}
          priceGlobal={79}
          delivery="24-72 hours"
          features={[
            '3 pages',
            'Basic SEO',
            'Responsive design',
            'Contact form',
            'Fast delivery'
          ]}
          maintenance="6 months"
          onClick={() => console.log('Express plan selected')}
        />
      </div>
    </RegionProvider>
  );
}
