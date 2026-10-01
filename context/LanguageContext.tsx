'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, ContentMessages, messages } from '@/content/messages';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ContentMessages;
  isModalOpen: boolean;
  openModal: (mode?: 'physical' | 'digital') => void;
  closeModal: () => void;
  modalMode: 'physical' | 'digital';
  setModalMode: (mode: 'physical' | 'digital') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'physical' | 'digital'>('physical');

  useEffect(() => {
    // Check browser locale on mount
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/fr')) {
        setLocale('fr');
      }
    }
  }, []);

  const openModal = (mode: 'physical' | 'digital' = 'physical') => {
    setModalMode(mode);
    setIsModalOpen(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  const t = messages[locale];

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isModalOpen,
        openModal,
        closeModal,
        modalMode,
        setModalMode,
      }}
    >
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
