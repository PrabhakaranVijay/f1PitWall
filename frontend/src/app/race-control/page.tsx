"use client";

import { AlertTriangle, Flag, ShieldAlert, Timer } from "lucide-react";

export default function RaceControl() {
  const incidents = [
    { time: "14:23:45", lap: 14, type: "Yellow Flag", message: "Turn 4 to Turn 6", severity: "medium" },
    { time: "14:21:12", lap: 12, type: "Penalty", message: "Car 14 (ALO) 5s Penalty - Track Limits", severity: "high" },
    { time: "14:15:00", lap: 8, type: "Green Flag", message: "Sector 1 Clear", severity: "low" },
    { time: "14:12:30", lap: 6, type: "Investigation", message: "Car 1 (VER) and Car 4 (NOR) - Turn 1 incident", severity: "medium" },
    { time: "14:03:00", lap: 1, type: "Race Start", message: "Session started", severity: "info" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500 bg-red-500/10 text-red-500";
      case "medium": return "border-yellow-500 bg-yellow-500/10 text-yellow-500";
      case "low": return "border-green-500 bg-green-500/10 text-green-500";
      default: return "border-gray-500 bg-gray-500/10 text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("Flag")) return <Flag className="w-5 h-5" />;
    if (type.includes("Penalty")) return <Timer className="w-5 h-5" />;
    if (type.includes("Investigation")) return <AlertTriangle className="w-5 h-5" />;
    return <ShieldAlert className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end border-b border-[#333] pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Race Control Messages</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {incidents.map((inc, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${getSeverityColor(inc.severity)}`}>
              <div className="mt-1">
                {getTypeIcon(inc.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">{inc.type}</span>
                  <div className="text-xs font-mono space-x-3">
                    <span>Lap {inc.lap}</span>
                    <span>{inc.time}</span>
                  </div>
                </div>
                <p className="text-gray-300">{inc.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
