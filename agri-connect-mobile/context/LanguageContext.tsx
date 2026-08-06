import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageContextType = {
  isTamil: boolean;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  isTamil: false,
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [isTamil, setIsTamil] = useState(false);

  useEffect(() => {
    // Load saved language preference
    AsyncStorage.getItem('isTamil').then(val => {
      if (val !== null) {
        setIsTamil(val === 'true');
      }
    });
  }, []);

  const toggleLanguage = async () => {
    const newValue = !isTamil;
    setIsTamil(newValue);
    await AsyncStorage.setItem('isTamil', String(newValue));
  };

  return (
    <LanguageContext.Provider value={{ isTamil, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
