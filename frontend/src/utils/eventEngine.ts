import { RaceEvent } from "@/types/race";

type Driver = {
  driver_number: number;
  short_name: string;
  position: number;
  lap_time?: number;
};

type GenerateEventsInput = {
  prev: Driver[];
  current: Driver[];
};

export function generateEvents({
  prev,
  current,
}: GenerateEventsInput): RaceEvent[] {
  const events: RaceEvent[] = [];

  // Create lookup maps
  const prevMap = new Map(prev.map((d) => [d.driver_number, d]));
  const currMap = new Map(current.map((d) => [d.driver_number, d]));

  // Loop through current drivers
  for (const driver of current) {
    const prevDriver = prevMap.get(driver.driver_number);
    if (!prevDriver) continue;

    // 🟢 1. OVERTAKE (position improved)
    if (driver.position < prevDriver.position) {
      events.push({
        id: `${driver.driver_number}-pos-${Date.now()}`,
        type: "overtake",
        message: `${driver.short_name} up to P${driver.position}`,
        timestamp: Date.now(),
      });
    }

    // 🟣 2. FASTEST LAP
    if (
      driver.lap_time &&
      prevDriver.lap_time &&
      driver.lap_time < prevDriver.lap_time
    ) {
      events.push({
        id: `${driver.driver_number}-fastest-${Date.now()}`,
        type: "fastest_lap",
        message: `${driver.short_name} fastest lap`,
        timestamp: Date.now(),
      });
    }
  }

  return events;
}
