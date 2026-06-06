"use client";

import * as React from "react";
import { Nation } from "@/lib/world-cup-data";
import { useLanguage } from "./language-provider";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface NationCardProps {
  nation: Nation;
  onClick: () => void;
  index: number;
}

export function NationCard({ nation, onClick, index }: NationCardProps) {
  const { t, language } = useLanguage();

  const getTranslatedCountryName = (nationId: string): string => {
    const translationKey = nationId.replace(/-/g, "");
    const translated = t(translationKey);
    // If in English mode and no translation found, return the original nation.name
    // If in Bangla mode and no translation found, return the original nation.name
    return translated || nation.name;
  };

  const cardStyle: React.CSSProperties = {
    borderColor: nation.jerseyColors.primary,
    backgroundImage: `linear-gradient(140deg, ${nation.jerseyColors.primary}22 0%, ${nation.jerseyColors.secondary}14 35%, ${nation.jerseyColors.accent}10 100%), radial-gradient(circle at top left, ${nation.jerseyColors.primary}10, transparent 38%), radial-gradient(circle at bottom right, ${nation.jerseyColors.accent}08, transparent 42%)`,
    ["--tab-color" as any]: nation.jerseyColors.primary,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
    >
      <Card
        onClick={onClick}
        style={cardStyle}
        className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-border/20 bg-card/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--tab-color)] hover:shadow-[0_24px_90px_-40px_rgba(0,0,0,0.25)]"
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.08),transparent_40%)]" />

        <div className="relative p-5 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/10 shadow-inner">
                <span className="text-3xl">{nation.flag}</span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-[var(--tab-color)] transition-colors">
                  {getTranslatedCountryName(nation.id)}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {nation.confederation}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              {nation.code}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-3xl border border-white/10 bg-white/10 text-lg">
                  <span className="text-foreground">⚽</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{t("squadValue")}</p>
                  <p className="text-sm font-semibold text-foreground">{nation.totalSquadValue}</p>
                </div>
              </div>
              <span className="rounded-full bg-muted/20 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {nation.players.length} {t("players").toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
