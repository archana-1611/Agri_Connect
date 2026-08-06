import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [isTamil, setIsTamil] = useState(() => {
    const saved = localStorage.getItem('isTamil');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isTamil', isTamil);
  }, [isTamil]);

  const toggleLanguage = () => setIsTamil(prev => !prev);

  return (
    <LanguageContext.Provider value={{ isTamil, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
