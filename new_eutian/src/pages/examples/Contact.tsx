import Contact from '../Contact';
import { RegionProvider } from '@/lib/region-context';

export default function ContactExample() {
  return (
    <RegionProvider>
      <Contact />
    </RegionProvider>
  );
}
