import Home from '../Home';
import { RegionProvider } from '@/lib/region-context';

export default function HomeExample() {
  return (
    <RegionProvider>
      <Home />
    </RegionProvider>
  );
}
