"use client";

import { useState, useMemo } from "react";
import { matchFixtures, normalizeCountryName, Match } from "@/lib/match-fixtures";
import { nations } from "@/lib/world-cup-data";
import { useLanguage } from "./language-provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function MatchFixtures() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  const stages = useMemo(() => {
    const uniqueStages = Array.from(new Set(matchFixtures.map((m) => m.stage)));
    return ["ALL", ...uniqueStages];
  }, []);

  const filteredMatches = useMemo(() => {
    let matches = matchFixtures;

    if (selectedStage !== "ALL") {
      matches = matches.filter((m) => m.stage === selectedStage);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      matches = matches.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(query) ||
          m.awayTeam.toLowerCase().includes(query) ||
          m.stadium.toLowerCase().includes(query) ||
          m.date.toLowerCase().includes(query)
      );
    }

    return matches;
  }, [search, selectedStage]);

  const matchesByDate = useMemo(() => {
    const grouped: Record<string, Match[]> = {};
    filteredMatches.forEach((match) => {
      if (!grouped[match.date]) {
        grouped[match.date] = [];
      }
      grouped[match.date].push(match);
    });
    return grouped;
  }, [filteredMatches]);

  const getNationId = (teamName: string): string | null => {
    if (teamName === "TBD") return null;
    const normalized = normalizeCountryName(teamName);
    const nation = nations.find((n) => n.id === normalized);
    return nation ? nation.id : null;
  };

  const getNationFlag = (teamName: string): string => {
    if (teamName === "TBD") return "❓";
    const nationId = getNationId(teamName);
    if (nationId) {
      const nation = nations.find((n) => n.id === nationId);
      return nation ? nation.flag : "🏳️";
    }
    return "🏳️";
  };

  const getNationColor = (teamName: string): string => {
    if (teamName === "TBD") return "#666";
    const nationId = getNationId(teamName);
    if (nationId) {
      const nation = nations.find((n) => n.id === nationId);
      return nation ? nation.jerseyColors.primary : "#666";
    }
    return "#666";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and Stage Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matches, teams, or stadiums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/80 backdrop-blur-sm border-border/50"
          />
        </div>

        {/* Stage Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStage === stage
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/80 text-muted-foreground hover:bg-card"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Match Fixtures
        </h2>
        <p className="text-sm text-muted-foreground">
          FIFA World Cup 2026 Schedule
        </p>
      </div>

      {/* Matches by Date */}
      <div className="space-y-6">
        {Object.entries(matchesByDate).map(([date, matches], dateIndex) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.02, duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{date}</h3>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matches.map((match, matchIndex) => {
                const homeNationId = getNationId(match.homeTeam);
                const awayNationId = getNationId(match.awayTeam);
                const homeColor = getNationColor(match.homeTeam);
                const awayColor = getNationColor(match.awayTeam);

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dateIndex * 0.02 + matchIndex * 0.01, duration: 0.2 }}
                  >
                    <Card className="group relative overflow-hidden rounded-2xl border border-border/20 bg-card/20 backdrop-blur-xl transition-all duration-300 hover:border-border/40 hover:shadow-lg hover:-translate-y-1">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.05),transparent_30%)]" />
                      
                      <div className="relative p-4">
                        {/* Header: Time and Stage */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/20">
                          <span className="text-xs font-semibold text-muted-foreground">{match.time}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {match.group || match.stage}
                          </span>
                        </div>

                        {/* Teams - Vertical Layout */}
                        <div className="space-y-3">
                          {/* Home Team */}
                          <div className="flex items-center gap-3">
                            {homeNationId ? (
                              <button
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("nationSelected", { detail: homeNationId })
                                  );
                                }}
                                className="flex items-center gap-3 flex-1"
                                style={{ ['--team-color' as any]: homeColor }}
                              >
                                <span className="text-2xl">{getNationFlag(match.homeTeam)}</span>
                                <span className="text-sm font-semibold text-foreground group-hover:text-[var(--team-color)] transition-colors text-left">
                                  {match.homeTeam}
                                </span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{getNationFlag(match.homeTeam)}</span>
                                <span className="text-sm font-semibold text-muted-foreground">
                                  {match.homeTeam}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="flex items-center justify-center">
                            <div className="h-px flex-1 bg-border/30" />
                            <span className="text-xs text-muted-foreground font-bold px-2">VS</span>
                            <div className="h-px flex-1 bg-border/30" />
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3">
                            {awayNationId ? (
                              <button
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("nationSelected", { detail: awayNationId })
                                  );
                                }}
                                className="flex items-center gap-3 flex-1"
                                style={{ ['--team-color' as any]: awayColor }}
                              >
                                <span className="text-2xl">{getNationFlag(match.awayTeam)}</span>
                                <span className="text-sm font-semibold text-foreground group-hover:text-[var(--team-color)] transition-colors text-left">
                                  {match.awayTeam}
                                </span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{getNationFlag(match.awayTeam)}</span>
                                <span className="text-sm font-semibold text-muted-foreground">
                                  {match.awayTeam}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stadium */}
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-3 pt-3 border-t border-border/20">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{match.stadium}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No matches found</p>
        </div>
      )}
    </div>
  );
}
