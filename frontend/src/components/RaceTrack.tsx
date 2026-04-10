import React, { useEffect, useState, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

interface TrackPoint {
  x: number;
  y: number;
  sector: number;
  timestamp: number;
}

interface DrsZone {
  zone: number;
  start_index: number;
  end_index: number;
}

interface TrackData {
  track: TrackPoint[];
  drs_zones: DrsZone[];
}

interface RaceTrackProps {
  sessionKey: number;
  driverNumber: number;
  // Size of the logical SVG canvas
  mapSize?: number;
}

const API_BASE_URL = getApiBaseUrl();

export default function RaceTrack({
  sessionKey = 9158,
  driverNumber = 1,
  mapSize = 1000,
}: RaceTrackProps) {
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Animation state
  const requestRef = useRef<number>(0);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  // Fetch track data from the backend
  useEffect(() => {
    const fetchTrack = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/track?session_key=${sessionKey}&driver_number=${driverNumber}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch track data");
        }
        const result: TrackData = await response.json();
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [sessionKey, driverNumber]);

  // Car animation loop
  useEffect(() => {
    if (!data || !data.track || data.track.length === 0) return;

    const startTime = performance.now();
    // A speed multiplier for demo purposes (real time telemetry might be slow to watch)
    const SPEED_MULTIPLIER = 10;

    // Find the total duration in seconds from the first point
    const pts = data.track;
    const maxTimestamp = pts[pts.length - 1].timestamp;

    const animate = (time: number) => {
      // Calculate elapsed time in seconds taking multiplier into account
      const elapsedSeconds = ((time - startTime) / 1000) * SPEED_MULTIPLIER;

      // Loop the animation
      const currentSeconds = elapsedSeconds % maxTimestamp;

      // Find the closest point in time
      // Simple linear search or binary search. Linear is fine for ~500 points.
      let nextIndex = 0;
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].timestamp > currentSeconds) {
          nextIndex = i;
          break;
        }
      }

      setCurrentCarIndex(nextIndex);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [data]);

  // SVG Pan/Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, Math.min(prev * zoomFactor, 10)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4 mr-2"></div>
        Loading Track Telemetry...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        {error || "No data available"}
      </div>
    );
  }

  // Segment points by sector
  const s1Points = data.track.filter((p) => p.sector === 1);
  const s2Points = data.track.filter((p) => p.sector === 2);
  const s3Points = data.track.filter((p) => p.sector === 3);

  // Format array to SVG polyline string: "x,y x,y x,y"
  const toPointsString = (pts: TrackPoint[]) =>
    pts.map((p) => `${p.x * mapSize},${p.y * mapSize}`).join(" ");

  // Current car coords
  const currentCar = data.track[currentCarIndex] || data.track[0];
  const carX = currentCar.x * mapSize;
  const carY = currentCar.y * mapSize;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#12221A] overflow-hidden rounded-xl border border-[#333]">
      {/* Controls Container */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-[#1A1A1A]/80 p-2 rounded-lg backdrop-blur-sm border border-[#333]">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 10))}
          className="p-1 hover:bg-[#333] rounded text-gray-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.5))}
          className="p-1 hover:bg-[#333] rounded text-gray-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetView}
          className="p-1 hover:bg-[#333] rounded text-gray-300 hover:text-white transition"
          title="Reset View"
        >
          <Maximize size={18} />
        </button>
      </div>

      {/* Track Legend */}
      <div className="absolute top-4 left-4 z-10 flex gap-4 text-xs font-mono bg-[#1A1A1A]/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-[#333]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Sector 1
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500"></div> Sector 2
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-purple-500"></div> Sector 3
        </div>
        {data.drs_zones.length > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-3 h-3 rounded-sm bg-cyan-400"></div> DRS Zone
            (Demo)
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          // We provide a little padding using viewBox offset
          viewBox={`-100 -100 ${mapSize + 200} ${mapSize + 200}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Underlay glow / shadow for the track */}
          <polyline
            points={toPointsString(data.track)}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeOpacity="0.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Drawing Sectors */}
          {s1Points.length > 0 && (
            <polyline
              points={toPointsString(s1Points)}
              fill="none"
              stroke="#ebdb34" // Yellow
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {s2Points.length > 0 && (
            <polyline
              points={toPointsString(s2Points)}
              fill="none"
              stroke="#22c55e" // Green
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {s3Points.length > 0 && (
            <polyline
              points={toPointsString(s3Points)}
              fill="none"
              stroke="#a855f7" // Purple
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* DRS Zones */}
          {data.drs_zones.map((zone, idx) => {
            const drsPts = data.track.slice(
              zone.start_index,
              zone.end_index + 1,
            );
            if (drsPts.length < 2) return null;
            return (
              <polyline
                key={`drs-${idx}`}
                points={toPointsString(drsPts)}
                fill="none"
                stroke="#22d3ee" // Cyan
                strokeWidth="10"
                strokeOpacity="0.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            );
          })}

          {/* Animated Car */}
          <g transform={`translate(${carX}, ${carY})`}>
            <circle
              r="12"
              fill="#3b82f6"
              opacity="0.4"
              className="animate-pulse"
            />
            <circle r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text
              y="20"
              fontSize="14"
              fill="white"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono tracking-tighter"
            >
              {driverNumber}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
