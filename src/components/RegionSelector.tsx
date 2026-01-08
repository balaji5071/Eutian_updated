import { useRegion } from '@/lib/region-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function RegionSelector() {
  const { region, setRegion } = useRegion();

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Globe className="h-4 w-4 text-muted-foreground ml-2" />
      <Button
        variant={region === 'India' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setRegion('India')}
        data-testid="button-region-india"
      >
        India
      </Button>
      <Button
        variant={region === 'Global' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setRegion('Global')}
        data-testid="button-region-global"
      >
        Global
      </Button>
    </div>
  );
}
