"use client";

import { useState, useEffect } from "react";

interface Driver {
  pos: number;
  first: string;
  last: string;
  team: string;
  number: number;
  points: number;
  img: string;
}

/* ---------------- TEAM COLORS ---------------- */
const teamColors: { [key: string]: string[] } = {
  "Red Bull Racing": ["#0600EF", "#1E41FF"],
  Ferrari: ["#DC0000", "#1A0000"],
  Mercedes: ["#00D2BE", "#00332F"],
  McLaren: ["#FF8700", "#662200"],
  Alpine: ["#0090FF", "#003366"],
  Williams: ["#005AFF", "#002A80"],
  "Aston Martin": ["#006F62", "#003B2B"],
  "Haas F1 Team": ["#FFFFFF", "#CCCCCC"],
  "Racing Bulls": ["#2B4562", "#1A2A45"],
  Audi: ["#F50520", "#7A0000"],
  Cadillac: ["#C0C0C0", "#666666"],
};

/* ---------------- DRIVER IMAGE MAP ---------------- */
const driverImages: Record<number, string> = {
  30: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp",
  46: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp",
  63: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp",
  12: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp",
  16: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp",
  44: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp",
  1: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp",
  81: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp",
  31: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/haas/estoco01/2026haasestoco01right.webp",
  87: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/haas/olibea01/2026haasolibea01right.webp",
  10: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp",
  43: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp",
  3: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp",
  22: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp",
  27: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp",
  5: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp",
  55: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp",
  23: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp",
  14: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp",
  18: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp",
  11: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp",
  77: "https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp",
};

/* ---------------- EXPANDED CARD ---------------- */
function ExpandedDriver({ driver }: { driver: Driver }) {
  const colors = teamColors[driver.team] || ["#111111", "#333333"];

  return (
    <div
      className="relative flex h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      }}
    >
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Big Number */}
      <div className="absolute right-[35%] top-1/2 -translate-y-1/2 text-white/10 text-[140px] font-extrabold">
        {driver.number}
      </div>

      {/* Slanted Accent */}
      <div className="absolute right-[-40px] top-0 h-full w-1/2 bg-white/5 transform skew-x-[-20deg] z-[1]" />

      {/* Driver Image */}
      <img
        src={driver.img}
        className="
            absolute right-[0px] bottom-[-360px]
            h-[275%]
            object-contain
            object-bottom
            pointer-events-none
            z-[2]
          "
        style={{
          filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))",
        }}
      />

      {/* Fade for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[3]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-4 flex-1 text-white">
        <div>
          <div className="text-lg font-bold">
            {driver.pos}. {driver.first}
          </div>

          <div className="text-2xl font-black">{driver.last}</div>

          <div className="flex gap-3 mt-3">
            <div className="bg-black/30 px-3 py-1 rounded text-xs">
              {driver.team}
            </div>

            <div className="bg-black/30 px-3 py-1 rounded text-xs">
              #{driver.number}
            </div>
          </div>
        </div>

        <div className="text-3xl font-black">{driver.points}</div>
      </div>
    </div>
  );
}

/* ---------------- COMPACT CARD ---------------- */
function CompactDriver({ driver }: { driver: Driver }) {
  return (
    <div className="flex items-center justify-between h-full px-4 text-white">
      <div>
        <span className="font-bold mr-2">{driver.pos}.</span>
        {driver.first} {driver.last}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">#{driver.number}</span>
        <span className="font-bold">{driver.points}</span>
      </div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */
export default function Championship() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/championship?limit=6")
      .then((res) => res.json())
      .then((data) => {
        const updated = data.map((d: Driver) => ({
          ...d,
          img: driverImages[d.number] || "",
        }));
        setDrivers(updated);
      });
  }, []);

  useEffect(() => {
    if (drivers.length === 0 || paused) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % drivers.length);
    }, 3500); // 3.5 seconds

    return () => clearInterval(interval);
  }, [drivers, paused]);

  return (
    <div className="flex flex-col gap-3">
      {drivers.map((d, index) => {
        const expanded = active === index;

        return (
          <div
            key={d.pos}
            onMouseEnter={() => {
              setActive(index);
              setPaused(true);
            }}
            onMouseLeave={() => setPaused(false)}
            className={`group transition-all duration-300 border border-[#333] rounded-lg bg-[#202020] overflow-hidden ${
              expanded ? "h-52" : "h-20"
            }`}
          >
            {expanded ? (
              <ExpandedDriver driver={d} />
            ) : (
              <CompactDriver driver={d} />
            )}
          </div>
        );
      })}
    </div>
  );
}
