"use client";

import Championship from "@/components/ChampionshipCard";
import Highlights from "@/components/Highlights";
// import Highlights from "@/components/temp";
import RaceTimeline from "@/components/RaceTimeline";
import TeamStandings from "@/components/TeamStandings";
import { Activity, Zap, Flag, Navigation } from "lucide-react";
// import Header from "../components/Header";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* <Header isLive={true} /> */}

      {/* <header className="flex justify-between items-end border-b border-[#333333] pb-4">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">Live from the pit wall</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1A1A1A] px-4 py-2 rounded border border-[#333] text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse"></span>
            SESSION LIVE
          </div>
        </div>
      </header> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Track Temp" value="32°C" icon={<Zap className="w-5 h-5 text-yellow-500" />} />
        <StatCard title="Air Temp" value="28°C" icon={<Activity className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Race Control" value="Green Flag" icon={<Flag className="w-5 h-5 text-green-500" />} highlight="border-green-500/50 bg-green-500/5" />
        <StatCard title="Weather" value="0% Rain" icon={<Navigation className="w-5 h-5 text-gray-400" />} />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-6 gap-4">
        {/* Highlights */}
        <div className="lg:col-span-2 lg:col-start-2 lg:row-span-4 bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4 italic">Highlights</h2>
          <div className="flex-1">
            <Highlights />
          </div>
        </div>

        {/* Latest Incidents */}
        <div className="lg:col-start-1 lg:row-start-1 lg:row-span-4 bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 h-full">
          <h2 className="text-xl font-bold mb-4 italic">Team Standings</h2>
          <TeamStandings />
        </div>

        {/* Championship */}
        <div className="lg:col-start-4 lg:row-start-1 lg:row-span-6 bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4 italic">Championship</h2>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Drivers */}
            <Championship />
          </div>
        </div>

        {/* Race Timeline */}
        <div className="lg:col-start-1 lg:row-start-5 lg:col-span-3 lg:row-span-2 bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 h-full">
          <h2 className="text-xl font-bold mb-4 italic">Race Timeline</h2>

          <RaceTimeline />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight = "border-[#333] bg-[#1A1A1A]",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  highlight?: string;
}) {
  return (
    <div className={`border rounded-xl p-5 ${highlight}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
