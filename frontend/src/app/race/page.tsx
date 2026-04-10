"use client";

import { useState } from "react";

import RaceTrack from "@/components/RaceTrack";
import LapPanel from "@/components/liveRace/LapPanel";
import RaceHighlightsPanel from "@/components/liveRace/RaceHighlightsPanel";
import WeatherPanel from "@/components/liveRace/WeatherPanel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getWebSocketBaseUrl } from "@/lib/api";
import { RaceSnapshot } from "@/types/race";
import { mapWeatherData } from "@/utils/mapWeatherData";

const WS_BASE_URL = getWebSocketBaseUrl();

export default function LiveRace() {
  const [selectedSession, setSelectedSession] = useState<number | "latest">(
    "latest",
  );

  const { data, isConnected } = useWebSocket<RaceSnapshot>(
    `${WS_BASE_URL}/ws/race?session=${selectedSession}`,
  );

  const weatherData = data?.weather ? mapWeatherData(data.weather) : null;
  const leaderboard = data?.positions ?? [];
  const lapData = data?.lap ?? null;
  const events = data?.highlights ?? [];
  const session = data?.session;
  const trackDriverNumber = leaderboard[0]?.num ?? 1;
  const trackSessionKey =
    data?.session?.session_key ??
    (typeof selectedSession === "number" ? selectedSession : 9158);
  const raceName = session?.meeting_name ?? "Live Race";
  const raceLocation = [session?.location, session?.country_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end border-b border-[#333] pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">
            {raceName}
          </h1>
          <p className="text-sm text-gray-400 font-mono uppercase tracking-[0.18em]">
            {raceLocation || "Loading location"}
          </p>
        </div>
        {/* <div className="flex gap-4 items-center">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-lg font-bold text-white">
            {session?.session_name ?? "Race Session"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSession(9158)}
              className={`px-2 py-1 text-xs rounded border ${selectedSession === 9158 ? "bg-white text-black" : "border-gray-600"}`}
            >
              Aus GP
            </button>
            <button
              onClick={() => setSelectedSession(9159)}
              className={`px-2 py-1 text-xs rounded border ${selectedSession === 9159 ? "bg-white text-black" : "border-gray-600"}`}
            >
              Japan GP
            </button>
            <button
              onClick={() => setSelectedSession(9160)}
              className={`px-2 py-1 text-xs rounded border ${selectedSession === 9160 ? "bg-white text-black" : "border-gray-600"}`}
            >
              China GP
            </button>
          </div>
          <span className="text-sm text-gray-400 font-mono">
            {isConnected ? "WS Connected" : "WS Disconnected"}
          </span>
        </div> */}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-10 gap-6 min-h-0">
        <div className="lg:col-span-12 lg:row-span-8 bg-[#1A1A1A] border border-[#333] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-10 gap-1">
            <div className="lg:col-span-2 lg:row-span-10 bg-[#1A1A1A] border border-[#333] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#222]">
                <h2 className="font-bold text-lg">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-[11px] leading-tight">
                  <thead className="bg-[#111] text-gray-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-2 text-left font-medium">POS</th>
                      <th className="py-2 px-2 text-left font-medium">NAME</th>
                      <th className="py-2 px-2 text-right font-medium">GAP</th>
                      <th className="py-2 px-2 text-left font-medium">TIR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {leaderboard.map((driver) => (
                      <tr
                        key={driver.num}
                        className="border-b border-[#222] hover:bg-[#222] transition-colors cursor-pointer"
                      >
                        <td className="py-1 px-2 font-mono text-[11px]">
                          {driver.pos}
                        </td>
                        <td className="py-1 px-2 font-mono text-[11px]">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-1 h-4 rounded-sm"
                              style={{
                                backgroundColor: driver.teamColor ?? "#3b82f6",
                              }}
                            ></span>
                            <span className="font-bold">{driver.name}</span>
                            <span className="text-xs text-gray-500">
                              {driver.num}
                            </span>
                          </div>
                        </td>
                        <td className="py-1 px-2 font-mono text-[11px] text-right text-gray-300">
                          {driver.gap}
                        </td>
                        <td className="py-1 px-2 font-mono text-[11px]">
                          {driver.tir}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 pl-3 col-start-3 col-span-1 row-span-2">
              <LapPanel lapData={lapData} />
            </div>

            <div className="pl-3 col-start-3 row-start-3 col-span-2 row-span-5">
              <RaceHighlightsPanel events={events} />
            </div>

            <div className="pl-3 col-start-3 row-start-8 col-span-2 row-span-2">
              <WeatherPanel weather={weatherData} />
            </div>

            <div className="col-start-4 row-start-2 col-span-7 row-span-8 overflow-hidden relative">
              <RaceTrack
                sessionKey={trackSessionKey}
                driverNumber={trackDriverNumber}
              />
            </div>

            <div className="col-start-10 row-start-2 col-span-3 row-span-4 bg-[#12221A]">
              Mini map 1
            </div>

            <div className="col-start-10 row-start-6 col-span-3 row-span-4 bg-[#12221A]">
              Mini map 2
            </div>

            <div className="col-start-3 row-start-10 col-span-12 row-span-1 bg-[#12221A]">
              Lap progress bar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
