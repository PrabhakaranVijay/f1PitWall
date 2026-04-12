import React from "react";

type DriverCardProps = {
  name: string;
  team: string;
  number: number;
  image: string;
  colors: [string, string]; // [primary, secondary]
};

const DriverCard: React.FC<DriverCardProps> = ({
  name,
  team,
  number,
  image,
  colors,
}) => {
  return (
    <div
      className="relative h-[420px] w-full rounded-2xl overflow-hidden flex items-end p-6"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      }}
    >
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Big Driver Number */}
      <div className="absolute left-10 top-10 text-white/10 text-[180px] font-extrabold leading-none select-none">
        {number}
      </div>

      {/* Slanted Accent */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 transform skew-x-[-20deg]" />

      {/* Driver Image */}
      <img
        src={image}
        alt={name}
        className="absolute right-0 bottom-0 h-[110%] object-contain pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 text-white">
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm opacity-80">{team}</p>
      </div>
    </div>
  );
};

export default DriverCard;
