import RegionSelector from '../RegionSelector';
import { RegionProvider } from '@/lib/region-context';

export default function RegionSelectorExample() {
  return (
    <RegionProvider>
      <div className="p-8">
        <RegionSelector />
      </div>
    </RegionProvider>
  );
}
