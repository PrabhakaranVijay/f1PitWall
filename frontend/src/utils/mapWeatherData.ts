import { RawWeatherReading, WeatherData } from "@/types/race";
import { getWindDirection } from "@/utils/windDirection";

export function mapWeatherData(raw: RawWeatherReading): WeatherData {
  return {
    air_temp: Math.round(raw.air_temperature),
    track_temp: Math.round(raw.track_temperature),
    humidity: raw.humidity,
    wind_speed: Math.round(raw.wind_speed),
    wind_direction: getWindDirection(raw.wind_direction),
    rain: raw.rainfall > 0,
  };
}
