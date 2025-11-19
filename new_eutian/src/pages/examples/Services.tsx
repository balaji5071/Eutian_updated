import Services from '../Services';
import { RegionProvider } from '@/lib/region-context';

export default function ServicesExample() {
  return (
    <RegionProvider>
      <Services />
    </RegionProvider>
  );
}
