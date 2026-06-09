"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

const flagCodesByNationId: Record<string, string> = {
  algeria: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgium: "be",
  "bosnia-herzegovina": "ba",
  brazil: "br",
  canada: "ca",
  "cape-verde": "cv",
  chile: "cl",
  china: "cn",
  colombia: "co",
  croatia: "hr",
  curacao: "cw",
  czechia: "cz",
  denmark: "dk",
  "dr-congo": "cd",
  ecuador: "ec",
  egypt: "eg",
  england: "gb-eng",
  france: "fr",
  germany: "de",
  ghana: "gh",
  haiti: "ht",
  iran: "ir",
  iraq: "iq",
  "ivory-coast": "ci",
  japan: "jp",
  jordan: "jo",
  mexico: "mx",
  morocco: "ma",
  netherlands: "nl",
  "new-zealand": "nz",
  nigeria: "ng",
  norway: "no",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  "saudi-arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  "south-africa": "za",
  "south-korea": "kr",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  tunisia: "tn",
  turkiye: "tr",
  ukraine: "ua",
  uruguay: "uy",
  usa: "us",
  uzbekistan: "uz",
  wales: "gb-wls",
};

interface NationFlagProps {
  className?: string;
  code?: string;
  emoji?: string;
  fallbackClassName?: string;
  label: string;
  nationId?: string | null;
  showBrazilStars?: boolean;
}

export function NationFlag({
  className = "h-5 w-7",
  code,
  emoji,
  fallbackClassName = "text-xl",
  label,
  nationId,
  showBrazilStars = false,
}: NationFlagProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const flagCode = nationId ? flagCodesByNationId[nationId] : undefined;
  const fallbackCode = code?.toLowerCase();
  const imageCode = flagCode || fallbackCode;

  if (nationId === "brazil" && !showBrazilStars) {
    return (
      <svg
        aria-label={`${label} flag`}
        className={`${className} rounded-[3px] object-contain shadow-sm`}
        role="img"
        viewBox="0 0 28 20"
      >
        <rect fill="#009B3A" height="20" width="28" />
        <path d="M14 2.6 25.2 10 14 17.4 2.8 10Z" fill="#FFDF00" />
        <circle cx="14" cy="10" fill="#002776" r="5.2" />
        <path
          d="M9.3 8.7c2.7-.7 6.1-.2 9.4 1.6"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeWidth="1.1"
        />
      </svg>
    );
  }

  if (!imageCode || imageFailed) {
    return (
      <span aria-label={`${label} flag`} className={fallbackClassName} role="img">
        {emoji || "🏳️"}
      </span>
    );
  }

  return (
    <img
      alt={`${label} flag`}
      className={`${className} rounded-[3px] object-contain shadow-sm`}
      loading="lazy"
      onError={() => setImageFailed(true)}
      src={`https://flagcdn.com/${imageCode}.svg`}
    />
  );
}
