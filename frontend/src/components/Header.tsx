import React from "react";

interface HeaderProps {
  isLive: boolean;
}

{
  /* <header className="flex justify-between items-end border-b border-[#333333] pb-4">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">Live from the pit wall</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1A1A1A] px-4 py-2 rounded border border-[#333] text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse"></span>
            SESSION LIVE
          </div>
        </div>
      </header> */

  {
    /* Top */
  }
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
}

export default function Header({ isLive }: { isLive: boolean }) {
  return (
    <header className="h-[86px] flex items-center justify-between px-6 border-b border-[#333333] bg-[#0A0A0A]">
      {/* Logo */}
      <div className="text-4xl font-black italic tracking-tight text-white">
        PIT<span className="text-[#FF1801]">WALL</span>{" "}
      </div>

      {/* Rigth Side */}
      <div className="flex items-center gap-4">
        {/* Live Status */}
        {isLive && (
          <div className="flex items-center gap-2 bg-[#E10600] px-3 py-1 rounded text-xs font-semibold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}

        {/* Profile */}
        <div className="w-12 h-12 rounded-full bg-[#2A2A2A]" />
      </div>
    </header>
  );
}
