import { WeatherData } from "@/types/race";

type WeatherPanelProps = {
  weather?: WeatherData | null;
};

export default function WeatherPanel({ weather }: WeatherPanelProps) {
  if (!weather) {
    return (
      <div className="h-full flex flex-col justify-end p-2">
        <span className="text-gray-500 text-xs">
          Waiting for weather data...
        </span>
      </div>
    );
  }

  const { air_temp, track_temp, humidity, wind_speed, wind_direction, rain } =
    weather;

  return (
    <div className="h-full flex flex-col justify-between text-xs">
      {/* Top */}
      <div>
        <p className="text-gray-400">WEATHER</p>
        <p className="text-lg font-bold">{rain ? "🌧 Rain" : "☀ Dry"}</p>
      </div>

      {/* Middle */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex flex-col">
          <span className="text-gray-400">Air</span>
          <span className="font-bold">{air_temp}°C</span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-400">Track</span>
          <span className="font-bold">{track_temp}°C</span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-400">Humidity</span>
          <span className="font-bold">{humidity}%</span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-400">Wind</span>
          <span className="font-bold">
            {wind_speed} km/h {wind_direction}
          </span>
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="mt-2">
        <div className="w-full h-1 bg-[#222] rounded">
          <div
            className={`h-1.5 rounded ${rain ? "bg-blue-500" : "bg-yellow-500"}`}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
