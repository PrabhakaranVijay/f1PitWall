"use client";

import { Activity } from "lucide-react";

export default function Strategy() {
  const stints = [
    { driver: "VER", driverNum: 1, stints: [{ tyre: "soft", laps: 18 }, { tyre: "hard", laps: 34 }] },
    { driver: "NOR", driverNum: 4, stints: [{ tyre: "medium", laps: 24 }, { tyre: "hard", laps: 28 }] },
    { driver: "LEC", driverNum: 16, stints: [{ tyre: "medium", laps: 22 }, { tyre: "hard", laps: 30 }] },
  ];

  const getTyreColor = (tyre: string) => {
    switch (tyre) {
      case "soft": return "bg-red-500";
      case "medium": return "bg-yellow-400";
      case "hard": return "bg-white";
      case "intermediate": return "bg-green-500";
      case "wet": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end border-b border-[#333] pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Race Strategy</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Tyre Stints Timeline</h2>
          
          <div className="space-y-6">
            {stints.map((s) => (
              <div key={s.driverNum} className="flex items-center gap-4">
                <div className="w-16 font-bold flex items-center justify-between">
                  <span>{s.driver}</span>
                  <span className="text-xs text-gray-500 font-mono">{s.driverNum}</span>
                </div>
                
                <div className="flex-1 bg-[#222] h-8 rounded-lg flex overflow-hidden border border-[#333]">
                  {s.stints.map((stint, i) => (
                    <div 
                      key={i} 
                      className={`${getTyreColor(stint.tyre)} flex items-center justify-center text-xs font-bold text-black border-r border-black/20`}
                      style={{ width: `${(stint.laps / 60) * 100}%` }}
                      title={`${stint.tyre} - ${stint.laps} Laps`}
                    >
                      {stint.laps} L
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase">Legend</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500"></span> Soft (C5/C4)</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-400"></span> Medium (C4/C3)</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white"></span> Hard (C3/C2)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
