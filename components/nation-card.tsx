"use client";

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
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
    >
      <Card
        onClick={onClick}
        className="group cursor-pointer overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      >
        <div className="relative">
          {/* Color bar based on jersey */}
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: nation.jerseyColors.primary }}
          />
          
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Flag and Name */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{nation.flag}</span>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {nation.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {nation.confederation}
                  </p>
                </div>
              </div>

              {/* Squad Value */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("squadValue")}</p>
                <p className="font-bold text-foreground">{nation.totalSquadValue}</p>
              </div>
            </div>

            {/* Jersey Color Preview */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: nation.jerseyColors.primary }}
                  title="Primary"
                />
                <div
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: nation.jerseyColors.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: nation.jerseyColors.accent }}
                  title="Accent"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {nation.players.length} {t("players").toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
