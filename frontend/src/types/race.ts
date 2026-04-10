export type WeatherData = {
  air_temp: number; // °C
  track_temp: number; // °C
  humidity: number; // %
  wind_speed: number; // km/h
  wind_direction: string; // N, NE, etc
  rain: boolean;
};

export type LapData = {
  current_lap: number;
  total_laps: number;
  lap_progress: number;
  fastest_lap?: string;
  last_lap?: string;
};

export type RaceEventType =
  | "overtake"
  | "pit"
  | "fastest_lap"
  | "flag"
  | "retirement"
  | "penalty"
  | "drs"
  | "safety_car";

export type RaceEvent = {
  id: string;
  type: RaceEventType;
  message: string;
  timestamp: number;
};

export type LeaderboardEntry = {
  pos: number;
  num: number;
  name: string;
  team: string;
  teamColor?: string;
  gap: string;
  tir: string;
};

export type RaceSession = {
  session_key: number;
  meeting_name: string;
  session_name: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
};

export type RawWeatherReading = {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
};

export type RaceSnapshot = {
  session: RaceSession | null;
  positions: LeaderboardEntry[];
  lap: LapData | null;
  weather: RawWeatherReading | null;
  highlights: RaceEvent[];
};
