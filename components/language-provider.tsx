"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTranslations } from "@/lib/supabase/data";
import { translations as fallbackTranslations } from "@/lib/world-cup-data";

type Language = "en" | "bn";

const translationOverrides: Partial<Record<Language, Record<string, string>>> = {
  en: {
    groups: "Groups",
    fixtures: "Fixtures",
    all: "ALL",
    groupStage: "GROUP STAGE",
    roundOf32: "ROUND OF 32",
    roundOf16: "ROUND OF 16",
    quarterFinals: "QUARTER-FINALS",
    semiFinals: "SEMI-FINALS",
    bronzeFinal: "BRONZE FINAL",
    final: "FINAL",
    matches: "Matches",
    clickNationToViewSquad: "Click a nation to view their squad",
  },
  bn: {
    title: "ফিফহাব ২৬",
    subtitle: "বিশ্বকাপ ২০২৬",
    groups: "গ্রুপ",
    fixtures: "ফিক্সচার",
    all: "সব",
    groupStage: "গ্রুপ পর্ব",
    roundOf32: "৩২ দলের পর্ব",
    roundOf16: "১৬ দলের পর্ব",
    quarterFinals: "কোয়ার্টার-ফাইনাল",
    semiFinals: "সেমি-ফাইনাল",
    bronzeFinal: "ব্রোঞ্জ ফাইনাল",
    final: "ফাইনাল",
    matches: "ম্যাচ",
    clickNationToViewSquad: "স্কোয়াড দেখতে একটি দেশ নির্বাচন করুন",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [translations, setTranslations] = useState(fallbackTranslations);

  useEffect(() => {
    let isMounted = true;

    getTranslations()
      .then((supabaseTranslations) => {
        if (isMounted && Object.keys(supabaseTranslations).length > 0) {
          setTranslations(supabaseTranslations);
        }
      })
      .catch((error) => {
        console.error("Failed to load translations from Supabase:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const t = (key: string): string => {
    const override = translationOverrides[language]?.[key];
    if (override) return override;

    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const languageNames: Record<Language, string> = {
  en: "English",
  bn: "বাংলা",
};
