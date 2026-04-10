// // import Link from "next/link";
// // import { LayoutDashboard, Car, Activity, Map, VideoIcon, Thermometer } from "lucide-react";

// // export function Sidebar() {
// //   const routes = [
// //     { name: "Live Dashboard", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
// //     { name: "Live Race", path: "/race", icon: <Car className="w-5 h-5" /> },
// //     { name: "Telemetry", path: "/telemetry", icon: <Activity className="w-5 h-5" /> },
// //     { name: "Strategy", path: "/strategy", icon: <Map className="w-5 h-5" /> },
// //     { name: "Race Control", path: "/race-control", icon: <VideoIcon className="w-5 h-5" /> },
// //     { name: "Weather", path: "/weather", icon: <Thermometer className="w-5 h-5" /> },
// //   ];

// //   return (
// //     <div className="w-64 h-screen bg-[#111111] border-r border-[#333333] flex flex-col pt-4 pb-8">
// //       <div className="px-6 mb-8 text-2xl font-black italic tracking-tighter text-white">
// //         PIT<span className="text-[#FF1801]">WALL</span>
// //       </div>
// //       <nav className="flex-1 px-4 space-y-2">
// //         {routes.map((r) => (
// //           <Link key={r.path} href={r.path} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222] transition-colors">
// //             {r.icon}
// //             <span className="font-semibold">{r.name}</span>
// //           </Link>
// //         ))}
// //       </nav>
// //       <div className="px-6 mt-auto">
// //         <div className="text-xs text-gray-500 font-medium">Session: Live</div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   Car,
//   Activity,
//   Map,
//   VideoIcon,
//   Thermometer,
//   PanelLeftClose,
//   PanelLeftOpen,
// } from "lucide-react";

// export function Sidebar() {
//   const [collapsed, setCollapsed] = useState(false);

//   const routes = [
//     { name: "Live Dashboard", path: "/", icon: LayoutDashboard },
//     { name: "Live Race", path: "/race", icon: Car },
//     { name: "Telemetry", path: "/telemetry", icon: Activity },
//     { name: "Strategy", path: "/strategy", icon: Map },
//     { name: "Race Control", path: "/race-control", icon: VideoIcon },
//     { name: "Weather", path: "/weather", icon: Thermometer },
//   ];

//   return (
//     <div
//       className={`h-screen bg-[#111111] border-r border-[#333333] flex flex-col transition-all duration-300
//       ${collapsed ? "w-16" : "w-64"}`}
//     >
//       {/* Top */}
//       <div className="flex items-center justify-between px-4 py-4">
//         {!collapsed && (
//           <div className="text-xl font-black italic tracking-tight text-white">
//             PIT<span className="text-[#FF1801]">WALL</span>
//           </div>
//         )}

//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="text-gray-400 hover:text-white"
//         >
//           {collapsed ? (
//             <PanelLeftOpen size={20} />
//           ) : (
//             <PanelLeftClose size={20} />
//           )}
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-2 space-y-2">
//         {routes.map((r) => {
//           const Icon = r.icon;

//           return (
//             <Link
//               key={r.path}
//               href={r.path}
//               className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222] transition-all"
//             >
//               <Icon className="w-5 h-5 shrink-0" />

//               {!collapsed && (
//                 <span className="font-medium whitespace-nowrap">{r.name}</span>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       {!collapsed && (
//         <div className="px-4 pb-4 text-xs text-gray-500">Session: Live</div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  LayoutDashboard,
  Radio,
  Car,
  Activity,
  Map,
  VideoIcon,
  Thermometer,
  PanelLeftClose,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isExpanded = !collapsed || hovered;

  const routes = [
    { name: "Home", path: "/", icon: Home },
    // { name: "Live Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Live Race", path: "/race", icon: Radio },
    { name: "Telemetry", path: "/telemetry", icon: Activity },
    { name: "Strategy", path: "/strategy", icon: Map },
    { name: "Race Control", path: "/race-control", icon: VideoIcon },
    { name: "Weather", path: "/weather", icon: Thermometer },
  ];

  return (
    <div className="h-dvh flex mt-6">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
        bg-[#111111]
        border-y border-r border-[#333333]
        rounded-r-2xl
        flex flex-col
        transition-all duration-300
        ${isExpanded ? "w-64" : "w-16"}
        h-[80%]
        `}
      >
        {/* Collapse Button */}
        {/* {isExpanded && (
          <div className="flex justify-end px-3 pt-3">
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-400 hover:text-white"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1">
          {routes.map((r) => {
            const Icon = r.icon;
            const active = pathname === r.path;

            return (
              <Link
                key={r.path}
                href={r.path}
                className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all
                ${
                  active
                    ? "bg-[#1f1f1f] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1d1d1d]"
                }
                `}
              >
                {/* Active indicator */}
                <div
                  className={`absolute left-0 w-1 h-6 rounded-r
                  ${active ? "bg-[#FF1801]" : "bg-transparent"}`}
                />

                <Icon className="w-5 h-5 shrink-0" />

                {isExpanded && (
                  <span className="font-medium whitespace-nowrap">
                    {r.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
