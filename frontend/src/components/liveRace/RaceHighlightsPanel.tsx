import { RaceEvent } from "@/types/race";

type Props = {
  events: RaceEvent[];
};

const EVENT_STYLES: Record<string, string> = {
  overtake: "text-green-400",
  pit: "text-orange-400",
  fastest_lap: "text-purple-400",
  flag: "text-yellow-400",
  retirement: "text-red-500",
  penalty: "text-red-400",
  drs: "text-blue-400",
  safety_car: "text-yellow-300",
};

const mockEvents = [
  {
    id: "1",
    type: "overtake",
    message: "NOR overtook LEC for P2",
    timestamp: Date.now() - 10000,
  },
  {
    id: "2",
    type: "fastest_lap",
    message: "HAM fastest lap (1:20.123)",
    timestamp: Date.now() - 20000,
  },
  {
    id: "3",
    type: "flag",
    message: "Yellow Flag - Sector 2",
    timestamp: Date.now() - 30000,
  },
  {
    id: "4",
    type: "pit",
    message: "VER pit stop (2.4s)",
    timestamp: Date.now() - 40000,
  },
];

export default function RaceHighlightsPanel({ events }: Props) {
  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="text-gray-400 mb-2 pl-2">HIGHLIGHTS</div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {events.length === 0 ? (
          <div className="h-full flex items-end text-gray-500">
            Waiting for race events...
          </div>
        ) : (
          events.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="flex  items-center px-2 py-1 rounded"
            >
              {/* Time */}
              <span className="text-gray-500 text-[10px]">
                {formatTime(event.timestamp)} |
              </span>

              {/* Message */}
              <span
                className={`${EVENT_STYLES[event.type]} text-sm font-medium ml-2`}
              >
                {event.message}
              </span>

              {/* Time */}
              {/* <span className="text-gray-500 text-[10px] ml-2">
                {formatTime(event.timestamp)}
              </span> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number) {
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    minute: "2-digit",
    second: "2-digit",
  });
}
