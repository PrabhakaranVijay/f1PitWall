import React, { useEffect, useState } from "react";

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

/* -------------------- TEAM LOGOS -------------------- */
const getTeamLogo = (teamName: string): string => {
  const logos: Record<string, string> = {
    Mercedes:
      "https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp",
    Ferrari:
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp",
    McLaren:
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp",
    "Haas F1 Team":
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp",
    Alpine:
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp",
    "Red Bull Racing":
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp",
    "Racing Bulls":
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp",
    Audi: "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp",
    Williams:
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp",
    Cadillac:
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp",
    "Aston Martin":
      "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp",
  };

  return (
    logos[teamName] ||
    "https://media.api-sports.io/formula-1/teams/placeholder.png"
  );
};

/* -------------------- TEAM COLORS -------------------- */
const getTeamColor = (teamName: string): string => {
  const colors: Record<string, string> = {
    Mercedes: "#00D2BE",
    Ferrari: "#DC0000",
    McLaren: "#FF8700",
    "Red Bull Racing": "#0600EF",
    Alpine: "#0090FF",
    Williams: "#005AFF",
    "Aston Martin": "#006F62",
    "Haas F1 Team": "#FFFFFF",
    "Racing Bulls": "#2B4562",
    Audi: "#F50520",
    Cadillac: "#C0C0C0",
  };

  return colors[teamName] || "#1F2937"; // fallback gray
};

/* -------------------- NORMALIZE TEAM NAMES -------------------- */
const normalizeTeamName = (name: string): string => {
  if (name === "RB") return "AlphaTauri";
  if (name === "Kick Sauber") return "Alfa Romeo";
  return name;
};

/* -------------------- COMPONENT -------------------- */
const TeamStandings: React.FC = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch(
          "https://api.openf1.org/v1/championship_teams?session_key=latest",
        );
        const data: TeamAPI[] = await res.json();

        // Sort by official position
        const sorted = data.sort(
          (a, b) => a.position_current - b.position_current,
        );

        // Map to UI format
        const formatted: TeamStanding[] = sorted.map((team) => ({
          team: team.team_name,
          points: team.points_current,
          position: team.position_current,
        }));

        setStandings(formatted);
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading standings...</p>;
  }

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
        {standings.map((team, index) => (
          <div
            key={team.team}
            className={`grid grid-cols-[40px_40px_1fr_80px] items-center border-b border-gray-800 pb-1 pt-1 transition-all duration-300 rounded-md px-2 cursor-pointer ${
              index < 3 ? "text-white" : "text-gray-300"
            }`}
            style={{
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor =
                getTeamColor(normalizeTeamName(team.team));
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
              src={getTeamLogo(normalizeTeamName(team.team))}
              alt={team.team}
              className="w-6 h-6 object-contain"
            />

            {/* Team Name */}
            <span className="font-medium">{team.team}</span>

            {/* Points */}
            <span className="font-semibold text-right">{team.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStandings;
