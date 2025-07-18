import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MascotContextType {
  showGreeting: boolean;
  setShowGreeting: (show: boolean) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
}

interface MascotProviderProps {
  children: ReactNode;
}

export function MascotProvider({ children }: MascotProviderProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [userName, setUserName] = useState('');

  return (
    <MascotContext.Provider value={{
      showGreeting,
      setShowGreeting,
      isSearching,
      setIsSearching,
      searchLocation,
      setSearchLocation,
      userName,
      setUserName
    }}>
      {children}
    </MascotContext.Provider>
  );
}