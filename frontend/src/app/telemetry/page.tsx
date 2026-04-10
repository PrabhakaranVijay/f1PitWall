"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Telemetry() {
  const mockData = [
    { time: 0, speed: 120, throttle: 50, gear: 3 },
    { time: 1, speed: 180, throttle: 100, gear: 4 },
    { time: 2, speed: 220, throttle: 100, gear: 5 },
    { time: 3, speed: 260, throttle: 100, gear: 6 },
    { time: 4, speed: 290, throttle: 100, gear: 7 },
    { time: 5, speed: 310, throttle: 100, gear: 8 },
    { time: 6, speed: 140, throttle: 0, gear: 4 },
    { time: 7, speed: 90, throttle: 20, gear: 2 },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end border-b border-[#333] pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Car Telemetry</h1>
        </div>
        <select className="bg-[#1A1A1A] border border-[#333] rounded px-4 py-2 text-sm font-semibold outline-none focus:border-red-500">
          <option>VER (1)</option>
          <option>NOR (4)</option>
          <option>LEC (16)</option>
        </select>
      </header>
      
      <div className="flex-1 grid grid-rows-3 gap-6 min-h-[600px]">
        {/* Speed Chart */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex flex-col">
          <h3 className="text-gray-400 text-sm font-bold mb-4 ml-4">Speed (km/h)</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} itemStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="speed" stroke="#E10600" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throttle/Brake Chart */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex flex-col">
          <h3 className="text-gray-400 text-sm font-bold mb-4 ml-4">Throttle & Brake (%)</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                <Line type="monotone" dataKey="throttle" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gear Chart */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex flex-col">
          <h3 className="text-gray-400 text-sm font-bold mb-4 ml-4">Gear</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 8]} tickCount={9} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                <Line type="stepAfter" dataKey="gear" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
