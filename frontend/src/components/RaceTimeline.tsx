"use client";

import { useEffect, useState } from "react";

function formatRaceDate(dateString: string) {
  const raceDate = new Date(dateString);
  const today = new Date();

  const formattedDate = raceDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const diffTime = raceDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let relative = "";

  if (diffDays > 0) {
    relative = `in ${diffDays} days`;
  } else if (diffDays < 0) {
    relative = `${Math.abs(diffDays)} days ago`;
  } else {
    relative = "today";
  }

  return `${formattedDate} (${relative})`;
}

export default function RaceTimeline() {
  const [races, setRaces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/timeline")
      .then((res) => res.json())
      .then(setRaces);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {races.map((race: any) => (
        <div
          key={race.round}
          className="min-w-[220px] bg-[#2A2A2A] px-4 py-3 rounded flex-shrink-0"
        >
          <div className="flex justify-between items-center">
            <div className="font-semibold">{race.race}</div>

            <span
              className={`text-xs px-2 py-1 rounded ${
                race.status === "NEXT"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {race.status}
            </span>
          </div>

          <div className="text-xs text-gray-400 mt-1">
            {race.circuit} • {race.country}
          </div>

          <div className="flex justify-between items-center mt-3">
            {/* <span className="text-sm">{race.date}</span> */}
            <span className="text-sm">{formatRaceDate(race.date)}</span>

            {/* <span
              className={`text-xs px-2 py-1 rounded ${
                race.status === "NEXT"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {race.status}
            </span> */}
          </div>
        </div>
      ))}
    </div>
  );
}
