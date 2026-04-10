"use client";

import { useState, useEffect } from "react";

function ExpandedDriver({ driver }: any) {
  return (
    <div className="flex h-full">
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <div className="text-lg font-bold">
            {driver.pos}. {driver.first}
          </div>

          <div className="text-2xl font-black">{driver.last}</div>

          <div className="flex gap-3 mt-3">
            <div className="bg-[#2A2A2A] px-3 py-1 rounded text-xs">
              {driver.team}
            </div>

            <div className="bg-[#2A2A2A] px-3 py-1 rounded text-xs">
              #{driver.number}
            </div>
          </div>
        </div>

        <div className="text-3xl font-black">{driver.points}</div>
      </div>

      <div
        className="w-32 flex items-end justify-center"
        style={{ background: driver.color }}
      >
        <img src={driver.img} className="h-44 object-contain" />
      </div>
    </div>
  );
}

function CompactDriver({ driver }: any) {
  return (
    <div className="flex items-center justify-between h-full px-4">
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

export default function Championship() {
  const [drivers, setDrivers] = useState([]);
  const [active, setActive] = useState(1);

  useEffect(() => {
    fetch("http://localhost:8000/api/championship?limit=6")
      .then((res) => res.json())
      .then((data) => setDrivers(data));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {drivers.map((d: any) => {
        const expanded = active === d.pos;

        return (
          <div
            key={d.pos}
            onMouseEnter={() => setActive(d.pos)}
            className={`transition-all duration-300 border border-[#333] rounded-lg bg-[#202020] overflow-hidden ${
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
