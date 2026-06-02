"use client";

import { useLanguage } from "./language-provider";
import { LanguageSelector } from "./language-selector";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="relative z-10 border-b border-border/30 bg-card/60 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-3 h-8 rounded-full bg-wc-green" />
                <div className="w-3 h-8 rounded-full bg-wc-blue" />
                <div className="w-3 h-8 rounded-full bg-wc-red" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  {t("title")}
                </h1>
                <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Host Countries */}
            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium">{t("hosted")}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-wc-green" />
                  {t("mexico")}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-wc-blue" />
                  {t("usa")}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-wc-red" />
                  {t("canada")}
                </span>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
