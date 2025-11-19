import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Region = 'India' | 'Global';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  currencySymbol: string;
  phone: string;
  whatsapp: string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>('India');

  useEffect(() => {
    const saved = localStorage.getItem('region');
    if (saved === 'India' || saved === 'Global') {
      setRegionState(saved);
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    localStorage.setItem('region', newRegion);
    setRegionState(newRegion);
  };

  const currencySymbol = region === 'India' ? '₹' : '$';
  const phone = region === 'India' ? '+91 98765 43210' : '+1 555 123 4567';
  const whatsapp = region === 'India' ? '+919876543210' : '+15551234567';

  return (
    <RegionContext.Provider value={{ region, setRegion, currencySymbol, phone, whatsapp }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider');
  }
  return context;
}
