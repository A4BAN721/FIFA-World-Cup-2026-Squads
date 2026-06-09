"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./language-provider";

const convertToBanglaNumerals = (value: number): string => {
  const banglaNumerals: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };

  return String(value).replace(/\d/g, (digit) => banglaNumerals[digit] || digit);
};

export function Countdown() {
  const { t, language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: June 12, 2026, 01:00 AM GMT+6.
    const targetDate = new Date("2026-06-12T01:00:00+06:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (value: number) =>
    language === "bn" ? convertToBanglaNumerals(value) : value;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-2 md:gap-3">
        <div className="flex flex-col items-center">
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {t("days")}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {t("hours")}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {t("minutes")}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {t("seconds")}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground font-medium">
        {t("untilWorldCup")}
      </div>
    </div>
  );
}
