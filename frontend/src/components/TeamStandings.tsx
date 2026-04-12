"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

/* -------------------- TYPES -------------------- */
type TeamAPI = {
  team_name: string;
  points_current: number;
  position_current: number;
};

type TeamStanding = {
  team: string;
  points: number;
  position: number;
};

/* -------------------- TEAM CONFIG (SOURCE OF TRUTH) -------------------- */
const TEAM_CONFIG: Record<
  string,
  { name: string; color: string; logo: string }
> = {
  mercedes: {
    name: "Mercedes",
    color: "#00D2BE",
    logo: "https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp",
  },
  ferrari: {
    name: "Ferrari",
    color: "#DC0000",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp",
  },
  mclaren: {
    name: "McLaren",
    color: "#FF8700",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp",
  },
  redbull: {
    name: "Red Bull Racing",
    color: "#0600EF",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp",
  },
  racingbulls: {
    name: "Racing Bulls",
    color: "#2B4562",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp",
  },
  alpine: {
    name: "Alpine",
    color: "#0090FF",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp",
  },
  haas: {
    name: "Haas F1 Team",
    color: "#FFFFFF",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp",
  },
  williams: {
    name: "Williams",
    color: "#005AFF",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp",
  },
  astonmartin: {
    name: "Aston Martin",
    color: "#006F62",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp",
  },
  audi: {
    name: "Audi",
    color: "#F50520",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp",
  },
  cadillac: {
    name: "Cadillac",
    color: "#C0C0C0",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp",
  },
};

/* -------------------- NORMALIZER -------------------- */
const normalizeTeamKey = (name: string): string => {
  const map: Record<string, string> = {
    Mercedes: "mercedes",
    Ferrari: "ferrari",
    McLaren: "mclaren",

    "Red Bull": "redbull",
    "Red Bull Racing": "redbull",

    "RB F1 Team": "racingbulls",
    "Racing Bulls": "racingbulls",
    "Racing Bulls F1 Team": "racingbulls",

    "Alpine F1 Team": "alpine",
    Alpine: "alpine",

    Haas: "haas",
    "Haas F1 Team": "haas",

    Williams: "williams",

    "Aston Martin": "astonmartin",
    "Aston Martin F1 Team": "astonmartin",

    Audi: "audi",

    "Cadillac F1 Team": "cadillac",
    Cadillac: "cadillac",
  };

  return map[name] || name.toLowerCase().replace(/\s+/g, "");
};

/* -------------------- COMPONENT -------------------- */
const TeamStandings: React.FC = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/constructor-standings?limit=11`,
        );

        if (!res.ok) {
          throw new Error(`Failed (${res.status})`);
        }

        const data: TeamAPI[] = await res.json();

        /* DEBUG (optional) */
        console.log(
          "API team names:",
          data.map((t) => t.team_name),
        );

        const sorted = [...data].sort(
          (a, b) => a.position_current - b.position_current,
        );

        const formatted: TeamStanding[] = sorted.map((team) => {
          const key = normalizeTeamKey(team.team_name);
          const config = TEAM_CONFIG[key];

          return {
            team: config?.name || team.team_name,
            points: team.points_current,
            position: team.position_current,
          };
        });

        setStandings(formatted);
      } catch (err) {
        console.error(err);
        setError("Unable to load standings");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) return <p className="text-gray-400">Loading standings...</p>;
  if (error) return <p className="text-gray-400">{error}</p>;

  return (
    <div className="text-white shadow-lg">
      {/* Header */}
      <div className="grid grid-cols-[40px_40px_1fr_80px] text-gray-400 text-sm border-b border-gray-700 pb-2 mb-2">
        <span>Pos.</span>
        <span></span>
        <span>Team</span>
        <span className="text-right">Points</span>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {standings.map((team, index) => {
          const key = normalizeTeamKey(team.team);
          const config = TEAM_CONFIG[key];

          return (
            <div
              key={team.team}
              className={`grid grid-cols-[40px_40px_1fr_80px] items-center border-b border-gray-800 pb-1 pt-1 rounded-md px-2 cursor-pointer ${
                index < 3 ? "text-white" : "text-gray-300"
              }`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  config?.color || "#1F2937";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "transparent";
              }}
            >
              {/* Position */}
              <span>{team.position}</span>

              {/* Logo */}
              <img
                src={
                  config?.logo ||
                  "https://media.api-sports.io/formula-1/teams/placeholder.png"
                }
                alt={team.team}
                className="w-6 h-6 object-contain"
              />

              {/* Team */}
              <span className="font-medium">{team.team}</span>

              {/* Points */}
              <span className="font-semibold text-right">{team.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamStandings;
