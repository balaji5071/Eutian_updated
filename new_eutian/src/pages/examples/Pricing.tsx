import Pricing from '../Pricing';
import { RegionProvider } from '@/lib/region-context';

export default function PricingExample() {
  return (
    <RegionProvider>
      <Pricing />
    </RegionProvider>
  );
}
