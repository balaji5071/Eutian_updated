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
  const phone = '6302371238';
  // Use digits only for wa.me links, and provide a formatted display string for UI
  const whatsapp = '6302371238';
  const whatsappDisplay = '6302371238';

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
