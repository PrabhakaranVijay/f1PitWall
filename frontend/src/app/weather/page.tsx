"use client";

import { Navigation, Thermometer, Droplets, Wind } from "lucide-react";

export default function Weather() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end border-b border-[#333] pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Weather Station</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Current Conditions</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-[#222] rounded flex items-center gap-4">
              <Thermometer className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-400 text-sm">Track Temp</p>
                <p className="text-2xl font-black">32.5°C</p>
              </div>
            </div>
            <div className="p-4 bg-[#222] rounded flex items-center gap-4">
              <Thermometer className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Air Temp</p>
                <p className="text-2xl font-black">28.1°C</p>
              </div>
            </div>
            <div className="p-4 bg-[#222] rounded flex items-center gap-4">
              <Droplets className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-gray-400 text-sm">Rainfall</p>
                <p className="text-2xl font-black">0.0 mm</p>
              </div>
            </div>
            <div className="p-4 bg-[#222] rounded flex items-center gap-4">
              <Wind className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Wind Speed</p>
                <p className="text-2xl font-black">1.2 m/s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <Navigation className="w-16 h-16 text-gray-600 mb-4 transform -rotate-45" />
            <h3 className="text-xl font-bold">Wind Direction: NW</h3>
            <p className="text-gray-500 mt-2">Wind impact minimal. No rain expected within 30 minutes.</p>
        </div>
      </div>
    </div>
  );
}
