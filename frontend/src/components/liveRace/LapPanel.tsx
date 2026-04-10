import { LapData } from "@/types/race";

type LapPanelProps = {
  lapData?: LapData | null;
};

export default function LapPanel({ lapData }: LapPanelProps) {
  if (!lapData) {
    return (
      <div>
        <p className="text-lg text-gray-400 italic pl-2 pt-2">LAPS</p>
        <p className="text-7xl font-bold italic">
          {"--  "}
          <span className="text-xl text-gray-500 italic">/ {"--"}</span>
        </p>
      </div>
    );
  }

  const { current_lap, total_laps, lap_progress, fastest_lap, last_lap } =
    lapData;

  return (
    <div className="h-full flex flex-col justify-between text-xs">
      {/* Top - Lap Info */}
      <div>
        <p className="text-lg text-gray-400 italic pl-2 pt-2">LAPS</p>
        <p className="text-7xl font-bold italic">
          {current_lap}{" "}
          <span className="text-xl text-gray-500 italic">/ {total_laps}</span>
        </p>
      </div>
    </div>
  );
}
