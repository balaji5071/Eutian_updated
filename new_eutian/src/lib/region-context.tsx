import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Region = 'India' | 'Global';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  currencySymbol: string;
  phone: string;
  whatsapp: string; // digits only for wa.me links
  whatsappDisplay: string; // pretty formatted for UI
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
  const phone = region === 'India' ? '+91 6302371238' : '+1 555 123 4567';
  // Use digits only for wa.me links, and provide a formatted display string for UI
  const whatsapp = region === 'India' ? '916302371238' : '15551234567';
  const whatsappDisplay = region === 'India' ? '+91 63023 71238' : '+1 555 123 4567';

  return (
    <RegionContext.Provider value={{ region, setRegion, currencySymbol, phone, whatsapp, whatsappDisplay }}>
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
